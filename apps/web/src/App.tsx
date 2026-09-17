import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/layout/AppLayout';
import LoginPage from '@/pages/Login';
import SignupPage from '@/pages/Signup';
import ForgotPasswordPage from '@/pages/ForgotPassword';
import ResetPasswordPage from '@/pages/ResetPassword';
import VerifyEmailPage from '@/pages/VerifyEmail';
import DashboardPage from '@/pages/Dashboard';
import JobsListPage from '@/pages/jobs/List';
import JobDetailPage from '@/pages/jobs/Detail';
import CandidatesListPage from '@/pages/candidates/List';
import CandidateDetailPage from '@/pages/candidates/Detail';
import InterviewsListPage from '@/pages/interviews/List';
import PipelinePage from '@/pages/Pipeline';
import AnalyticsPage from '@/pages/Analytics';
import SettingsPage from '@/pages/settings/Settings';
import NotificationsPage from '@/pages/Notifications';

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
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/jobs" element={<JobsListPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/candidates" element={<CandidatesListPage />} />
          <Route path="/candidates/:id" element={<CandidateDetailPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/interviews" element={<InterviewsListPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}
