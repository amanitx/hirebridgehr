import { StatCard } from '@/components/dashboard/StatCard';
import { PipelineFunnel } from '@/components/dashboard/PipelineFunnel';
import { Briefcase, Users, FileText, Calendar, CheckCircle2 } from 'lucide-react';
import { useAnalyticsOverview, usePipelineConversion, useSourceBreakdown } from '@/hooks/useAnalytics';

export default function AnalyticsPage() {
  const { data: overview, isLoading: loading1 } = useAnalyticsOverview();
  const { data: pipeline, isLoading: loading2 } = usePipelineConversion();
  const { data: sources, isLoading: loading3 } = useSourceBreakdown();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Hiring insights and conversion metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard label="Active Jobs" value={overview?.activeJobs ?? 0} icon={Briefcase} accent="blue" loading={loading1} />
        <StatCard label="Candidates" value={overview?.totalCandidates ?? 0} icon={Users} accent="violet" loading={loading1} />
        <StatCard label="Applications" value={overview?.totalApplications ?? 0} icon={FileText} accent="amber" loading={loading1} />
        <StatCard label="Interviews" value={overview?.totalInterviews ?? 0} icon={Calendar} accent="emerald" loading={loading1} />
        <StatCard label="Hires" value={overview?.totalHires ?? 0} icon={CheckCircle2} loading={loading1} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5">
          <h2 className="font-semibold mb-4">Pipeline Conversion</h2>
          <PipelineFunnel data={pipeline} loading={loading2} />
        </div>

        <div className="glass-card rounded-xl p-5">
          <h2 className="font-semibold mb-4">Applications by Source</h2>
          {loading3 ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 bg-muted/40 rounded animate-pulse" />
              ))}
            </div>
          ) : !sources || sources.sources.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet</p>
          ) : (
            <div className="space-y-3">
              {sources.sources.map((s) => (
                <div key={s.source}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium">{s.source}</span>
                    <span className="text-muted-foreground">
                      {s.count} ({s.percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/40 dark:bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all"
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
