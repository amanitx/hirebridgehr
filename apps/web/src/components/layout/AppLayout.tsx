import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Background decoration — subtle */}
      <div className="fixed inset-0 -z-10 opacity-30 dark:opacity-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-purple-400/10 blur-3xl" />
      </div>

      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <Header onOpenMobile={() => setMobileOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
