import { useState } from 'react';
import { Send, Linkedin, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useAllDistributions } from '@/hooks/useAdmin';
import { cn, formatDateTime, relativeTime } from '@/lib/utils';

const statusFilters = ['ALL', 'PENDING_ADMIN_PUBLICATION', 'PUBLISHED', 'FAILED', 'CLOSED'];
const platformFilters = ['ALL', 'LINKEDIN', 'CAREER_PAGE'];

const statusMeta: Record<string, { label: string; variant: any }> = {
  PENDING_ADMIN_PUBLICATION: { label: 'Pending', variant: 'warning' },
  PROCESSING: { label: 'Processing', variant: 'info' },
  PUBLISHED: { label: 'Published', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'danger' },
  CLOSED: { label: 'Closed', variant: 'outline' },
  EXPIRED: { label: 'Expired', variant: 'outline' },
};

export default function DistributionsPage() {
  const [status, setStatus] = useState('ALL');
  const [platform, setPlatform] = useState('ALL');
  const { data, isLoading } = useAllDistributions(status, platform);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">All Distributions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data?.length ?? 0} distributions
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              status === s
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-white/60',
            )}
          >
            {s === 'ALL' ? 'All Status' : statusMeta[s]?.label || s}
          </button>
        ))}
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {platformFilters.map((p) => (
          <button
            key={p}
            onClick={() => setPlatform(p)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
              platform === p
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:bg-white/60',
            )}
          >
            {p === 'ALL' ? 'All Platforms' : p}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="glass-card rounded-xl p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="glass-card rounded-xl">
          <EmptyState icon={Send} title="No distributions" description="No distribution requests found" />
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-white/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div>Job</div>
            <div>Organization</div>
            <div>Platform</div>
            <div>Status</div>
            <div>Requested</div>
            <div>Published</div>
          </div>

          <div className="divide-y divide-white/10">
            {data.map((d: any) => {
              const sm = statusMeta[d.status] || { label: d.status, variant: 'outline' };
              const Icon = d.platform === 'LINKEDIN' ? Linkedin : Globe;
              return (
                <div
                  key={d.id}
                  className="lg:grid lg:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-4 items-center hover:bg-white/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{d.job?.title}</p>
                    {d.externalJobId && (
                      <p className="text-xs text-muted-foreground truncate">
                        ID: {d.externalJobId}
                      </p>
                    )}
                  </div>

                  <div className="hidden lg:block text-sm text-muted-foreground truncate">
                    {d.organization?.name}
                  </div>

                  <div className="hidden lg:flex items-center gap-1.5 text-sm">
                    <Icon className="h-3.5 w-3.5" />
                    {d.platform}
                  </div>

                  <div className="hidden lg:block">
                    <Badge variant={sm.variant}>{sm.label}</Badge>
                  </div>

                  <div className="hidden lg:block text-xs text-muted-foreground">
                    {relativeTime(d.requestedAt)}
                  </div>

                  <div className="hidden lg:block text-xs text-muted-foreground">
                    {d.publishedAt ? formatDateTime(d.publishedAt) : '—'}
                  </div>

                  <div className="flex lg:hidden items-center justify-between mt-2">
                    <Badge variant={sm.variant}>{sm.label}</Badge>
                    <span className="text-xs text-muted-foreground">{d.organization?.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
