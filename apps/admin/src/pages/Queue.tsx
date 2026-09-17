import { useState } from 'react';
import { Inbox, Check, X, ExternalLink, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { usePublishingQueue, useMarkPublished, useRejectDistribution } from '@/hooks/useAdmin';
import { QueueItem } from '@/types';
import { formatDateTime, relativeTime } from '@/lib/utils';

export default function QueuePage() {
  const { data: queue, isLoading } = usePublishingQueue();
  const mark = useMarkPublished();
  const reject = useRejectDistribution();

  const [publishFor, setPublishFor] = useState<QueueItem | null>(null);
  const [rejectFor, setRejectFor] = useState<QueueItem | null>(null);
  const [externalJobId, setExternalJobId] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const handleMarkPublished = async () => {
    if (!publishFor) return;
    try {
      await mark.mutateAsync({ id: publishFor.id, externalJobId: externalJobId || undefined });
      toast({ title: 'Marked as published', variant: 'success' });
      setPublishFor(null);
      setExternalJobId('');
    } catch {
      toast({ title: 'Failed', variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!rejectFor || !rejectReason) {
      toast({ title: 'Reason is required', variant: 'destructive' });
      return;
    }
    try {
      await reject.mutateAsync({ id: rejectFor.id, reason: rejectReason });
      toast({ title: 'Rejected', variant: 'success' });
      setRejectFor(null);
      setRejectReason('');
    } catch {
      toast({ title: 'Failed', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Publishing Queue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {queue?.length ?? 0} pending publication{queue?.length === 1 ? '' : 's'}
        </p>
      </div>

      {isLoading ? (
        <div className="glass-card rounded-xl p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !queue || queue.length === 0 ? (
        <div className="glass-card rounded-xl">
          <EmptyState
            icon={Inbox}
            title="Queue is empty"
            description="No pending publication requests. All caught up."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((item) => (
            <div key={item.id} className="glass-card rounded-xl p-5">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant="warning">Pending</Badge>
                    <Badge variant="info">
                      <Linkedin className="h-3 w-3 mr-1" />
                      {item.platform}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {relativeTime(item.requestedAt)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg">{item.job.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium">{item.organization.name}</span>
                    {item.job.location && ` · ${item.job.location}`}
                    {` · ${item.job.employmentType.replace('_', ' ')}`}
                  </p>

                  {item.job.skills && item.job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {item.job.skills.slice(0, 6).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.job.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {item.job.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-col lg:w-40 shrink-0">
                  <Button
                    className="flex-1 lg:flex-none"
                    onClick={() => setPublishFor(item)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark Published
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 lg:flex-none"
                    onClick={() => setRejectFor(item)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mark Published Modal */}
      <Dialog open={!!publishFor} onOpenChange={(v) => !v && setPublishFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Published</DialogTitle>
            <DialogDescription>
              {publishFor?.job.title} — {publishFor?.organization.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>External Job ID (optional)</Label>
              <Input
                placeholder="e.g. LinkedIn job ID 1234567890"
                value={externalJobId}
                onChange={(e) => setExternalJobId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Agar LinkedIn pe job post ho gaya hai, uska ID yahan daalein
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishFor(null)}>Cancel</Button>
            <Button onClick={handleMarkPublished} disabled={mark.isPending}>
              {mark.isPending ? 'Marking...' : 'Mark Published'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={!!rejectFor} onOpenChange={(v) => !v && setRejectFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Publication</DialogTitle>
            <DialogDescription>
              {rejectFor?.job.title} — {rejectFor?.organization.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Reason *</Label>
            <Textarea
              placeholder="Why is this rejected?"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectFor(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={reject.isPending}>
              {reject.isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
