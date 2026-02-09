import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { PasswordResetForm } from './PasswordResetForm';

type AuthMode = 'login' | 'signup' | 'reset';

interface AuthModalProps {
  trigger: React.ReactNode;
  defaultMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({ trigger, defaultMode = 'login' }) => {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [open, setOpen] = useState(false);

  const handleToggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  const handleForgotPassword = () => {
    setMode('reset');
  };

  const handleBackToLogin = () => {
    setMode('login');
  };

  const handleAuthSuccess = () => {
    setOpen(false);
  };

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onToggleMode={handleToggleMode}
            onForgotPassword={handleForgotPassword}
            onSuccess={handleAuthSuccess}
          />
        );
      case 'signup':
        return <SignUpForm onToggleMode={handleToggleMode} onSuccess={handleAuthSuccess} />;
      case 'reset':
        return <PasswordResetForm onBack={handleBackToLogin} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent max-h-[90vh] overflow-y-auto landing">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
};