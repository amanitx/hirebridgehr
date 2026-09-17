import { Badge } from '@/components/ui/badge';
import { JobStatus } from '@/types';

const map: Record<JobStatus, { label: string; variant: any }> = {
  DRAFT: { label: 'Draft', variant: 'outline' },
  PENDING_ADMIN_PUBLICATION: { label: 'Pending Publish', variant: 'warning' },
  PROCESSING: { label: 'Processing', variant: 'info' },
  PUBLISHED: { label: 'Published', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'danger' },
  EXPIRED: { label: 'Expired', variant: 'outline' },
  PAUSED: { label: 'Paused', variant: 'warning' },
  CLOSED: { label: 'Closed', variant: 'outline' },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const { label, variant } = map[status] || { label: status, variant: 'outline' };
  return <Badge variant={variant}>{label}</Badge>;
}
