import { useState } from 'react';
import { EmailStep } from '../../features/auth/components/EmailStep';
import { OtpStep } from '../../features/auth/components/OtpStep';
import { PasswordStep } from '../../features/auth/components/PasswordStep';

type Step = 'email' | 'otp' | 'password';

const steps = [
  { key: 'email', label: 'Email' },
  { key: 'otp', label: 'Verify' },
  { key: 'password', label: 'Password' },
];

export function RegisterPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [resendAllowedAt, setResendAllowedAt] = useState('');
  const [setupToken, setSetupToken] = useState('');

  const stepIndex = step === 'email' ? 0 : step === 'otp' ? 1 : 2;

  return (
    <div className="animate-fade-in">
      {/* Step indicator */}
      <div className="flex items-center mb-10">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  i < stepIndex
                    ? 'bg-primary-600 text-white'
                    : i === stepIndex
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {i < stepIndex ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs mt-2 font-medium transition-colors ${
                  i <= stepIndex ? 'text-primary-600' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 mb-6 rounded-full transition-colors duration-300 ${
                  i < stepIndex ? 'bg-primary-600' : 'bg-slate-200'
                }`}
              />
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
}
