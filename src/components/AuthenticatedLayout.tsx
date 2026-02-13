import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedHeader } from '@/components/AuthenticatedHeader';
import { AuthenticatedFooter } from '@/components/AuthenticatedFooter';
import { OfflineIndicator } from '@/components/OfflineIndicator';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen landing flex flex-col" style={{ backgroundColor: 'var(--landing-bg)', color: 'var(--landing-text)' }}>
      <AuthenticatedHeader />
      <main className="flex-1">
        {children}
      </main>
      <AuthenticatedFooter navigate={navigate} />
      <OfflineIndicator />
    </div>
  );
};
