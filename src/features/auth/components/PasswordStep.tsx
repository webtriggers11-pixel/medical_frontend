import { useForm } from 'react-hook-form';
import { useCompleteRegister } from '../hooks/useCompleteRegister';
import { useNavigate } from 'react-router-dom';

interface FormData {
  password: string;
  confirmPassword: string;
}

interface PasswordStepProps {
  setupToken: string;
}

export const PasswordStep = ({ setupToken }: PasswordStepProps) => {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const { mutate, isPending, error } = useCompleteRegister();

  const onSubmit = ({ password }: FormData) => {
    mutate({ setupToken, password }, { onSuccess: () => navigate('/dashboard') });
  };

  const apiError = (error as any)?.response?.data?.message;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Set your password</h2>
        <p className="text-sm text-slate-500 mt-1">Choose a strong password for your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <input
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            className="block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Confirm password
          </label>
          <input
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val) => val === watch('password') || 'Passwords do not match',
            })}
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            className="block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword.message}</p>
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
          {isPending ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  );
};
