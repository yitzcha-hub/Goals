import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type SubscriptionTier = 'free' | 'premium' | 'family';

interface SubscriptionData {
  tier: SubscriptionTier;
  status: string | null;
  isActive: boolean;
  isPremium: boolean;
  isFamily: boolean;
  isTrial: boolean;
  trialEnd: number | null;
  trialDaysRemaining: number | null;
  periodEnd: number | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    tier: 'free',
    status: null,
    isActive: false,
    isPremium: false,
    isFamily: false,
    isTrial: false,
    trialEnd: null,
    trialDaysRemaining: null,
    periodEnd: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .in('status', ['active', 'trialing'])
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const isFamily = data.plan_name?.toLowerCase().includes('family') || false;
        const isTrial = data.status === 'trialing';
        const isPremium = data.status === 'active' || isTrial;
        
        // Calculate trial days remaining
        let trialDaysRemaining = null;
        if (isTrial && data.trial_end) {
          const trialEndDate = new Date(data.trial_end * 1000);
          const now = new Date();
          const diffTime = trialEndDate.getTime() - now.getTime();
          trialDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // If trial expired, set to 0
          if (trialDaysRemaining < 0) trialDaysRemaining = 0;
        }
        
        setSubscription({
          tier: isFamily ? 'family' : isPremium ? 'premium' : 'free',
          status: data.status,
          isActive: isPremium,
          isPremium,
          isFamily,
          isTrial,
          trialEnd: data.trial_end,
          trialDaysRemaining,
          periodEnd: data.current_period_end,
        });
      } else {
        setSubscription({
          tier: 'free',
          status: null,
          isActive: false,
          isPremium: false,
          isFamily: false,
          isTrial: false,
          trialEnd: null,
          trialDaysRemaining: null,
          periodEnd: null,
        });
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasFeatureAccess = (feature: 'ai-coach' | 'advanced-analytics' | 'family-groups' | 'collaboration'): boolean => {
    switch (feature) {
      case 'ai-coach':
      case 'advanced-analytics':
        return subscription.isPremium || subscription.isFamily;
      case 'family-groups':
        return subscription.isFamily;
      case 'collaboration':
        return subscription.isPremium || subscription.isFamily;
      default:
        return true;
    }
  };

  return {
    ...subscription,
    loading,
    hasFeatureAccess,
    refresh: fetchSubscription,
  };
};

