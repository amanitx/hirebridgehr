import { Badge } from '@/components/ui/badge';
import { InterviewStatus } from '@/types';

const map: Record<InterviewStatus, { label: string; variant: any }> = {
  SCHEDULED: { label: 'Scheduled', variant: 'info' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'danger' },
  RESCHEDULED: { label: 'Rescheduled', variant: 'warning' },
};

export function InterviewStatusBadge({ status }: { status: InterviewStatus }) {
  const { label, variant } = map[status] || { label: status, variant: 'outline' };
  return <Badge variant={variant}>{label}</Badge>;
}
