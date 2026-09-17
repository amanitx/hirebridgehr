import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Briefcase, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { user, organizations, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">HirebridgeHR</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.name}
        </p>

        {organizations.length > 0 && (
          <div className="glass-card rounded-xl p-6 mt-6">
            <h2 className="font-medium mb-2">Your organizations</h2>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {organizations.map((o) => (
                <li key={o.id}>
                  {o.name} ({o.type}) — {o.role}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          Batch 9B mein full dashboard aayega — sidebar, stats, pipeline, recent applications.
        </p>
      </main>
    </div>
  );
}
