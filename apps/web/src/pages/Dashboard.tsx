import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  FileText,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { PipelineFunnel } from '@/components/dashboard/PipelineFunnel';
import { RecentApplications } from '@/components/dashboard/RecentApplications';
import { AttentionRequired } from '@/components/dashboard/AttentionRequired';
import { useAnalyticsOverview, usePipelineConversion } from '@/hooks/useAnalytics';
import { useRecentApplications } from '@/hooks/useDashboardApplications';
import { useAuthStore } from '@/store/auth';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: pipeline, isLoading: pipelineLoading } = usePipelineConversion();
  const { data: applications, isLoading: appsLoading } = useRecentApplications(5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here's what's happening with your hiring pipeline today.
        </p>
      </div>

      {/* Stat cards — all clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Link to="/jobs" className="block">
          <StatCard
            label="Active Jobs"
            value={overview?.activeJobs ?? 0}
            icon={Briefcase}
            accent="blue"
            loading={overviewLoading}
          />
        </Link>
        <Link to="/candidates" className="block">
          <StatCard
            label="Candidates"
            value={overview?.totalCandidates ?? 0}
            icon={Users}
            accent="violet"
            loading={overviewLoading}
          />
        </Link>
        <Link to="/candidates" className="block">
          <StatCard
            label="Applications"
            value={overview?.totalApplications ?? 0}
            icon={FileText}
            accent="amber"
            loading={overviewLoading}
          />
        </Link>
        <Link to="/interviews" className="block">
          <StatCard
            label="Interviews"
            value={overview?.totalInterviews ?? 0}
            icon={Calendar}
            accent="emerald"
            loading={overviewLoading}
          />
        </Link>
        <Link to="/pipeline" className="block">
          <StatCard
            label="Hires"
            value={overview?.totalHires ?? 0}
            icon={CheckCircle2}
            accent="default"
            loading={overviewLoading}
          />
        </Link>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Pipeline funnel — click to pipeline */}
        <Link to="/pipeline" className="lg:col-span-1 block">
          <div className="glass-card rounded-xl p-5 h-full hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Hiring Pipeline</h2>
              <span className="text-xs text-muted-foreground">
                {pipeline?.total ?? 0} total
              </span>
            </div>
            <PipelineFunnel data={pipeline} loading={pipelineLoading} />
          </div>
        </Link>

        {/* Recent applications — click to candidates */}
        <div className="glass-card rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Applications</h2>
            <Link to="/candidates" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <RecentApplications applications={applications} loading={appsLoading} />
        </div>
      </div>

      {/* Attention Required */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="font-semibold mb-4">Attention Required</h2>
        <AttentionRequired
          newApplications={0}
          pendingReviews={applications?.filter((a) => a.status === 'NEW').length || 0}
          upcomingInterviews={overview?.totalInterviews || 0}
          pendingFeedback={0}
          lowApplicationJobs={0}
        />
      </div>
    </div>
  );
}