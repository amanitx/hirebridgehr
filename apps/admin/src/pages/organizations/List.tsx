import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useAllOrganizations } from '@/hooks/useAdmin';
import { formatDate } from '@/lib/utils';

const typeColors: Record<string, any> = {
  CORPORATE: 'info',
  AGENCY: 'violet',
  STAFFING: 'warning',
  STARTUP: 'success',
};

export default function OrganizationsListPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useAllOrganizations(search);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Organizations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data?.length ?? 0} total organizations
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search organizations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white/40"
        />
      </div>

      {isLoading ? (
        <div className="glass-card rounded-xl p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="glass-card rounded-xl">
          <EmptyState
            icon={Building2}
            title="No organizations"
            description={search ? 'No matches found' : 'No organizations yet'}
          />
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-white/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div>Organization</div>
            <div>Type</div>
            <div>Users</div>
            <div>Jobs</div>
            <div>Candidates</div>
            <div>Apps</div>
            <div>Created</div>
          </div>

          <div className="divide-y divide-white/10">
            {data.map((org: any) => (
              <Link
                key={org.id}
                to={`/organizations/${org.id}`}
                className="lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-4 hover:bg-white/30 transition-colors items-center block"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{org.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{org.slug}</p>
                  </div>
                </div>

                <div className="hidden lg:flex items-center">
                  <Badge variant={typeColors[org.type] || 'outline'}>{org.type}</Badge>
                </div>

                <div className="hidden lg:flex items-center text-sm">{org._count?.users ?? 0}</div>
                <div className="hidden lg:flex items-center text-sm">{org._count?.jobs ?? 0}</div>
                <div className="hidden lg:flex items-center text-sm">{org._count?.candidates ?? 0}</div>
                <div className="hidden lg:flex items-center text-sm">{org._count?.applications ?? 0}</div>
                <div className="hidden lg:flex items-center text-xs text-muted-foreground">
                  {formatDate(org.createdAt)}
                </div>

                <div className="flex lg:hidden items-center justify-between mt-2">
                  <Badge variant={typeColors[org.type] || 'outline'}>{org.type}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {org._count?.users ?? 0} users · {org._count?.jobs ?? 0} jobs
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
