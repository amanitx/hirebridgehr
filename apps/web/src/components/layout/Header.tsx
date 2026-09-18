import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Menu,
  LogOut,
  User as UserIcon,
  Search,
  Briefcase,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { useNotifications, useUnreadCount, useMarkAllRead } from '@/hooks/useNotifications';
import { useCandidates } from '@/hooks/useCandidates';
import { useJobs } from '@/hooks/useJobs';
import { cn, relativeTime } from '@/lib/utils';

export function Header({ onOpenMobile }: { onOpenMobile: () => void }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAllRead = useMarkAllRead();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: candidatesData, isLoading: candidatesLoading } = useCandidates({
    search: debouncedQuery || undefined,
    limit: 5,
  });
  const { data: jobsData, isLoading: jobsLoading } = useJobs({
    search: debouncedQuery || undefined,
    limit: 5,
  });

  const hasResults =
    debouncedQuery.length >= 2 &&
    ((candidatesData?.data?.length ?? 0) > 0 || (jobsData?.data?.length ?? 0) > 0);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToCandidate = (id: string) => {
    setSearchQuery('');
    setSearchOpen(false);
    navigate(`/candidates/${id}`);
  };

  const goToJob = (id: string) => {
    setSearchQuery('');
    setSearchOpen(false);
    navigate(`/jobs/${id}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  return (
    <header className="h-16 glass-header sticky top-0 z-30">
      {/* Full-width flex with 3 sections: left | center | right */}
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">

        {/* ============ LEFT: Menu + Search ============ */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onOpenMobile}
            className="lg:hidden text-muted-foreground hover:text-foreground shrink-0"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div ref={searchRef} className="hidden md:block w-full max-w-md relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                data-search-input
                placeholder="Search candidates, jobs... (Ctrl+K)"
                className="pl-9 pr-9 bg-white/40 dark:bg-white/5 border-white/40 dark:border-white/10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/60"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>

            {searchOpen && debouncedQuery.length >= 2 && (
              <div className="absolute top-12 left-0 right-0 z-50 glass-card rounded-xl shadow-xl overflow-hidden max-h-[60vh] overflow-y-auto">
                {candidatesLoading ? (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    Searching...
                  </div>
                ) : (
                  <>
                    {candidatesData?.data && candidatesData.data.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-white/10">
                          Candidates
                        </div>
                        {candidatesData.data.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => goToCandidate(c.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/40 text-left transition-colors"
                          >
                            <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                              <UsersIcon className="h-3.5 w-3.5 text-violet-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{c.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {c.email || c.phone || 'No contact'}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {jobsData?.data && jobsData.data.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-t border-white/10">
                          Jobs
                        </div>
                        {jobsData.data.map((j) => (
                          <button
                            key={j.id}
                            onClick={() => goToJob(j.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/40 text-left transition-colors"
                          >
                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                              <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{j.title}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {j.location || 'No location'}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {!candidatesLoading && !jobsLoading && !hasResults && (
                      <div className="p-6 text-center text-sm text-muted-foreground">
                        No results for "{debouncedQuery}"
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ============ RIGHT: Notifications + Profile ============ */}
        <div className="flex items-center gap-2 shrink-0">

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
                  <div className="flex items-center justify-between p-4 border-b border-white/20">
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
                      <ul className="divide-y divide-white/10">
                        {notifications.slice(0, 10).map((n) => (
                          <li
                            key={n.id}
                            className={cn(
                              'p-4 hover:bg-white/40 cursor-pointer',
                              !n.read && 'bg-blue-50/40',
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

          {/* Profile — always visible */}
          <div className="relative">
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/40 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-medium leading-tight">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{user?.email}</p>
              </div>
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-12 z-50 w-56 glass-card rounded-xl shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-white/20">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/40"
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
      </div>
    </header>
  );
}