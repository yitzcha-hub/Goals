import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { PasswordResetForm } from './PasswordResetForm';

type AuthMode = 'login' | 'signup' | 'reset';

interface AuthModalProps {
  trigger?: React.ReactNode;
  defaultMode?: AuthMode;
  /** When provided, dialog is controlled (e.g. open from mobile nav without unmounting when sheet closes). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ trigger, defaultMode = 'login', open: controlledOpen, onOpenChange: controlledOnOpenChange }) => {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

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
      {trigger != null && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent max-h-[90vh] overflow-y-auto landing">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        {renderForm()}
      </DialogContent>
    </Dialog>
  );
};