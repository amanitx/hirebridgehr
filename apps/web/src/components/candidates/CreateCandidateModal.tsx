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
import { useCreateCandidate } from '@/hooks/useCandidates';
import { getApiError } from '@/lib/api';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  location: z.string().optional(),
  experience: z.coerce.number().min(0).max(50).optional(),
  education: z.string().optional(),
  source: z.enum([
    'LINKEDIN','CAREER_PAGE','EMAIL','REFERRAL','MANUAL','API','WEBHOOK','JOB_BOARD','CSV',
  ]).optional(),
  skillsRaw: z.string().optional(),
  tagsRaw: z.string().optional(),
  notes: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export function CreateCandidateModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: (id: string) => void;
}) {
  const create = useCreateCandidate();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { source: 'MANUAL' },
  });

  const onSubmit = async (data: Form) => {
    setSubmitting(true);
    try {
      const payload: any = {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone,
        location: data.location,
        experience: data.experience,
        education: data.education,
        source: data.source,
        notes: data.notes,
        skills: data.skillsRaw
          ? data.skillsRaw.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        tags: data.tagsRaw
          ? data.tagsRaw.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };
      const c = await create.mutateAsync(payload);
      toast({ title: 'Candidate added', variant: 'success' });
      reset();
      onOpenChange(false);
      onCreated?.(c.id);
    } catch (err) {
      toast({ title: 'Failed to add candidate', description: getApiError(err), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add candidate</DialogTitle>
          <DialogDescription>Manually add a candidate to your database.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="Rahul Sharma" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="rahul@example.com" {...register('email')} />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+91-9876543210" {...register('phone')} />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="Bangalore" {...register('location')} />
            </div>

            <div className="space-y-2">
              <Label>Experience (years)</Label>
              <Input type="number" min={0} placeholder="5" {...register('experience')} />
            </div>

            <div className="space-y-2">
              <Label>Source</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                {...register('source')}
              >
                <option value="MANUAL">Manual</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="REFERRAL">Referral</option>
                <option value="CAREER_PAGE">Career Page</option>
                <option value="EMAIL">Email</option>
                <option value="JOB_BOARD">Job Board</option>
                <option value="CSV">CSV Import</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Education</Label>
              <Input placeholder="B.Tech, Computer Science" {...register('education')} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Skills (comma separated)</Label>
              <Input placeholder="Python, Django, AWS" {...register('skillsRaw')} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Tags (comma separated)</Label>
              <Input placeholder="senior, backend, available" {...register('tagsRaw')} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea rows={3} placeholder="Internal notes..." {...register('notes')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add candidate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
