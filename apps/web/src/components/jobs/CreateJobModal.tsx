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
import { useCreateJob } from '@/hooks/useJobs';
import { getApiError } from '@/lib/api';

const schema = z.object({
  title: z.string().min(2, 'Title required'),
  department: z.string().optional(),
  location: z.string().optional(),
  workMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  experienceMin: z.coerce.number().min(0).max(50).optional(),
  experienceMax: z.coerce.number().min(0).max(50).optional(),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
  currency: z.string().default('INR'),
  description: z.string().optional(),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  benefits: z.string().optional(),
  skillsRaw: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export function CreateJobModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: (id: string) => void;
}) {
  const create = useCreateJob();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      workMode: 'ONSITE',
      employmentType: 'FULL_TIME',
      currency: 'INR',
    },
  });

  const onSubmit = async (data: Form) => {
    setSubmitting(true);
    try {
      const payload: any = { ...data };
      delete payload.skillsRaw;
      payload.skills = data.skillsRaw
        ? data.skillsRaw.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const job = await create.mutateAsync(payload);
      toast({ title: 'Job created', description: 'Saved as draft', variant: 'success' });
      reset();
      onOpenChange(false);
      onCreated?.(job.id);
    } catch (err) {
      toast({ title: 'Failed to create job', description: getApiError(err), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create new job</DialogTitle>
          <DialogDescription>
            Fill in the details. You can save as draft and publish later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Basic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input id="title" placeholder="Senior Python Developer" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Input placeholder="Engineering" {...register('department')} />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="Bangalore, India" {...register('location')} />
            </div>

            <div className="space-y-2">
              <Label>Work Mode</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                {...register('workMode')}
              >
                <option value="ONSITE">On-site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Employment Type</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                {...register('employmentType')}
              >
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Experience Min (years)</Label>
              <Input type="number" min={0} placeholder="3" {...register('experienceMin')} />
            </div>

            <div className="space-y-2">
              <Label>Experience Max (years)</Label>
              <Input type="number" min={0} placeholder="8" {...register('experienceMax')} />
            </div>

            <div className="space-y-2">
              <Label>Salary Min</Label>
              <Input type="number" min={0} placeholder="1500000" {...register('salaryMin')} />
            </div>

            <div className="space-y-2">
              <Label>Salary Max</Label>
              <Input type="number" min={0} placeholder="2500000" {...register('salaryMax')} />
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Input placeholder="INR" {...register('currency')} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Skills (comma separated)</Label>
              <Input placeholder="Python, Django, AWS, PostgreSQL" {...register('skillsRaw')} />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={3} placeholder="Describe the role..." {...register('description')} />
          </div>

          <div className="space-y-2">
            <Label>Requirements</Label>
            <Textarea rows={2} placeholder="Required skills and experience..." {...register('requirements')} />
          </div>

          <div className="space-y-2">
            <Label>Responsibilities</Label>
            <Textarea rows={2} placeholder="What the candidate will do..." {...register('responsibilities')} />
          </div>

          <div className="space-y-2">
            <Label>Benefits</Label>
            <Textarea rows={2} placeholder="Perks and benefits..." {...register('benefits')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create draft'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
