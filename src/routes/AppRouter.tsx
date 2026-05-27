import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { UsersPage } from '../pages/admin/UsersPage';
import { CompaniesPage } from '../pages/admin/CompaniesPage';
import { OrganizationPage } from '../pages/admin/OrganizationPage';
import { ZonesPage } from '../pages/admin/ZonesPage';
import { CitiesPage } from '../pages/admin/CitiesPage';
import { StoresPage } from '../pages/admin/StoresPage';
import { LabsPage } from '../pages/admin/LabsPage';
import { PanelsPage } from '../pages/admin/PanelsPage';
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
            <Route path="/admin/companies" element={<CompaniesPage />} />
            <Route path="/admin/organization" element={<OrganizationPage />} />
            <Route path="/admin/zones" element={<ZonesPage />} />
            <Route path="/admin/cities" element={<CitiesPage />} />
            <Route path="/admin/stores" element={<StoresPage />} />
            <Route path="/admin/labs" element={<LabsPage />} />
            <Route path="/admin/panels" element={<PanelsPage />} />
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
