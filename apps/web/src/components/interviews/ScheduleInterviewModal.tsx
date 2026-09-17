import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { useCreateInterview } from '@/hooks/useInterviews';
import { useCandidates } from '@/hooks/useCandidates';
import { useJobs } from '@/hooks/useJobs';
import { useTeamMembers } from '@/hooks/useOrganization';
import { getApiError } from '@/lib/api';

const schema = z.object({
  candidateId: z.string().min(1, 'Select candidate'),
  jobId: z.string().min(1, 'Select job'),
  interviewerId: z.string().min(1, 'Select interviewer'),
  scheduledAt: z.string().min(1, 'Select date & time'),
  durationMin: z.coerce.number().min(15).max(480).default(60),
  type: z.string().default('VIDEO'),
  meetingLink: z.string().optional(),
  notes: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export function ScheduleInterviewModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const create = useCreateInterview();
  const [submitting, setSubmitting] = useState(false);

  const { data: candidatesData } = useCandidates({ limit: 100 });
  const { data: jobsData } = useJobs({ limit: 100 });
  const { data: members } = useTeamMembers();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { durationMin: 60, type: 'VIDEO' },
  });

  const onSubmit = async (data: Form) => {
    setSubmitting(true);
    try {
      await create.mutateAsync({
        candidateId: data.candidateId,
        jobId: data.jobId,
        interviewerId: data.interviewerId,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        durationMin: data.durationMin,
        type: data.type,
        meetingLink: data.meetingLink,
        notes: data.notes,
      });
      toast({ title: 'Interview scheduled', variant: 'success' });
      reset();
      onOpenChange(false);
    } catch (err) {
      toast({ title: 'Failed', description: getApiError(err), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule interview</DialogTitle>
          <DialogDescription>Set up interview details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Candidate *</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              {...register('candidateId')}
            >
              <option value="">Select candidate</option>
              {candidatesData?.data.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.candidateId && <p className="text-xs text-destructive">{errors.candidateId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Job *</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              {...register('jobId')}
            >
              <option value="">Select job</option>
              {jobsData?.data.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
            {errors.jobId && <p className="text-xs text-destructive">{errors.jobId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Interviewer *</Label>
            <select
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
              {...register('interviewerId')}
            >
              <option value="">Select interviewer</option>
              {members?.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name} ({m.role})
                </option>
              ))}
            </select>
            {errors.interviewerId && <p className="text-xs text-destructive">{errors.interviewerId.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date & Time *</Label>
              <Input type="datetime-local" {...register('scheduledAt')} />
              {errors.scheduledAt && <p className="text-xs text-destructive">{errors.scheduledAt.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input type="number" min={15} max={480} {...register('durationMin')} />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                {...register('type')}
              >
                <option value="VIDEO">Video</option>
                <option value="PHONE">Phone</option>
                <option value="ONSITE">On-site</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Meeting Link</Label>
              <Input placeholder="https://meet.google.com/..." {...register('meetingLink')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={2} placeholder="Technical round, focus on..." {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Scheduling...' : 'Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
