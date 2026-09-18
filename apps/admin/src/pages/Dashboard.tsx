import { Link } from 'react-router-dom';
import { Building2, Users, Briefcase, FileText, Inbox, ArrowRight, Send } from 'lucide-react';
import { usePlatformStats } from '@/hooks/useAdmin';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = usePlatformStats();

  const cards = [
    {
      label: 'Organizations',
      value: stats?.totalOrganizations,
      icon: Building2,
      accent: 'bg-blue-500/10 text-blue-600',
      link: '/organizations',
    },
    {
      label: 'Users',
      value: stats?.totalUsers,
      icon: Users,
      accent: 'bg-violet-500/10 text-violet-600',
      link: '/organizations',
      hint: 'View per organization',
    },
    {
      label: 'Jobs',
      value: stats?.totalJobs,
      icon: Briefcase,
      accent: 'bg-emerald-500/10 text-emerald-600',
      link: '/distributions',
      hint: 'See distributions',
    },
    {
      label: 'Applications',
      value: stats?.totalApplications,
      icon: FileText,
      accent: 'bg-amber-500/10 text-amber-600',
      link: null,
      hint: null,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Platform Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of HirebridgeHR operations</p>
      </div>

      {/* Pending publications alert */}
      {stats && stats.pendingDistributions > 0 && (
        <Link
          to="/queue"
          className="glass-card rounded-xl p-4 flex items-center gap-3 border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
        >
          <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Inbox className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">
              {stats.pendingDistributions} job{stats.pendingDistributions > 1 ? 's' : ''} waiting for publication
            </p>
            <p className="text-xs text-muted-foreground">Review publishing queue</p>
          </div>
          <ArrowRight className="h-4 w-4 text-amber-600" />
        </Link>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const CardWrapper = c.link ? Link : 'div';
          const wrapperProps = c.link ? { to: c.link } : {};

          return (
            <CardWrapper
              key={c.label}
              {...(wrapperProps as any)}
              className={`glass-card rounded-xl p-5 ${
                c.link ? 'hover:shadow-md transition-shadow cursor-pointer' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {c.label}
                  </p>
                  <p className="text-2xl font-semibold mt-2">
                    {isLoading ? '—' : c.value ?? 0}
                  </p>
                  {c.hint && (
                    <p className="text-[10px] text-muted-foreground mt-1">{c.hint}</p>
                  )}
                </div>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${c.accent}`}>
                  <c.icon className="h-5 w-5" />
                </div>
              </div>
            </CardWrapper>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/queue"
            className="flex items-center gap-3 p-4 rounded-lg bg-white/40 hover:bg-white/60 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Inbox className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Publishing Queue</p>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingDistributions ?? 0} pending
              </p>
            </div>
          </Link>

          <Link
            to="/distributions"
            className="flex items-center gap-3 p-4 rounded-lg bg-white/40 hover:bg-white/60 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">All Distributions</p>
              <p className="text-xs text-muted-foreground">View all job postings</p>
            </div>
          </Link>

          <Link
            to="/organizations"
            className="flex items-center gap-3 p-4 rounded-lg bg-white/40 hover:bg-white/60 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Organizations</p>
              <p className="text-xs text-muted-foreground">
                {stats?.totalOrganizations ?? 0} customers
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}