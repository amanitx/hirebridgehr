import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { KanbanSquare, ChevronDown } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { PipelineColumn } from '@/components/pipeline/PipelineColumn';
import { usePipeline, useUpdateApplicationStatus } from '@/hooks/useApplications';
import { useJobs } from '@/hooks/useJobs';
import { ApplicationStatus } from '@/types';
import { toast } from '@/components/ui/toast';
import { getApiError } from '@/lib/api';

const MAIN_STAGES: ApplicationStatus[] = [
  'NEW',
  'SCREENING',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFER',
  'HIRED',
];

export default function PipelinePage() {
  const [params, setParams] = useSearchParams();
  const [jobId, setJobId] = useState<string>(params.get('job') || '');
  const [dragOver, setDragOver] = useState<ApplicationStatus | null>(null);

  const { data: jobsData } = useJobs({ limit: 100 });
  const { data: pipeline, isLoading } = usePipeline(jobId || undefined);
  const updateStatus = useUpdateApplicationStatus();

  // Auto-select first job
  useEffect(() => {
    if (!jobId && jobsData?.data?.length) {
      const first = jobsData.data[0].id;
      setJobId(first);
      setParams({ job: first });
    }
  }, [jobId, jobsData, setParams]);

  const handleDrop = async (stage: ApplicationStatus, e?: React.DragEvent) => {
    setDragOver(null);
    const applicationId = (e as any)?.dataTransfer?.getData?.('applicationId');
    if (!applicationId) return;

    // Find current stage to avoid no-op
    const current = pipeline?.pipeline
      .flatMap((p) => p.candidates)
      .find((c) => c.id === applicationId);
    if (current?.status === stage) return;

    try {
      await updateStatus.mutateAsync({ id: applicationId, status: stage });
      toast({ title: `Moved to ${stage}`, variant: 'success' });
    } catch (err) {
      toast({ title: 'Failed to move', description: getApiError(err), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pipeline?.total ?? 0} candidates across stages · drag to move
          </p>
        </div>

        {/* Job selector */}
        {jobsData && jobsData.data.length > 0 && (
          <div className="relative">
            <select
              value={jobId}
              onChange={(e) => {
                setJobId(e.target.value);
                setParams({ job: e.target.value });
              }}
              className="appearance-none h-10 pl-3 pr-9 rounded-lg border border-input bg-background text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {jobsData.data.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        )}
      </div>

      {!jobId ? (
        <div className="glass-card rounded-xl">
          <EmptyState
            icon={KanbanSquare}
            title="No jobs yet"
            description="Create a job first to see the pipeline."
          />
        </div>
      ) : isLoading ? (
        <div className="flex gap-4 overflow-x-auto">
          {MAIN_STAGES.map((s) => (
            <div
              key={s}
              className="min-w-[280px] w-[280px] h-96 bg-muted/40 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4">
            {MAIN_STAGES.map((stage) => {
              const stageData = pipeline?.pipeline.find((p) => p.stage === stage);
              return (
                <PipelineColumn
                  key={stage}
                  stage={stage}
                  count={stageData?.count ?? 0}
                  candidates={stageData?.candidates ?? []}
                  onDrop={(s) => handleDrop(s)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(stage);
                  }}
                  isOver={dragOver === stage}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
