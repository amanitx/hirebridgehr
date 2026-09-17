import { Link } from 'react-router-dom';
import { Application, ApplicationStatus } from '@/types';
import { relativeTime, cn } from '@/lib/utils';

const moveOptions: Array<{ status: ApplicationStatus; label: string; color: string }> = [
  { status: 'NEW', label: 'New', color: 'bg-blue-500' },
  { status: 'SCREENING', label: 'Screening', color: 'bg-amber-500' },
  { status: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-violet-500' },
  { status: 'INTERVIEW', label: 'Interview', color: 'bg-purple-500' },
  { status: 'OFFER', label: 'Offer', color: 'bg-indigo-500' },
  { status: 'HIRED', label: 'Hired', color: 'bg-emerald-500' },
  { status: 'REJECTED', label: 'Rejected', color: 'bg-red-500' },
];

export function KanbanCard({
  application,
  onMove,
}: {
  application: Application;
  onMove?: (status: ApplicationStatus) => void;
}) {
  const initials = application.candidate.name
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const currentStage = application.status;

  return (
    <div className="relative group">
      {/* Card body — clickable to open candidate */}
      <Link
        to={`/candidates/${application.candidate.id}`}
        className="block p-3 rounded-lg bg-white/80 dark:bg-white/5 border border-white/60 dark:border-white/10 hover:shadow-md hover:border-primary/30 transition-all"
      >
        <div className="flex items-start gap-2">
          <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
              {initials}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate pr-6">
              {application.candidate.name}
            </p>
            {application.job?.title && (
              <p className="text-xs text-muted-foreground truncate">
                {application.job.title}
              </p>
            )}
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

      {/* Move menu — floating on hover/click */}
      {onMove && (
        <details className="absolute top-2 right-2 z-20">
          <summary className="list-none cursor-pointer h-6 w-6 rounded-md bg-white/80 dark:bg-black/40 border border-white/60 dark:border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black/60">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </summary>
          <div className="absolute right-0 top-7 z-30 w-44 glass-card rounded-xl shadow-xl py-1 border border-white/40 dark:border-white/10">
            <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Move to
            </p>
            {moveOptions
              .filter((o) => o.status !== currentStage)
              .map((o) => (
                <button
                  key={o.status}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMove(o.status);
                    (e.currentTarget.closest('details') as HTMLDetailsElement).open = false;
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-white/60 dark:hover:bg-white/5 text-left"
                >
                  <span className={cn('h-2 w-2 rounded-full', o.color)} />
                  {o.label}
                </button>
              ))}
          </div>
        </details>
      )}
    </div>
  );
}