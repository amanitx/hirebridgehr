import { Badge } from '@/components/ui/badge';
import { ApplicationStatus } from '@/types';

const map: Record<ApplicationStatus, { label: string; variant: any }> = {
  NEW: { label: 'New', variant: 'info' },
  SCREENING: { label: 'Screening', variant: 'warning' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'violet' },
  INTERVIEW: { label: 'Interview', variant: 'violet' },
  OFFER: { label: 'Offer', variant: 'info' },
  HIRED: { label: 'Hired', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
  WITHDRAWN: { label: 'Withdrawn', variant: 'outline' },
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, variant } = map[status] || { label: status, variant: 'outline' };
  return <Badge variant={variant}>{label}</Badge>;
}
