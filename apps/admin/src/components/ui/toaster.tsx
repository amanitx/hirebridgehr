import { useToastStore } from './toast';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function Toaster() {
  const { toasts, remove } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'glass-card rounded-lg p-4 shadow-lg flex items-start justify-between gap-3 animate-fade-in',
            t.variant === 'destructive' && 'border-destructive/40 bg-destructive/10',
            t.variant === 'success' && 'border-emerald-500/40 bg-emerald-500/10',
          )}
        >
          <div className="flex-1">
            <p className="text-sm font-medium">{t.title}</p>
            {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
          </div>
          <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
