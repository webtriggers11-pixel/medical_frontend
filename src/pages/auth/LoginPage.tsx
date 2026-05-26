import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '../../features/auth/hooks/useLogin';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { AxiosError } from 'axios';

interface FormData {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const { mutate, isPending, error } = useLogin();

  const onSubmit = (data: FormData) => {
    mutate(data, { onSuccess: () => navigate('/dashboard') });
  };

  const apiError = (error as AxiosError<{ message?: string }>)?.response?.data?.message;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
        <p className="text-slate-500 mt-2">Sign in to your account to continue</p>
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

        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password?.message}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          }
          {...register('password', { required: 'Password is required' })}
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
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}
