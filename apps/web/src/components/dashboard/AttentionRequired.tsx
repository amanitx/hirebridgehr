import { Link } from 'react-router-dom';
import { AlertCircle, Calendar, Users, FileText, ArrowRight } from 'lucide-react';

interface Alert {
  icon: typeof AlertCircle;
  text: string;
  link: string;
  accent: 'amber' | 'blue' | 'violet' | 'red';
}

export function AttentionRequired({
  newApplications = 0,
  pendingReviews = 0,
  upcomingInterviews = 0,
  pendingFeedback = 0,
  lowApplicationJobs = 0,
}: {
  newApplications?: number;
  pendingReviews?: number;
  upcomingInterviews?: number;
  pendingFeedback?: number;
  lowApplicationJobs?: number;
}) {
  const alerts: Alert[] = [];

  if (newApplications > 0) {
    alerts.push({
      icon: Users,
      text: `${newApplications} new application${newApplications > 1 ? 's' : ''} received`,
      link: '/candidates',
      accent: 'blue',
    });
  }
  if (pendingReviews > 0) {
    alerts.push({
      icon: FileText,
      text: `${pendingReviews} candidate${pendingReviews > 1 ? 's' : ''} waiting for review`,
      link: '/candidates',
      accent: 'amber',
    });
  }
  if (upcomingInterviews > 0) {
    alerts.push({
      icon: Calendar,
      text: `${upcomingInterviews} interview${upcomingInterviews > 1 ? 's' : ''} coming up`,
      link: '/interviews',
      accent: 'violet',
    });
  }
  if (pendingFeedback > 0) {
    alerts.push({
      icon: AlertCircle,
      text: `${pendingFeedback} interview feedback pending`,
      link: '/interviews',
      accent: 'red',
    });
  }
  if (lowApplicationJobs > 0) {
    alerts.push({
      icon: AlertCircle,
      text: `${lowApplicationJobs} job${lowApplicationJobs > 1 ? 's' : ''} with low application volume`,
      link: '/jobs',
      accent: 'amber',
    });
  }

  const accents = {
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400',
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mb-3">
          <span className="text-emerald-600 dark:text-emerald-400 text-xl">✓</span>
        </div>
        <p className="text-sm text-muted-foreground">You're all caught up</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <Link
          key={i}
          to={alert.link}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/40 dark:hover:bg-white/5 transition-colors group"
        >
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${accents[alert.accent]}`}>
            <alert.icon className="h-4 w-4" />
          </div>
          <span className="text-sm flex-1">{alert.text}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      ))}
    </div>
  );
}
