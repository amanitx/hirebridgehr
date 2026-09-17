import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Menu,
  LogOut,
  User as UserIcon,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { useNotifications, useUnreadCount, useMarkAllRead } from '@/hooks/useNotifications';
import { cn, relativeTime } from '@/lib/utils';

export function Header({ onOpenMobile }: { onOpenMobile: () => void }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAllRead = useMarkAllRead();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 glass-header sticky top-0 z-30">
      <div className="h-full px-4 sm:px-6 flex items-center gap-4">
        {/* Mobile menu */}
        <button
          onClick={onOpenMobile}
          className="lg:hidden text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates, jobs..."
              className="pl-9 bg-white/40 dark:bg-white/5 border-white/40 dark:border-white/10"
            />
          </div>
        </div>

        <div className="flex-1 md:hidden" />

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setUserMenuOpen(false);
            }}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-semibold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 glass-card rounded-xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-white/5">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead.mutate()}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    <ul className="divide-y divide-white/10 dark:divide-white/5">
                      {notifications.slice(0, 10).map((n) => (
                        <li
                          key={n.id}
                          className={cn(
                            'p-4 hover:bg-white/40 dark:hover:bg-white/5 cursor-pointer',
                            !n.read && 'bg-blue-50/40 dark:bg-blue-950/20',
                          )}
                        >
                          <p className="text-sm font-medium">{n.title}</p>
                          {n.body && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {n.body}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {relativeTime(n.createdAt)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium leading-tight">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{user?.email}</p>
            </div>
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-12 z-50 w-56 glass-card rounded-xl shadow-xl overflow-hidden">
                <div className="p-3 border-b border-white/20 dark:border-white/5">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/40 dark:hover:bg-white/5"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
