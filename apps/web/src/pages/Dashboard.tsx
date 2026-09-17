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
import { useApplications } from '@/hooks/useApplications';
import { useAuthStore } from '@/store/auth';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: pipeline, isLoading: pipelineLoading } = usePipelineConversion();
  const { data: applications, isLoading: appsLoading } = useApplications(5);

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

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          label="Active Jobs"
          value={overview?.activeJobs ?? 0}
          icon={Briefcase}
          accent="blue"
          loading={overviewLoading}
        />
        <StatCard
          label="Candidates"
          value={overview?.totalCandidates ?? 0}
          icon={Users}
          accent="violet"
          loading={overviewLoading}
        />
        <StatCard
          label="Applications"
          value={overview?.totalApplications ?? 0}
          icon={FileText}
          accent="amber"
          loading={overviewLoading}
        />
        <StatCard
          label="Interviews"
          value={overview?.totalInterviews ?? 0}
          icon={Calendar}
          accent="emerald"
          loading={overviewLoading}
        />
        <StatCard
          label="Hires"
          value={overview?.totalHires ?? 0}
          icon={CheckCircle2}
          accent="default"
          loading={overviewLoading}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Pipeline funnel */}
        <div className="glass-card rounded-xl p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Hiring Pipeline</h2>
            <span className="text-xs text-muted-foreground">
              {pipeline?.total ?? 0} total
            </span>
          </div>
          <PipelineFunnel data={pipeline} loading={pipelineLoading} />
        </div>

        {/* Recent applications */}
        <div className="glass-card rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Applications</h2>
            <a href="/candidates" className="text-xs text-primary hover:underline">
              View all
            </a>
          </div>
          <RecentApplications applications={applications} loading={appsLoading} />
        </div>
      </div>

      {/* Attention required */}
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
