import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Check, Loader2, Leaf, Flame, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { useTrial } from '@/hooks/useTrial';
import { useSubscription } from '@/hooks/useSubscription';

const PricingSection: React.FC = () => {
  const { user } = useAuth();
  const { startTrial, loading: trialLoading } = useTrial();
  const { isTrial, isPremium, refresh: refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const handleStartTrial = async (planType: 'premium' | 'family') => {
    const success = await startTrial(planType);
    if (success) {
      window.location.href = '/';
    }
  };

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      return;
    }

    setLoading(planName);
    try {
      // Use same-origin so it works with vercel dev (port 5000) and with Vite proxy to API
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.id }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(
          res.ok
            ? 'Invalid response from server.'
            : 'Checkout is not available. Run the app with API support (npm run dev:api) when testing locally.'
        );
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      const message =
        error instanceof SyntaxError || (error instanceof Error && error.message.includes('Checkout is not available'))
          ? 'Checkout is not available. Run the app with API support (npm run dev:api) when testing locally.'
          : error instanceof Error
            ? error.message
            : 'Failed to start subscription. Please try again.';
      console.error('Subscription error:', error);
      alert(message);
    } finally {
      setLoading(null);
    }
  };

  const monthlyPriceId = import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY;
  const annualPriceId = import.meta.env.VITE_STRIPE_PRICE_ID_ANNUAL;

  const handleRedeemCode = async () => {
    if (!user || !inviteCode.trim()) return;
    setRedeemError(null);
    setRedeemSuccess(false);
    setRedeemLoading(true);
    try {
      const res = await fetch('/api/redeem-invite-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode.trim(), userId: user.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRedeemError((data?.error as string) || 'Failed to redeem code');
        return;
      }
      setRedeemSuccess(true);
      setInviteCode('');
      refreshSubscription?.();
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleLifetime1000 = async () => {
    if (!user) {
      return;
    }
    setLoading('Lifetime');
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer: 'lifetime_1000', userId: user.id }),
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(res.ok ? 'Invalid response from server.' : 'Checkout is not available. Run the app with API support (npm run dev:api) when testing locally.');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start checkout. Please try again.';
      console.error('Lifetime checkout error:', error);
      alert(message);
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: 'Monthly',
      price: '$4.99',
      originalPrice: '$7.49',
      period: '/month',
      dailyEquivalent: '16¢ a day',
      priceId: monthlyPriceId || 'price_monthly',
      description: 'Early bird special — 33% savings',
      features: [
        'All goal timelines (30 days - 5 years)',
        '0-10 progress tracking scale',
        'Vision board with photo uploads',
        'To-do list with rewards',
        'Gratitude journal',
        'Life journal with photos',
        'Smart recommendations',
        'Email support'
      ],
      popular: false,
      highlight: false
    },
    {
      name: 'Annual',
      price: '$39.99',
      originalPrice: '$59.99',
      period: '/year',
      dailyEquivalent: '11¢ a day',
      priceId: annualPriceId || 'price_yearly',
      description: 'Early bird special — over 33% savings',
      monthlyEquivalent: '$3.33/month',
      features: [
        'Everything in Monthly',
        'Priority support',
        'Advanced analytics',
        'Goal templates library',
        'Data export',
        'Early access to new features',
        'Custom AI recommendations'
      ],
      popular: true,
      highlight: false
    }
  ];


  return (
    <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
            <Flame className="h-3 w-3 mr-1" />
            7 Day FREE Trial
          </Badge>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600">
            Start free for 7 days, then choose the plan that works for you
          </p>
        </div>

        {/* First 1,000 subscribers — lifetime membership */}
        <div className="max-w-xl mx-auto mb-10">
          <Card className="border-2 border-green-600 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
            <CardHeader className="text-center pb-2">
              <Badge className="w-fit mx-auto mb-2 bg-green-600">Limited offer</Badge>
              <CardTitle className="text-xl">First 1,000 Subscribers — Lifetime Membership</CardTitle>
              <CardDescription>One payment. Lifetime access. Our fastest way to get you signed up.</CardDescription>
              <div className="mt-3">
                <span className="text-4xl font-bold text-green-700">$19.99</span>
                <span className="text-gray-600 text-sm"> one time</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {user ? (
                <Button
                  onClick={handleLifetime1000}
                  disabled={loading === 'Lifetime'}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  {loading === 'Lifetime' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Leaf className="h-4 w-4 mr-2" />}
                  Get Lifetime Access — $19.99
                </Button>
              ) : (
                <AuthModal
                  trigger={
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                      <Leaf className="h-4 w-4 mr-2" />
                      Get Lifetime Access — $19.99
                    </Button>
                  }
                  defaultMode="signup"
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative border-2 transition-all hover:shadow-xl bg-white ${
                plan.popular ? 'border-orange-400 shadow-lg' : 
                plan.highlight ? 'border-green-500 shadow-lg' : 
                'border-green-200 hover:border-green-300'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                  <Flame className="h-3 w-3 mr-1" />
                  Best Value
                </Badge>
              )}
              {plan.highlight && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-lime-500 text-white">
                  Maximum Savings
                </Badge>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  {'originalPrice' in plan && plan.originalPrice && (
                    <p className="text-sm text-gray-500">
                      <span className="line-through">{plan.originalPrice}</span>
                      <span className="ml-1 text-green-600 font-medium">Early bird</span>
                    </p>
                  )}
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-orange-600' : 'text-gray-800'}`}>
                    {plan.price}
                  </span>
                  <span className="text-gray-600 text-sm">{plan.period}</span>
                </div>
                {plan.dailyEquivalent && (
                  <p className="text-sm text-gray-600 font-medium mt-1">
                    {plan.dailyEquivalent}
                  </p>
                )}
                {plan.monthlyEquivalent && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    Just {plan.monthlyEquivalent}!
                  </p>
                )}
              </CardHeader>

              <CardContent className="pt-4">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-orange-500' : 'text-green-500'}`} />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {user ? (
                  <div className="space-y-2">
                    {!isTrial && !isPremium && (
                      <Button
                        onClick={() => handleStartTrial('premium')}
                        disabled={trialLoading}
                        className="w-full bg-gradient-to-r from-green-600 to-lime-500 hover:from-green-700 hover:to-lime-600"
                      >
                        {trialLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Leaf className="h-4 w-4 mr-2" />
                        )}
                        Start 7 Day Free Trial
                      </Button>

                    )}
                    <Button
                      onClick={() => handleSubscribe(plan.priceId, plan.name)}
                      disabled={loading === plan.name}
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600' 
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {loading === plan.name ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {isTrial || isPremium ? 'Upgrade Now' : 'Subscribe'}
                    </Button>
                  </div>
                ) : (
                  <AuthModal
                    trigger={
                      <Button 
                        className={`w-full ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600' 
                            : 'bg-gradient-to-r from-green-600 to-lime-500 hover:from-green-700 hover:to-lime-600'
                        }`}
                      >
                        <Flame className="h-4 w-4 mr-2" />
                        Start 7 Day Free Trial
                      </Button>
                    }
                    defaultMode="signup"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          All plans include a 7-day free trial. Cancel anytime. No credit card required to start.
        </p>

        <section id="invite-code" className="max-w-md mx-auto mt-10 scroll-mt-24">
          <Card className="border border-green-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-600" />
                Redeem invite code
              </CardTitle>
              <CardDescription>Influencer or partner code? Enter it here for lifetime access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!user ? (
                <AuthModal
                  trigger={<Button variant="outline" className="w-full">Sign in to redeem your code</Button>}
                  defaultMode="signup"
                />
              ) : redeemSuccess ? (
                <p className="text-sm font-medium text-green-700">Lifetime membership activated. You’re all set!</p>
              ) : (
                <>
                  <Input
                    placeholder="Enter code"
                    value={inviteCode}
                    onChange={(e) => { setInviteCode(e.target.value); setRedeemError(null); }}
                    className="uppercase"
                  />
                  {redeemError && <p className="text-sm text-red-600">{redeemError}</p>}
                  <Button
                    onClick={handleRedeemCode}
                    disabled={redeemLoading || !inviteCode.trim()}
                    className="w-full"
                    variant="secondary"
                  >
                    {redeemLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Redeem code
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        <p className="text-center text-sm text-gray-500 mt-6">
          Have an invite code?{' '}
          <a href="/#invite-code" className="text-green-600 font-medium hover:underline">
            Redeem it here
          </a>
          .{' '}
          <a href="/invite-codes" className="text-green-600 font-medium hover:underline">
            Access invite codes
          </a>
          .
        </p>

      </div>
    </section>
  );
};

export default PricingSection;
