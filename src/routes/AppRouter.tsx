import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ClientsPage } from '../pages/admin/ClientsPage';
import { ClientDetailPage } from '../pages/admin/ClientDetailPage';
import { BookingRequestsPage } from '../pages/admin/BookingRequestsPage';
import { BookLabPage } from '../pages/admin/BookLabPage';
import { ZonesPage } from '../pages/admin/ZonesPage';
import { CitiesPage } from '../pages/admin/CitiesPage';
import { ZoneCityPage } from '../pages/admin/ZoneCityPage';
import { StoresPage } from '../pages/admin/StoresPage';
import { AddStorePage } from '../pages/admin/AddStorePage';
import { LabsPage } from '../pages/admin/LabsPage';
import { PanelsPage } from '../pages/admin/PanelsPage';
import { TestMasterPage } from '../pages/admin/TestMasterPage';
import { StatsPage } from '../pages/admin/StatsPage';
import { ExportPage } from '../pages/admin/ExportPage';
import { CandidatesPage } from '../pages/candidates/CandidatesPage';
import { CandidateDetailPage } from '../pages/candidates/CandidateDetailPage';
import { AddCandidatePage } from '../pages/candidates/AddCandidatePage';
import { ReportsPage } from '../pages/reports/ReportsPage';
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
            <Route path="/admin/clients" element={<ClientsPage />} />
            <Route path="/admin/clients/:id" element={<ClientDetailPage />} />
            <Route path="/admin/booking-requests" element={<BookingRequestsPage />} />
            <Route path="/admin/book-lab" element={<BookLabPage />} />
            <Route path="/admin/zones" element={<ZonesPage />} />
            <Route path="/admin/cities" element={<CitiesPage />} />
            <Route path="/admin/zone-city" element={<ZoneCityPage />} />
            <Route path="/admin/stores" element={<StoresPage />} />
            <Route path="/admin/stores/new" element={<AddStorePage />} />
            <Route path="/admin/labs" element={<LabsPage />} />
            <Route path="/admin/panels" element={<PanelsPage />} />
            <Route path="/admin/tests" element={<TestMasterPage />} />
            <Route path="/admin/stats" element={<StatsPage />} />
            <Route path="/admin/export" element={<ExportPage />} />
          </Route>

          {/* User-only routes */}
          <Route element={<RoleRoute allowedRoles={ROLE_GROUPS.userOnly} />}>
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/candidates/new" element={<AddCandidatePage />} />
            <Route path="/candidates/:id" element={<CandidateDetailPage />} />
            <Route path="/stores" element={<StoresPage />} />
            <Route path="/stores/new" element={<AddStorePage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);
