import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PasswordResetFormProps {
  onBack: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setSent(true);
      toast({
        title: 'Success',
        description: 'Password reset email sent! Check your inbox.',
      });
    }

    setLoading(false);
  };

  if (sent) {
    return (
      <Card className="w-full max-w-md mx-auto border shadow-lg" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-primary)' }}>
        <CardHeader>
          <CardTitle className="font-bold" style={{ color: 'var(--landing-text)' }}>Check Your Email</CardTitle>
          <CardDescription style={{ color: 'var(--landing-text)', opacity: 0.8 }}>
            We've sent a password reset link to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm" style={{ color: 'var(--landing-text)', opacity: 0.85 }}>
              Click the link in the email to reset your password. If you don't see it, check your spam folder.
            </p>
            <Button onClick={onBack} variant="outline" className="w-full font-bold hero-cta-outline">
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border shadow-lg" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-primary)' }}>
      <CardHeader>
        <CardTitle className="font-bold" style={{ color: 'var(--landing-text)' }}>Reset Password</CardTitle>
        <CardDescription style={{ color: 'var(--landing-text)', opacity: 0.8 }}>Enter your email to receive a password reset link</CardDescription>
      </CardHeader>
      <CardContent>
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
          <Button type="submit" className="w-full font-bold text-white hero-cta-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--landing-primary)' }}
          >
            Back to Sign In
          </button>
        </div>
      </CardContent>
    </Card>
  );
};