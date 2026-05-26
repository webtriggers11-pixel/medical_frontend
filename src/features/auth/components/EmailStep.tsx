import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useInitiateRegister } from '../hooks/useInitiateRegister';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import type { AxiosError } from 'axios';

interface EmailStepProps {
  onSuccess: (email: string, resendAllowedAt: string) => void;
}

export function EmailStep({ onSuccess }: EmailStepProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>();
  const { mutate, isPending, error } = useInitiateRegister();

  const onSubmit = ({ email }: { email: string }) => {
    mutate(email, { onSuccess: (data) => onSuccess(email, data.resendAllowedAt) });
  };

  const apiError = (error as AxiosError<{ message?: string }>)?.response?.data?.message;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h2>
        <p className="text-slate-500 mt-2">Enter your email to get started</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          }
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
          })}
        />

        {apiError && (
          <div className="flex items-center gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}

        <Button type="submit" loading={isPending} fullWidth size="lg">
          {isPending ? 'Sending code...' : 'Send verification code'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
