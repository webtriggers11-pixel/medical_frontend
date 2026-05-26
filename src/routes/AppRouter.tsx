import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { UsersPage } from '../pages/admin/UsersPage';
import { CandidatesPage } from '../pages/candidates/CandidatesPage';
import { ROLE_GROUPS } from '../config/roles';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Admin-only routes */}
          <Route element={<RoleRoute allowedRoles={ROLE_GROUPS.adminOnly} />}>
            <Route path="/admin/users" element={<UsersPage />} />
          </Route>

          {/* User-only routes */}
          <Route element={<RoleRoute allowedRoles={ROLE_GROUPS.userOnly} />}>
            <Route path="/candidates" element={<CandidatesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);
