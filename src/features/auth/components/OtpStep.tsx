import { useState, useEffect } from 'react';
import { OtpInput } from '../../../components/ui/OtpInput';
import { useVerifyOtp } from '../hooks/useVerifyOtp';
import { useInitiateRegister } from '../hooks/useInitiateRegister';
import { Button } from '../../../components/ui/Button';
import type { AxiosError } from 'axios';

interface OtpStepProps {
  email: string;
  resendAllowedAt: string;
  onSuccess: (setupToken: string) => void;
  onBack: () => void;
}

function useCountdown(targetIso: string) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const calcRemaining = () =>
      Math.max(0, Math.ceil((new Date(targetIso).getTime() - Date.now()) / 1000));

    // Set initial value asynchronously to satisfy React Compiler purity rules
    const immediate = setTimeout(() => setSeconds(calcRemaining()), 0);

    const timer = setInterval(() => {
      const remaining = calcRemaining();
      setSeconds(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);

    return () => {
      clearTimeout(immediate);
      clearInterval(timer);
    };
  }, [targetIso]);

  return seconds;
}

export function OtpStep({ email, resendAllowedAt: initialResendAt, onSuccess, onBack }: OtpStepProps) {
  const [otp, setOtp] = useState('');
  const [resendTarget, setResendTarget] = useState(initialResendAt);
  const countdown = useCountdown(resendTarget);
  const { mutate: verifyOtp, isPending, error } = useVerifyOtp();
  const { mutate: resend, isPending: isResending } = useInitiateRegister();

  const handleVerify = () => {
    if (otp.length !== 6) return;
    verifyOtp({ email, otp }, { onSuccess: (data) => onSuccess(data.setupToken) });
  };

  const handleResend = () => {
    resend(email, {
      onSuccess: (data) => {
        setOtp('');
        setResendTarget(data.resendAllowedAt);
      },
    });
  };

  const apiError = (error as AxiosError<{ message?: string }>)?.response?.data?.message;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Check your email</h2>
        <p className="text-slate-500 mt-2">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-slate-700">{email}</span>
        </p>
      </div>

      <div className="space-y-6">
        <OtpInput value={otp} onChange={setOtp} disabled={isPending} />

        {apiError && (
          <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}

        <Button
          onClick={handleVerify}
          disabled={otp.length !== 6}
          loading={isPending}
          fullWidth
          size="lg"
        >
          Verify code
        </Button>

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
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-60 transition-colors"
            >
              {isResending ? 'Sending...' : 'Resend code'}
            </button>
          )}
        </div>

        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Use a different email
        </button>
      </div>
    </div>
  );
}
