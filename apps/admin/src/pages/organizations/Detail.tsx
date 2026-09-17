import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Users, Briefcase, FileText, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrganizationDetail } from '@/hooks/useAdmin';
import { formatDate } from '@/lib/utils';

export default function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: org, isLoading } = useOrganizationDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted/40 rounded animate-pulse" />
        <div className="h-40 bg-muted/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Organization not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/organizations')}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <Link
          to="/organizations"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Organizations
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{org.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge>{org.type}</Badge>
              <span className="text-xs text-muted-foreground">{org.slug}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Users" value={org._count?.users ?? 0} icon={Users} accent="bg-violet-500/10 text-violet-600" />
        <StatCard label="Jobs" value={org._count?.jobs ?? 0} icon={Briefcase} accent="bg-emerald-500/10 text-emerald-600" />
        <StatCard label="Candidates" value={org._count?.candidates ?? 0} icon={Users} accent="bg-blue-500/10 text-blue-600" />
        <StatCard label="Applications" value={org._count?.applications ?? 0} icon={FileText} accent="bg-amber-500/10 text-amber-600" />
      </div>

      <div className="glass-card rounded-xl p-5">
        <h2 className="font-semibold mb-4">Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {org.industry && <InfoRow label="Industry" value={org.industry} />}
          {org.size && <InfoRow label="Size" value={org.size} />}
          {org.website && <InfoRow label="Website" value={org.website} />}
          {org.phone && <InfoRow label="Phone" value={org.phone} />}
          {org.address && <InfoRow label="Address" value={org.address} />}
          <InfoRow label="Created" value={formatDate(org.createdAt)} />
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <h2 className="font-semibold mb-4">Members ({org.users?.length ?? 0})</h2>
        {!org.users || org.users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members</p>
        ) : (
          <div className="space-y-2">
            {org.users.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-white/40">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {u.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{u.user.name}</p>
                    <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {u.user.email}
                    </p>
                  </div>
                </div>
                <Badge>{u.role}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }: any) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-semibold mt-2">{value}</p>
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="mt-0.5">{value}</p>
    </div>
  );
}
