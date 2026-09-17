import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import { api, getApiError } from '@/lib/api';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }
    api
      .post('/auth/verify-email', { token })
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(getApiError(err));
      });
  }, [token]);

  return (
    <AuthLayout title="Email verification">
      <div className="flex flex-col items-center py-4 text-center">
        {status === 'loading' && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
        {status === 'success' && <CheckCircle2 className="h-12 w-12 text-emerald-500" />}
        {status === 'error' && <XCircle className="h-12 w-12 text-destructive" />}

        <p className="mt-4 text-sm text-muted-foreground">{message}</p>

        <Link
          to="/login"
          className="mt-6 inline-block text-sm text-primary font-medium hover:underline"
        >
          Go to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
