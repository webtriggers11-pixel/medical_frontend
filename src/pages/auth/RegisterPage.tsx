import { useState } from 'react';
import { EmailStep } from '../../features/auth/components/EmailStep';
import { OtpStep } from '../../features/auth/components/OtpStep';
import { PasswordStep } from '../../features/auth/components/PasswordStep';

type Step = 'email' | 'otp' | 'password';

const STEP_LABELS = ['Email', 'Verify', 'Password'];

export const RegisterPage = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [resendAllowedAt, setResendAllowedAt] = useState('');
  const [setupToken, setSetupToken] = useState('');

  const stepIndex = step === 'email' ? 0 : step === 'otp' ? 1 : 2;

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                i < stepIndex
                  ? 'bg-blue-600 text-white'
                  : i === stepIndex
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {i < stepIndex ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${i === stepIndex ? 'text-blue-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-px mx-3 mb-5 transition-colors ${i < stepIndex ? 'bg-blue-600' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {step === 'email' && (
        <EmailStep
          onSuccess={(em, rat) => {
            setEmail(em);
            setResendAllowedAt(rat);
            setStep('otp');
          }}
        />
      )}
      {step === 'otp' && (
        <OtpStep
          email={email}
          resendAllowedAt={resendAllowedAt}
          onSuccess={(token) => {
            setSetupToken(token);
            setStep('password');
          }}
          onBack={() => setStep('email')}
        />
      )}
      {step === 'password' && <PasswordStep setupToken={setupToken} />}
    </div>
  );
};
