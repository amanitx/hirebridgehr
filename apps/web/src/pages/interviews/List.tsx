import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Clock, Video, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { InterviewStatusBadge } from '@/components/interviews/InterviewStatusBadge';
import { ScheduleInterviewModal } from '@/components/interviews/ScheduleInterviewModal';
import { FeedbackModal } from '@/components/interviews/FeedbackModal';
import { useInterviews } from '@/hooks/useInterviews';
import { cn, formatDateTime } from '@/lib/utils';
import { Interview, InterviewStatus } from '@/types';

const filters: Array<{ value: InterviewStatus | 'ALL' | 'UPCOMING'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const typeIcons: Record<string, any> = {
  VIDEO: Video,
  PHONE: Phone,
  ONSITE: MapPin,
};

export default function InterviewsListPage() {
  const [filter, setFilter] = useState<InterviewStatus | 'ALL' | 'UPCOMING'>('ALL');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [feedbackFor, setFeedbackFor] = useState<Interview | null>(null);

  const params = filter === 'UPCOMING'
    ? { upcoming: true }
    : filter === 'ALL'
      ? {}
      : { status: filter as InterviewStatus };

  const { data, isLoading } = useInterviews(params);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Interviews</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.length ?? 0} interviews
          </p>
        </div>
        <Button onClick={() => setScheduleOpen(true)} className="btn-premium">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              filter === f.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-white/60 dark:hover:bg-white/5',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="glass-card rounded-xl p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="glass-card rounded-xl">
          <EmptyState
            icon={Calendar}
            title="No interviews yet"
            description="Schedule an interview to get started."
            action={
              <Button onClick={() => setScheduleOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Interview
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((interview) => {
            const Icon = typeIcons[interview.type] || Video;
            const hasFeedback = (interview.feedback?.length ?? 0) > 0;
            return (
              <div
                key={interview.id}
                className="glass-card rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {interview.candidate && (
                          <Link
                            to={`/candidates/${interview.candidate.id}`}
                            className="font-medium hover:text-primary"
                          >
                            {interview.candidate.name}
                          </Link>
                        )}
                        <InterviewStatusBadge status={interview.status} />
                        {hasFeedback && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Feedback in
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {interview.job?.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(interview.scheduledAt)}
                        </span>
                        <span>{interview.durationMin} min</span>
                        {interview.interviewer && (
                          <span>with {interview.interviewer.name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 lg:shrink-0">
                    {interview.status === 'SCHEDULED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setFeedbackFor(interview)}
                      >
                        Add feedback
                      </Button>
                    )}
                    {interview.meetingLink && interview.status === 'SCHEDULED' && (
                      <Button size="sm" asChild>
                        <a href={interview.meetingLink} target="_blank" rel="noreferrer">
                          Join
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ScheduleInterviewModal open={scheduleOpen} onOpenChange={setScheduleOpen} />
      {feedbackFor && (
        <FeedbackModal
          interview={feedbackFor}
          open={!!feedbackFor}
          onOpenChange={(v) => !v && setFeedbackFor(null)}
        />
      )}
    </div>
  );
}
