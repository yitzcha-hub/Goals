import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { OAuthButtons } from './OAuthButtons';

interface LoginFormProps {
  onToggleMode: () => void;
  onForgotPassword: () => void;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode, onForgotPassword, onSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });
      onSuccess?.();
      navigate('/', { replace: true });
    }

    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto border shadow-lg" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-primary)' }}>
      <CardHeader>
        <CardTitle className="font-bold" style={{ color: 'var(--landing-text)' }}>Sign In</CardTitle>
        <CardDescription style={{ color: 'var(--landing-text)', opacity: 0.8 }}>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative my-4">
          <Separator style={{ backgroundColor: 'var(--landing-border)' }} />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--landing-accent)] px-2 text-xs" style={{ color: 'var(--landing-text)', opacity: 0.7 }}>
            or continue with email
          </span>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium" style={{ color: 'var(--landing-text)' }}>Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-[var(--landing-border)] focus-visible:ring-[var(--landing-primary)]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-medium" style={{ color: 'var(--landing-text)' }}>Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-[var(--landing-border)] focus-visible:ring-[var(--landing-primary)]"
            />
          </div>
          <Button type="submit" className="w-full font-bold text-white hero-cta-primary" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        <div className="relative my-4">
          <Separator style={{ backgroundColor: 'var(--landing-border)' }} />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--landing-accent)] px-2 text-xs" style={{ color: 'var(--landing-text)', opacity: 0.7 }}>
            Or continue with
          </span>
        </div>
        <OAuthButtons actionLabel="Sign in" />
        <div className="mt-4 text-center space-y-2">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--landing-primary)' }}
          >
            Forgot your password?
          </button>
          <div className="text-sm" style={{ color: 'var(--landing-text)', opacity: 0.85 }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="font-semibold hover:underline"
              style={{ color: 'var(--landing-primary)' }}
            >
              Sign up
            </button>
          </div>
        </div>
        {/* SSO: Gmail (Google) and Outlook (Microsoft) - shown at top */}
      </CardContent>
    </Card>
  );
};