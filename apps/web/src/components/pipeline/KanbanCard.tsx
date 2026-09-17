import { Link } from 'react-router-dom';
import { Application } from '@/types';
import { relativeTime } from '@/lib/utils';

export function KanbanCard({ application }: { application: Application }) {
  const initials = application.candidate.name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Link
      to={`/candidates/${application.candidate.id}`}
      className="block p-3 rounded-lg bg-white/80 dark:bg-white/5 border border-white/60 dark:border-white/10 hover:shadow-md hover:border-primary/30 transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start gap-2">
        <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
          <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
            {initials}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{application.candidate.name}</p>
          <p className="text-xs text-muted-foreground truncate">{application.job.title}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
        <span>{application.source}</span>
        <span>{relativeTime(application.appliedAt)}</span>
      </div>

      {application.candidate.skills && application.candidate.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {application.candidate.skills.slice(0, 3).map((s) => (
            <span
              key={s}
              className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
