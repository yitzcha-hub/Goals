import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (user) {
      navigate('/', { replace: true });
      return;
    }

    // No user after loading – might be error in hash or user closed provider window
    const t = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, [user, loading, navigate]);

  useEffect(() => {
    if (timedOut) {
      navigate('/', { replace: true });
    }
  }, [timedOut, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Completing sign in…
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You will be redirected to the app in a moment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
