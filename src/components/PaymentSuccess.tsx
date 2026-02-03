import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useSubscription } from '@/hooks/useSubscription';

const PaymentSuccess: React.FC = () => {
  const { refresh: refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (!sessionId) {
      setError('No checkout session found.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/confirm-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const data = res.ok ? await res.json().catch(() => ({})) : await res.json().catch(() => ({}));

        if (cancelled) return;

        if (!res.ok) {
          setError((data?.error as string) || 'Failed to confirm payment.');
          setLoading(false);
          return;
        }

        refreshSubscription();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        if (!cancelled) {
          setError('Something went wrong. Your payment may still have succeeded—check Settings for your subscription.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshSubscription]);

  const handleContinue = () => {
    navigate('/');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center gap-4 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm text-muted-foreground">Confirming your subscription…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-amber-700" />
            </div>
            <CardTitle className="text-xl text-amber-800">Could not confirm payment</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button variant="outline" onClick={() => navigate('/settings')}>
              Check subscription in Settings
            </Button>
            <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-700" />
          </div>
          <CardTitle className="text-2xl text-emerald-800">Payment successful</CardTitle>
          <CardDescription>Welcome to Goals and Development Premium</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Your subscription is now active</h3>
            <ul className="text-sm text-green-700 space-y-1 text-left list-disc list-inside">
              <li>Full access to all premium features</li>
              <li>Advanced analytics and insights</li>
              <li>Priority customer support</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            You can manage your subscription and see active days in Settings.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleContinue} className="w-full">
              Continue to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={handleSettings}>
              View subscription in Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
