import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Send,
  X,
  Trash2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JobStatusBadge } from '@/components/jobs/StatusBadge';
import { PublishJobModal } from '@/components/jobs/PublishJobModal';
import { DistributionsPanel } from '@/components/jobs/DistributionsPanel';
import { useJob, useCloseJob, useDeleteJob } from '@/hooks/useJobs';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading } = useJob(id);
  const closeJob = useCloseJob();
  const del = useDeleteJob();
  const [publishOpen, setPublishOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted/40 rounded animate-pulse" />
        <div className="h-40 bg-muted/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Job not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/jobs')}>
          Back to Jobs
        </Button>
      </div>
    );
  }

  const handleClose = async () => {
    if (!confirm('Close this job? It will no longer accept applications.')) return;
    try {
      await closeJob.mutateAsync(job.id);
      toast({ title: 'Job closed', variant: 'success' });
    } catch {
      toast({ title: 'Failed to close', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    try {
      await del.mutateAsync(job.id);
      toast({ title: 'Job deleted', variant: 'success' });
      navigate('/jobs');
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const canPublish = job.status === 'DRAFT' || job.status === 'PAUSED';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Jobs
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight break-words">
              {job.title}
            </h1>
            <JobStatusBadge status={job.status} />
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
            {job.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              {job.employmentType.replace('_', ' ')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {job.workMode}
            </span>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {canPublish && (
            <Button onClick={() => setPublishOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              Publish
            </Button>
          )}
          {job.status !== 'CLOSED' && (
            <Button variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Applications</p>
              <p className="text-2xl font-semibold mt-1">{job.applicationsCount ?? job._count?.applications ?? 0}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Experience</p>
              <p className="text-2xl font-semibold mt-1">
                {job.experienceMin ?? 0}–{job.experienceMax ?? '∞'}y
              </p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Salary</p>
              <p className="text-lg font-semibold mt-1 truncate">
                {job.salaryMin || job.salaryMax
                  ? `${(job.salaryMin || 0) / 100000}–${(job.salaryMax || 0) / 100000}L`
                  : '—'}
              </p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Posted</p>
              <p className="text-sm font-medium mt-1.5">{formatDate(job.createdAt)}</p>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <Section title="Description">{job.description}</Section>
          )}
          {job.requirements && (
            <Section title="Requirements">{job.requirements}</Section>
          )}
          {job.responsibilities && (
            <Section title="Responsibilities">{job.responsibilities}</Section>
          )}
          {job.benefits && (
            <Section title="Benefits">{job.benefits}</Section>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="glass-card rounded-xl p-5">
              <h2 className="font-semibold mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: distributions + applications */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-5">
            <h2 className="font-semibold mb-4">Distribution</h2>
            <DistributionsPanel distributions={job.distributions || []} />
          </div>

          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Applications</h2>
              <Link to={`/pipeline?job=${job.id}`} className="text-xs text-primary hover:underline">
                View pipeline
              </Link>
            </div>
            <div className="flex items-center gap-3 py-3 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{job.applicationsCount ?? job._count?.applications ?? 0} candidates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Publish modal */}
      <PublishJobModal job={job} open={publishOpen} onOpenChange={setPublishOpen} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <h2 className="font-semibold mb-3">{title}</h2>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{children}</p>
    </div>
  );
}
