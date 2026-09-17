import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { api, getApiError } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data.data;

      if (!data.user.isSuperAdmin) {
        toast({
          title: 'Access denied',
          description: 'Super Admin access required',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      setAuth(data.user, data.accessToken, data.refreshToken);
      toast({ title: 'Welcome, Admin', variant: 'success' });
      navigate('/');
    } catch (err) {
      toast({ title: 'Login failed', description: getApiError(err), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-50 via-white to-slate-100" />
      <div className="absolute inset-0 -z-10 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-400/20 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xl font-semibold tracking-tight">HirebridgeHR</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold">Super Admin Login</h1>
            <p className="text-sm text-muted-foreground mt-1">Restricted access</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@hirebridgehr.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
