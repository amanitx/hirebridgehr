import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SourceBadge } from '@/components/candidates/SourceBadge';
import { ApplicationStatusBadge } from '@/components/candidates/StatusBadge';
import { useCandidate, useDeleteCandidate } from '@/hooks/useCandidates';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/toast';

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: candidate, isLoading } = useCandidate(id);
  const del = useDeleteCandidate();

  const handleDelete = async () => {
    if (!candidate) return;
    if (!confirm(`Delete "${candidate.name}"? This cannot be undone.`)) return;
    try {
      await del.mutateAsync(candidate.id);
      toast({ title: 'Candidate deleted', variant: 'success' });
      navigate('/candidates');
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted/40 rounded animate-pulse" />
        <div className="h-40 bg-muted/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Candidate not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/candidates')}>
          Back to Candidates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link
            to="/candidates"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Candidates
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-14 w-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <span className="text-xl font-semibold text-violet-600 dark:text-violet-400">
                {candidate.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {candidate.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <SourceBadge source={candidate.source} />
              </div>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact */}
          <div className="glass-card rounded-xl p-5">
            <h2 className="font-semibold mb-4">Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {candidate.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{candidate.email}</span>
                </div>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              {candidate.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{candidate.location}</span>
                </div>
              )}
              {candidate.experience != null && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{candidate.experience} years experience</span>
                </div>
              )}
              {candidate.education && (
                <div className="flex items-center gap-2 sm:col-span-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{candidate.education}</span>
                </div>
              )}
              <div className="flex items-center gap-2 sm:col-span-2 text-muted-foreground text-xs">
                <Calendar className="h-3 w-3" />
                Added {formatDate(candidate.createdAt)}
              </div>
            </div>
          </div>

          {/* Skills */}
          {candidate.skills.length > 0 && (
            <div className="glass-card rounded-xl p-5">
              <h2 className="font-semibold mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {candidate.notes && (
            <div className="glass-card rounded-xl p-5">
              <h2 className="font-semibold mb-3">Notes</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {candidate.notes}
              </p>
            </div>
          )}

          {/* Applications */}
          <div className="glass-card rounded-xl p-5">
            <h2 className="font-semibold mb-4">Applications</h2>
            {!candidate.applications || candidate.applications.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Not applied to any job yet.
              </p>
            ) : (
              <div className="space-y-3">
                {candidate.applications.map((app: any) => (
                  <Link
                    key={app.id}
                    to={`/jobs/${app.job.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{app.job.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Applied {formatDate(app.appliedAt)}
                      </p>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {candidate.tags.length > 0 && (
            <div className="glass-card rounded-xl p-5">
              <h2 className="font-semibold mb-3">Tags</h2>
              <div className="flex flex-wrap gap-1.5">
                {candidate.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card rounded-xl p-5">
            <h2 className="font-semibold mb-3">Owner</h2>
            {candidate.owner ? (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {candidate.owner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{candidate.owner.name}</p>
                  <p className="text-xs text-muted-foreground">{candidate.owner.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not assigned</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
