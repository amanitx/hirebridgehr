import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useNotifications, useMarkRead, useMarkAllRead } from '@/hooks/useNotifications';
import { cn, relativeTime } from '@/lib/utils';

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={() => markAll.mutate()}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="glass-card rounded-xl p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="glass-card rounded-xl">
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden divide-y divide-white/10 dark:divide-white/5">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.read && markRead.mutate(n.id)}
              className={cn(
                'w-full text-left p-4 hover:bg-white/40 dark:hover:bg-white/5 transition-colors',
                !n.read && 'bg-blue-50/40 dark:bg-blue-950/20',
              )}
            >
              <div className="flex items-start gap-3">
                {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />}
                <div className={cn('flex-1', n.read && 'ml-5')}>
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">{relativeTime(n.createdAt)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
