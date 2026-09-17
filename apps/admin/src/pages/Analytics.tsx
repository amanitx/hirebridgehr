import { Building2, Users, Briefcase, FileText, Inbox } from 'lucide-react';
import { usePlatformStats, useAllDistributions } from '@/hooks/useAdmin';

export default function AnalyticsPage() {
  const { data: stats, isLoading } = usePlatformStats();
  const { data: distributions } = useAllDistributions();

  const byPlatform = (distributions || []).reduce((acc: any, d: any) => {
    acc[d.platform] = (acc[d.platform] || 0) + 1;
    return acc;
  }, {});

  const byStatus = (distributions || []).reduce((acc: any, d: any) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});

  const cards = [
    { label: 'Organizations', value: stats?.totalOrganizations, icon: Building2, accent: 'bg-blue-500/10 text-blue-600' },
    { label: 'Users', value: stats?.totalUsers, icon: Users, accent: 'bg-violet-500/10 text-violet-600' },
    { label: 'Jobs', value: stats?.totalJobs, icon: Briefcase, accent: 'bg-emerald-500/10 text-emerald-600' },
    { label: 'Candidates', value: stats?.totalCandidates, icon: Users, accent: 'bg-cyan-500/10 text-cyan-600' },
    { label: 'Applications', value: stats?.totalApplications, icon: FileText, accent: 'bg-amber-500/10 text-amber-600' },
    { label: 'Pending Publish', value: stats?.pendingDistributions, icon: Inbox, accent: 'bg-red-500/10 text-red-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Platform Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">HirebridgeHR-wide metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="glass-card rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {c.label}
                </p>
                <p className="text-xl font-semibold mt-1.5">
                  {isLoading ? '—' : c.value ?? 0}
                </p>
              </div>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${c.accent}`}>
                <c.icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-5">
          <h2 className="font-semibold mb-4">Distributions by Platform</h2>
          {Object.keys(byPlatform).length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byPlatform).map(([k, v]: any) => (
                <div key={k} className="flex items-center justify-between p-3 rounded-lg bg-white/40">
                  <span className="text-sm font-medium">{k}</span>
                  <span className="text-sm font-semibold">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-xl p-5">
          <h2 className="font-semibold mb-4">Distributions by Status</h2>
          {Object.keys(byStatus).length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byStatus).map(([k, v]: any) => (
                <div key={k} className="flex items-center justify-between p-3 rounded-lg bg-white/40">
                  <span className="text-sm font-medium">{k.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-semibold">{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
