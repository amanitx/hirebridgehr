import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Toaster } from '@/components/ui/toaster';
import { AdminLayout } from '@/components/layout/AdminLayout';
import LoginPage from '@/pages/Login';
import DashboardPage from '@/pages/Dashboard';
import QueuePage from '@/pages/Queue';
import DistributionsPage from '@/pages/Distributions';
import OrganizationsListPage from '@/pages/organizations/List';
import OrganizationDetailPage from '@/pages/organizations/Detail';
import AnalyticsPage from '@/pages/Analytics';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  if (!isAuth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  if (isAuth) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/distributions" element={<DistributionsPage />} />
          <Route path="/organizations" element={<OrganizationsListPage />} />
          <Route path="/organizations/:id" element={<OrganizationDetailPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
