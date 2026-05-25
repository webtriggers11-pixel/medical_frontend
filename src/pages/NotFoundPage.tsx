import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <p className="text-6xl font-bold text-slate-200 mb-4">404</p>
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">Page not found</h1>
      <p className="text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
        Go home
      </Link>
    </div>
  </div>
);
