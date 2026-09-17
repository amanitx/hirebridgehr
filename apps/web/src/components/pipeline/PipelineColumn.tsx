import { Application, ApplicationStatus } from '@/types';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

const stageConfig: Record<
  string,
  { label: string; accent: string; dot: string }
> = {
  NEW: { label: 'New', accent: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  SCREENING: { label: 'Screening', accent: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  SHORTLISTED: { label: 'Shortlisted', accent: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500' },
  INTERVIEW: { label: 'Interview', accent: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
  OFFER: { label: 'Offer', accent: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-500' },
  HIRED: { label: 'Hired', accent: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  REJECTED: { label: 'Rejected', accent: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  WITHDRAWN: { label: 'Withdrawn', accent: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-500' },
};

export function PipelineColumn({
  stage,
  count,
  candidates,
  onDrop,
  onDragOver,
  isOver,
}: {
  stage: ApplicationStatus;
  count: number;
  candidates: Application[];
  onDrop: (stage: ApplicationStatus) => void;
  onDragOver: (e: React.DragEvent) => void;
  isOver: boolean;
}) {
  const config = stageConfig[stage] || { label: stage, accent: '', dot: 'bg-gray-500' };

  return (
    <div
      onDrop={() => onDrop(stage)}
      onDragOver={onDragOver}
      className={cn(
        'flex flex-col min-w-[280px] w-[280px] rounded-xl transition-all',
        'bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10',
        isOver && 'ring-2 ring-primary ring-offset-2 bg-primary/5',
      )}
    >
      {/* Header */}
      <div className="p-3 border-b border-white/20 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full', config.dot)} />
            <span className={cn('text-sm font-semibold', config.accent)}>
              {config.label}
            </span>
          </div>
          <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
            {count}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] max-h-[calc(100vh-260px)]">
        {candidates.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground">
            Drop candidates here
          </div>
        ) : (
          candidates.map((app) => (
            <div
              key={app.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('applicationId', app.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
            >
              <KanbanCard application={app} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
