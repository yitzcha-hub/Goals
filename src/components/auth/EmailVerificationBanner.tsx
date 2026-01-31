import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const EmailVerificationBanner: React.FC = () => {
  const [resending, setResending] = useState(false);
  const { user, resendVerificationEmail } = useAuth();
  const { toast } = useToast();

  // Disable email verification requirement - always hide banner
  return null;

  const handleResend = async () => {
    setResending(true);
    const { error } = await resendVerificationEmail();
    
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Email sent',
        description: 'Verification email has been resent to your inbox.',
      });
    }
    
    setResending(false);
  };

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-amber-600" />
          <span className="text-amber-800">
            Please verify your email address to access all features.
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={resending}
          className="ml-4"
        >
          {resending ? 'Sending...' : 'Resend Email'}
        </Button>
      </AlertDescription>
    </Alert>
  );
};