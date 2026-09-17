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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { useSubmitFeedback } from '@/hooks/useInterviews';
import { getApiError } from '@/lib/api';
import { Interview } from '@/types';
import { cn } from '@/lib/utils';

const schema = z.object({
  technical: z.coerce.number().min(1).max(5),
  communication: z.coerce.number().min(1).max(5),
  problemSolving: z.coerce.number().min(1).max(5),
  experience: z.coerce.number().min(1).max(5),
  overall: z.coerce.number().min(1).max(5),
  recommendation: z.enum(['STRONG_HIRE', 'HIRE', 'MAYBE', 'NO_HIRE']),
  comments: z.string().optional(),
});

type Form = z.infer<typeof schema>;

const ratingFields: Array<{ name: keyof Form; label: string }> = [
  { name: 'technical', label: 'Technical Skills' },
  { name: 'communication', label: 'Communication' },
  { name: 'problemSolving', label: 'Problem Solving' },
  { name: 'experience', label: 'Experience' },
  { name: 'overall', label: 'Overall Rating' },
];

const recommendations = [
  { value: 'STRONG_HIRE', label: 'Strong Hire', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/40' },
  { value: 'HIRE', label: 'Hire', color: 'bg-blue-500/10 text-blue-600 border-blue-500/40' },
  { value: 'MAYBE', label: 'Maybe', color: 'bg-amber-500/10 text-amber-600 border-amber-500/40' },
  { value: 'NO_HIRE', label: 'No Hire', color: 'bg-red-500/10 text-red-600 border-red-500/40' },
];

export function FeedbackModal({
  interview,
  open,
  onOpenChange,
}: {
  interview: Interview;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const submit = useSubmitFeedback();
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({
    technical: 3,
    communication: 3,
    problemSolving: 3,
    experience: 3,
    overall: 3,
  });
  const [recommendation, setRecommendation] = useState('HIRE');
  const [comments, setComments] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submit.mutateAsync({
        interviewId: interview.id,
        technical: ratings.technical,
        communication: ratings.communication,
        problemSolving: ratings.problemSolving,
        experience: ratings.experience,
        overall: ratings.overall,
        recommendation: recommendation as any,
        comments,
      });
      toast({ title: 'Feedback submitted', variant: 'success' });
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
          <DialogTitle>Interview Feedback</DialogTitle>
          <DialogDescription>
            {interview.candidate?.name} — {interview.job?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {ratingFields.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>{f.label}</Label>
                <span className="text-xs font-medium">{ratings[f.name]}/5</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRatings({ ...ratings, [f.name]: n })}
                    className={cn(
                      'flex-1 h-9 rounded-lg border text-sm font-medium transition-all',
                      ratings[f.name] >= n
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-input hover:border-primary/40',
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <Label>Recommendation</Label>
            <div className="grid grid-cols-2 gap-2">
              {recommendations.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRecommendation(r.value)}
                  className={cn(
                    'px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                    recommendation === r.value
                      ? r.color
                      : 'bg-background border-input hover:border-primary/40',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Comments</Label>
            <Textarea
              rows={3}
              placeholder="Additional notes..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit feedback'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
