import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/** Protects routes that require authentication. Redirects to / if not logged in. */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen landing" style={{ backgroundColor: 'var(--landing-bg)' }}>
        <div className="text-center" style={{ color: 'var(--landing-primary)' }}>
          <div className="h-16 w-16 mx-auto mb-4 rounded-full border-4 border-current border-t-transparent animate-spin" />
          <p className="font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
