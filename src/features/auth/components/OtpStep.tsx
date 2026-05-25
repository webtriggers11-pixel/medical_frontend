import { useState, useEffect } from 'react';
import { OtpInput } from '../../../components/ui/OtpInput';
import { useVerifyOtp } from '../hooks/useVerifyOtp';
import { useInitiateRegister } from '../hooks/useInitiateRegister';

interface OtpStepProps {
  email: string;
  resendAllowedAt: string;
  onSuccess: (setupToken: string) => void;
  onBack: () => void;
}

export const OtpStep = ({ email, resendAllowedAt, onSuccess, onBack }: OtpStepProps) => {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const { mutate: verifyOtp, isPending, error } = useVerifyOtp();
  const { mutate: resend, isPending: isResending } = useInitiateRegister();

  useEffect(() => {
    const remaining = Math.max(0, Math.ceil((new Date(resendAllowedAt).getTime() - Date.now()) / 1000));
    setCountdown(remaining);
  }, [resendAllowedAt]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = () => {
    if (otp.length !== 6) return;
    verifyOtp({ email, otp }, { onSuccess: (data) => onSuccess(data.setupToken) });
  };

  const handleResend = () => {
    resend(email, {
      onSuccess: (data) => {
        setOtp('');
        const remaining = Math.ceil((new Date(data.resendAllowedAt).getTime() - Date.now()) / 1000);
        setCountdown(remaining);
      },
    });
  };

  const apiError = (error as any)?.response?.data?.message;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Check your email</h2>
        <p className="text-sm text-slate-500 mt-1">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-slate-700">{email}</span>
        </p>
      </div>

      <div className="space-y-5">
        <OtpInput value={otp} onChange={setOtp} disabled={isPending} />

        {apiError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={otp.length !== 6 || isPending}
          className="w-full flex justify-center items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Verifying...' : 'Verify code'}
        </button>

        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-sm text-slate-500">
              Resend code in{' '}
              <span className="font-semibold text-slate-700 tabular-nums">{countdown}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-60 transition-colors"
            >
              {isResending ? 'Sending...' : 'Resend code'}
            </button>
          )}
        </div>

        <button
          onClick={onBack}
          className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← Use a different email
        </button>
      </div>
    </div>
  );
};
