import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { OAuthButtons } from './OAuthButtons';

interface SignUpFormProps {
  onToggleMode: () => void;
  onSuccess?: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleMode, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password);

    if (error) {
      // Supabase: "User already registered" / "A user with this email already exists" etc.
      const isAlreadyRegistered =
        /already registered|user already exists|email already exists|already been registered/i.test(
          error.message ?? ''
        );
      toast({
        title: isAlreadyRegistered ? 'Already registered' : 'Error',
        description: isAlreadyRegistered
          ? 'This email is already registered. Please sign in or use a different email.'
          : error.message ?? 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      // Stay on signup form; do not switch to login
    } else {
      onToggleMode(); // Switch to login modal
      toast({
        title: '🎉 Success! Check your email',
        description: 'We sent you a verification link. Click it to verify your account, then sign in below.',
      });
    }

    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto border shadow-lg" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-primary)' }}>
      <CardHeader>
        <CardTitle className="font-bold" style={{ color: 'var(--landing-text)' }}>Start Your 7-Day Free Trial</CardTitle>
        <CardDescription style={{ color: 'var(--landing-text)', opacity: 0.8 }}>Create your account and get instant access to all features</CardDescription>
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-medium" style={{ color: 'var(--landing-text)' }}>Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="border-[var(--landing-border)] focus-visible:ring-[var(--landing-primary)]"
            />
          </div>

          <div className="rounded-lg p-3 text-sm border" style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderColor: 'var(--landing-primary)', color: 'var(--landing-primary)' }}>
            <div className="font-semibold mb-1">✓ No credit card required</div>
            <div className="text-xs opacity-90" style={{ color: 'var(--landing-text)' }}>Full access to all features for 7 days</div>
          </div>

          <Button type="submit" className="w-full font-bold text-white hero-cta-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Start Free Trial'}
          </Button>
        </form>
        <div className="relative my-4">
          <Separator style={{ backgroundColor: 'var(--landing-border)' }} />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--landing-accent)] px-2 text-xs" style={{ color: 'var(--landing-text)', opacity: 0.7 }}>
            Or continue with
          </span>
        </div>
        <OAuthButtons actionLabel="Sign up" />
        <div className="mt-4 text-center">
          <div className="text-sm" style={{ color: 'var(--landing-text)', opacity: 0.85 }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onToggleMode}
              className="font-semibold hover:underline"
              style={{ color: 'var(--landing-primary)' }}
            >
              Sign in
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};