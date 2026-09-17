import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  KanbanSquare,
  Calendar,
  BarChart3,
  Settings,
  X,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/candidates', label: 'Candidates', icon: Users },
  { to: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { to: '/interviews', label: 'Interviews', icon: Calendar },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { organizations, currentOrganizationId } = useAuthStore();
  const currentOrg = organizations.find((o) => o.id === currentOrganizationId);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 glass-sidebar flex flex-col transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/20 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">HirebridgeHR</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Org badge */}
        {currentOrg && (
          <div className="px-4 py-3 border-b border-white/20 dark:border-white/5">
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-white/40 dark:bg-white/5">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{currentOrg.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {currentOrg.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-white/60 dark:hover:bg-white/5 hover:text-foreground',
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/20 dark:border-white/5">
          <p className="text-[10px] text-muted-foreground text-center">
            HirebridgeHR v0.1.0
          </p>
        </div>
      </aside>
    </>
  );
}
