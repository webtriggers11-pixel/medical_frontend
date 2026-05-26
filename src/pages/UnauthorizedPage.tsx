import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <p className="text-7xl font-bold text-slate-200 mb-4 tracking-tight">403</p>
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Access denied</h1>
        <p className="text-slate-500 mb-8">You don't have permission to view this page. Contact your administrator if you think this is an error.</p>
        <Link to="/dashboard">
          <Button
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            }
          >
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
