import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { CreateCandidateModal } from '@/components/candidates/CreateCandidateModal';
import { SourceBadge } from '@/components/candidates/SourceBadge';
import { useCandidates } from '@/hooks/useCandidates';
import { cn, formatDate } from '@/lib/utils';
import { Source } from '@/types';

const filters: Array<{ value: Source | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'CAREER_PAGE', label: 'Career Page' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'MANUAL', label: 'Manual' },
];

export default function CandidatesListPage() {
  const [filter, setFilter] = useState<Source | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  const { data, isLoading } = useCandidates({ source: filter, search });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Candidates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.pagination.total ?? 0} total candidates
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="btn-premium">
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white/40 dark:bg-white/5"
        />
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
            <div key={i} className="h-16 bg-muted/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="glass-card rounded-xl">
          <EmptyState
            icon={Users}
            title="No candidates yet"
            description="Add candidates manually or receive them from published jobs."
            action={
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </Button>
            }
          />
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="hidden lg:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_100px] gap-4 px-5 py-3 border-b border-white/20 dark:border-white/5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div>Name</div>
            <div>Contact</div>
            <div>Location</div>
            <div>Experience</div>
            <div>Source</div>
            <div>Applications</div>
          </div>

          <div className="divide-y divide-white/10 dark:divide-white/5">
            {data.data.map((c) => (
              <Link
                key={c.id}
                to={`/candidates/${c.id}`}
                className="lg:grid lg:grid-cols-[2fr_2fr_1fr_1fr_1fr_100px] gap-4 px-5 py-4 hover:bg-white/30 dark:hover:bg-white/5 transition-colors items-center"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    {c.tags.length > 0 && (
                      <p className="text-xs text-muted-foreground truncate">
                        {c.tags.slice(0, 2).join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="hidden lg:block min-w-0">
                  <p className="text-sm truncate">{c.email || '—'}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.phone || ''}</p>
                </div>

                <div className="hidden lg:block text-sm text-muted-foreground truncate">
                  {c.location || '—'}
                </div>

                <div className="hidden lg:block text-sm text-muted-foreground">
                  {c.experience != null ? `${c.experience}y` : '—'}
                </div>

                <div className="hidden lg:block">
                  <SourceBadge source={c.source} />
                </div>

                <div className="hidden lg:block text-sm font-medium">
                  {c.applicationsCount ?? 0}
                </div>

                <div className="flex lg:hidden items-center justify-between mt-2">
                  <SourceBadge source={c.source} />
                  <span className="text-xs text-muted-foreground">
                    {c.applicationsCount ?? 0} apps
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <CreateCandidateModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(id) => navigate(`/candidates/${id}`)}
      />
    </div>
  );
}
