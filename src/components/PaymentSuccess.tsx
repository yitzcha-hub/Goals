import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useSubscription } from '@/hooks/useSubscription';

const PaymentSuccess: React.FC = () => {
  const { user } = useAuth();
  const { refresh: refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      refreshSubscription();
      setTimeout(() => setLoading(false), 1000);
    } else {
      setLoading(false);
    }
  }, [refreshSubscription]);

  const handleContinue = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
          <CardTitle className="text-2xl text-emerald-800">Payment Successful!</CardTitle>
          <CardDescription>
            Welcome to Goals and Development Premium
          </CardDescription>
        </CardHeader>


        
        <CardContent className="text-center space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Your subscription is now active</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✓ 7-day free trial started</li>
              <li>✓ Full access to all premium features</li>
              <li>✓ Advanced analytics and insights</li>
              <li>✓ Priority customer support</li>
            </ul>
          </div>

          <div className="text-sm text-gray-600">
            <p>You can manage your subscription anytime from Settings.</p>
          </div>

          <Button onClick={handleContinue} className="w-full">
            Continue to Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
