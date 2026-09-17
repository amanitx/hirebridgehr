import { useState } from 'react';
import { User as UserIcon, Building2, Users as UsersIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { useAuthStore } from '@/store/auth';
import { useProfile, useUpdateProfile } from '@/hooks/useUsers';
import { useOrganization, useTeamMembers, useUpdateOrganization, useInviteMember } from '@/hooks/useOrganization';
import { getApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'team', label: 'Team', icon: UsersIcon },
];

export default function SettingsPage() {
  const [tab, setTab] = useState('profile');
  const { user } = useAuthStore();
  const { data: profile } = useProfile();
  const { data: org } = useOrganization();
  const { data: members } = useTeamMembers();
  const updateProfile = useUpdateProfile();
  const updateOrg = useUpdateOrganization();
  const invite = useInviteMember();

  const [name, setName] = useState(profile?.name || user?.name || '');
  const [orgName, setOrgName] = useState(org?.name || '');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'RECRUITER' });

  const saveProfile = async () => {
    try {
      await updateProfile.mutateAsync({ name });
      toast({ title: 'Profile updated', variant: 'success' });
    } catch (err) {
      toast({ title: 'Failed', description: getApiError(err), variant: 'destructive' });
    }
  };

  const saveOrg = async () => {
    try {
      await updateOrg.mutateAsync({ name: orgName });
      toast({ title: 'Organization updated', variant: 'success' });
    } catch (err) {
      toast({ title: 'Failed', description: getApiError(err), variant: 'destructive' });
    }
  };

  const submitInvite = async () => {
    try {
      await invite.mutateAsync(inviteForm);
      toast({ title: 'Member invited', variant: 'success' });
      setInviteOpen(false);
      setInviteForm({ name: '', email: '', role: 'RECRUITER' });
    } catch (err) {
      toast({ title: 'Failed', description: getApiError(err), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and organization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <nav className="glass-card rounded-xl p-2 h-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === t.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-white/40 dark:hover:bg-white/5',
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>

        <div className="space-y-6">
          {tab === 'profile' && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h2 className="font-semibold">Profile</h2>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile?.email || user?.email || ''} disabled />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <Button onClick={saveProfile} disabled={updateProfile.isPending}>
                Save changes
              </Button>
            </div>
          )}

          {tab === 'organization' && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h2 className="font-semibold">Organization</h2>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={org?.slug || ''} disabled />
              </div>
              {org?.type && (
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div><Badge>{org.type}</Badge></div>
                </div>
              )}
              <Button onClick={saveOrg} disabled={updateOrg.isPending}>
                Save changes
              </Button>
            </div>
          )}

          {tab === 'team' && (
            <div className="glass-card rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Team Members</h2>
                <Button size="sm" onClick={() => setInviteOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
              <div className="space-y-2">
                {members?.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/40 dark:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {m.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{m.user.name}</p>
                        <p className="text-xs text-muted-foreground">{m.user.email}</p>
                      </div>
                    </div>
                    <Badge>{m.role}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={inviteForm.name} onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              >
                <option value="ADMIN">Admin</option>
                <option value="RECRUITER">Recruiter</option>
                <option value="HIRING_MANAGER">Hiring Manager</option>
                <option value="INTERVIEWER">Interviewer</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={submitInvite} disabled={invite.isPending}>Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
