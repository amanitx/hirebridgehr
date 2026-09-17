import { PipelineConversion } from '@/types';

const stageLabels: Record<string, string> = {
  NEW: 'New',
  SCREENING: 'Screening',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  HIRED: 'Hired',
};

const mainStages = ['NEW', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED'];

export function PipelineFunnel({ data, loading }: { data?: PipelineConversion; loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-muted/40 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const stages = mainStages
    .map((s) => data?.stages.find((x) => x.stage === s))
    .filter(Boolean);

  const max = Math.max(...stages.map((s) => s?.count || 0), 1);

  return (
    <div className="space-y-3">
      {stages.map((s) => {
        if (!s) return null;
        const width = (s.count / max) * 100;
        return (
          <div key={s.stage}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium">{stageLabels[s.stage] || s.stage}</span>
              <span className="text-muted-foreground">{s.count}</span>
            </div>
            <div className="h-2 rounded-full bg-white/40 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(width, s.count > 0 ? 4 : 0)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
