import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { usePublishJob } from '@/hooks/useJobs';
import { getApiError } from '@/lib/api';
import { Platform, Job } from '@/types';
import { Globe, Linkedin, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PublishJobModal({
  job,
  open,
  onOpenChange,
}: {
  job: Job;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [selected, setSelected] = useState<Platform[]>(['CAREER_PAGE', 'LINKEDIN']);
  const publish = usePublishJob();

  const toggle = (p: Platform) => {
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  };

  const submit = async () => {
    if (selected.length === 0) {
      toast({ title: 'Select at least one platform', variant: 'destructive' });
      return;
    }
    try {
      await publish.mutateAsync({ id: job.id, platforms: selected });
      toast({
        title: 'Publishing request submitted',
        description:
          selected.includes('LINKEDIN')
            ? 'HirebridgeHR admin will publish on LinkedIn shortly.'
            : 'Career page updated.',
        variant: 'success',
      });
      onOpenChange(false);
    } catch (err) {
      toast({ title: 'Failed to publish', description: getApiError(err), variant: 'destructive' });
    }
  };

  const options: Array<{ id: Platform; title: string; desc: string; icon: any }> = [
    {
      id: 'CAREER_PAGE',
      title: 'HirebridgeHR Career Page',
      desc: 'Instantly visible on your public career page',
      icon: Globe,
    },
    {
      id: 'LINKEDIN',
      title: 'LinkedIn',
      desc: 'HirebridgeHR admin will publish manually within a few hours',
      icon: Linkedin,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Publish job</DialogTitle>
          <DialogDescription>
            Choose where you want "{job.title}" to appear.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {options.map((opt) => {
            const active = selected.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggle(opt.id)}
                className={cn(
                  'w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all',
                  active
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40',
                )}
              >
                <div
                  className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {active ? <Check className="h-5 w-5" /> : <opt.icon className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{opt.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={publish.isPending}>
            {publish.isPending ? 'Publishing...' : 'Publish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
