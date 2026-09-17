import { Badge } from '@/components/ui/badge';
import { Source } from '@/types';

const sourceMap: Record<Source, { label: string; variant: any }> = {
  LINKEDIN: { label: 'LinkedIn', variant: 'info' },
  CAREER_PAGE: { label: 'Career Page', variant: 'success' },
  EMAIL: { label: 'Email', variant: 'outline' },
  REFERRAL: { label: 'Referral', variant: 'violet' },
  MANUAL: { label: 'Manual', variant: 'outline' },
  API: { label: 'API', variant: 'outline' },
  WEBHOOK: { label: 'Webhook', variant: 'outline' },
  JOB_BOARD: { label: 'Job Board', variant: 'warning' },
  CSV: { label: 'CSV', variant: 'outline' },
};

export function SourceBadge({ source }: { source: Source }) {
  const { label, variant } = sourceMap[source] || { label: source, variant: 'outline' };
  return <Badge variant={variant}>{label}</Badge>;
}
