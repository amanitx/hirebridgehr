import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import AuthLayout from '@/components/auth/AuthLayout';
import { api, getApiError } from '@/lib/api';

const schema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
  organizationName: z.string().min(2, 'Organization name required'),
  organizationType: z.enum(['CORPORATE', 'AGENCY', 'STAFFING', 'STARTUP']),
});

type Form = z.infer<typeof schema>;

export default function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { organizationType: 'CORPORATE' },
  });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      await api.post('/auth/signup', data);
      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account.',
        variant: 'success',
      });
      navigate('/login');
    } catch (err) {
      toast({
        title: 'Signup failed',
        description: getApiError(err),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing your hiring pipeline"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" placeholder="Aman Kumar" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" placeholder="you@company.com" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 8 characters" {...register('password')} />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization</Label>
          <Input id="organizationName" placeholder="Acme Corp" {...register('organizationName')} />
          {errors.organizationName && (
            <p className="text-xs text-destructive">{errors.organizationName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationType">Organization type</Label>
          <select
            id="organizationType"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('organizationType')}
          >
            <option value="CORPORATE">Corporate / Internal HR</option>
            <option value="AGENCY">Recruitment Agency</option>
            <option value="STAFFING">Staffing Company</option>
            <option value="STARTUP">Startup</option>
          </select>
        </div>

        <Button type="submit" className="w-full btn-premium" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
