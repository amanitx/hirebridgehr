import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      {/* Liquid glass background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      <div className="absolute inset-0 -z-10 opacity-40 dark:opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-400/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-semibold tracking-tight">HirebridgeHR</span>
        </Link>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {children}
        </div>

        {footer && (
          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
        )}
      </div>
    </div>
  );
}
