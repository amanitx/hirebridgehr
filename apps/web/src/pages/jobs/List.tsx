import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Plus, Search, MoreVertical, Eye, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { CreateJobModal } from '@/components/jobs/CreateJobModal';
import { JobStatusBadge } from '@/components/jobs/StatusBadge';
import { useJobs, useDeleteJob } from '@/hooks/useJobs';
import { JobStatus } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

const filters: Array<{ value: JobStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'PUBLISHED', label: 'Active' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_ADMIN_PUBLICATION', label: 'Pending Publish' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'CLOSED', label: 'Closed' },
];

export default function JobsListPage() {
  const [filter, setFilter] = useState<JobStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data, isLoading } = useJobs({ status: filter, search });
  const del = useDeleteJob();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await del.mutateAsync(id);
      toast({ title: 'Job deleted', variant: 'success' });
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
    setMenuOpen(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.pagination.total ?? 0} total jobs
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="btn-premium">
          <Plus className="h-4 w-4 mr-2" />
          Create Job
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white/40 dark:bg-white/5"
        />
      </div>

      {/* Filter tabs */}
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

      {/* Content */}
      {isLoading ? (
        <div className="glass-card rounded-xl p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="glass-card rounded-xl">
          <EmptyState
            icon={Briefcase}
            title="No jobs yet"
            description="Create your first job to start receiving candidates."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            }
          />
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] gap-4 px-5 py-3 border-b border-white/20 dark:border-white/5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div>Job Title</div>
            <div>Location</div>
            <div>Type</div>
            <div>Applications</div>
            <div>Status</div>
            <div></div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/10 dark:divide-white/5">
            {data.data.map((job) => (
              <div
                key={job.id}
                className="lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] gap-4 px-5 py-4 hover:bg-white/30 dark:hover:bg-white/5 transition-colors"
              >
                {/* Title */}
                <Link to={`/jobs/${job.id}`} className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{job.title}</p>
                    <p className="text-xs text-muted-foreground truncate lg:hidden">
                      {job.location || 'No location'} · {job.employmentType}
                    </p>
                    <p className="text-xs text-muted-foreground truncate hidden lg:block">
                      {job.department || 'No department'}
                    </p>
                  </div>
                </Link>

                {/* Location */}
                <div className="hidden lg:flex items-center text-sm text-muted-foreground">
                  {job.location || '—'}
                </div>

                {/* Type */}
                <div className="hidden lg:flex items-center text-sm text-muted-foreground">
                  {job.employmentType.replace('_', ' ')}
                </div>

                {/* Applications */}
                <div className="hidden lg:flex items-center">
                  <span className="text-sm font-medium">
                    {job.applicationsCount ?? job._count?.applications ?? 0}
                  </span>
                </div>

                {/* Status */}
                <div className="hidden lg:flex items-center">
                  <JobStatusBadge status={job.status} />
                </div>

                {/* Actions */}
                <div className="hidden lg:flex items-center justify-end relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === job.id ? null : job.id)}
                    className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-white/5"
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {menuOpen === job.id && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-0 top-10 z-40 w-48 glass-card rounded-xl shadow-xl py-1">
                        <button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/40 dark:hover:bg-white/5"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        {job.status === 'DRAFT' && (
                          <button
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/40 dark:hover:bg-white/5"
                          >
                            <Send className="h-4 w-4" />
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(job.id, job.title)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile status row */}
                <div className="flex lg:hidden items-center justify-between mt-2">
                  <JobStatusBadge status={job.status} />
                  <Link to={`/jobs/${job.id}`} className="text-xs text-primary hover:underline">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateJobModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => navigate(`/jobs/${id}`)}
      />
    </div>
  );
}
