import { Badge } from '@/components/ui/badge';
import { Globe, Linkedin, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { JobDistribution } from '@/types';
import { formatDateTime } from '@/lib/utils';

const platformMeta: Record<string, { label: string; icon: any }> = {
  CAREER_PAGE: { label: 'Career Page', icon: Globe },
  LINKEDIN: { label: 'LinkedIn', icon: Linkedin },
};

const statusMeta: Record<string, { label: string; variant: any; icon: any }> = {
  DRAFT: { label: 'Draft', variant: 'outline', icon: AlertCircle },
  PENDING_ADMIN_PUBLICATION: { label: 'Pending admin', variant: 'warning', icon: Clock },
  PROCESSING: { label: 'Processing', variant: 'info', icon: Clock },
  PUBLISHED: { label: 'Published', variant: 'success', icon: CheckCircle2 },
  FAILED: { label: 'Failed', variant: 'danger', icon: XCircle },
  EXPIRED: { label: 'Expired', variant: 'outline', icon: XCircle },
  CLOSED: { label: 'Closed', variant: 'outline', icon: XCircle },
};

export function DistributionsPanel({ distributions }: { distributions: JobDistribution[] }) {
  if (!distributions || distributions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        Not published yet. Click Publish to distribute this job.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {distributions.map((d) => {
        const p = platformMeta[d.platform] || { label: d.platform, icon: Globe };
        const s = statusMeta[d.status] || statusMeta.DRAFT;
        const Icon = p.icon;
        return (
          <div
            key={d.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/40 dark:bg-white/5"
          >
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{p.label}</p>
              <p className="text-xs text-muted-foreground truncate">
                {d.publishedAt
                  ? `Published ${formatDateTime(d.publishedAt)}`
                  : `Requested ${formatDateTime(d.requestedAt)}`}
              </p>
              {d.errorMessage && (
                <p className="text-xs text-destructive mt-0.5">{d.errorMessage}</p>
              )}
            </div>
            <Badge variant={s.variant}>{s.label}</Badge>
          </div>
        );
      })}
    </div>
  );
}
