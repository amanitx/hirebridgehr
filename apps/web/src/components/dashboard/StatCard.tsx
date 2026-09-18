import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'default',
  loading,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: 'default' | 'blue' | 'emerald' | 'amber' | 'violet';
  loading?: boolean;
}) {
  const accents = {
    default: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  };

  return (
    <div className="glass-card rounded-xl p-5 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer h-full">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-semibold tracking-tight mt-2">
            {loading ? (
              <span className="inline-block h-7 w-12 bg-muted rounded animate-pulse" />
            ) : (
              value
            )}
          </p>
        </div>
        <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', accents[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}