import { useForm } from 'react-hook-form';
import { useInitiateRegister } from '../hooks/useInitiateRegister';

interface EmailStepProps {
  onSuccess: (email: string, resendAllowedAt: string) => void;
}

export const EmailStep = ({ onSuccess }: EmailStepProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>();
  const { mutate, isPending, error } = useInitiateRegister();

  const onSubmit = ({ email }: { email: string }) => {
    mutate(email, { onSuccess: (data) => onSuccess(email, data.resendAllowedAt) });
  };

  const apiError = (error as any)?.response?.data?.message;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Create your account</h2>
        <p className="text-sm text-slate-500 mt-1">Enter your email to get started</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Email address
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        {apiError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
        >
          {isPending ? 'Sending code...' : 'Send verification code'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
          Sign in
        </a>
      </p>
    </div>
  );
};
