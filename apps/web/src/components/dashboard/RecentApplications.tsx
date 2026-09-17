import { Link } from 'react-router-dom';
import { Application } from '@/types';
import { relativeTime, cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  SCREENING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  SHORTLISTED: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  INTERVIEW: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  OFFER: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  HIRED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  WITHDRAWN: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
};

export function RecentApplications({
  applications,
  loading,
}: {
  applications?: Application[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-muted/40 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No applications yet. Publish a job to start receiving candidates.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {applications.map((app) => (
        <Link
          key={app.id}
          to={`/candidates/${app.candidate.id}`}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
        >
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-primary">
              {app.candidate.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{app.candidate.name}</p>
            <p className="text-xs text-muted-foreground truncate">{app.job.title}</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={cn(
                'text-[10px] font-medium px-2 py-0.5 rounded-full border',
                statusColors[app.status] || statusColors.NEW,
              )}
            >
              {app.status}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {relativeTime(app.appliedAt)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
