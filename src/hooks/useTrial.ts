import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useTrial = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const startTrial = async (planType: 'premium' | 'family' = 'premium') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to start your free trial',
        variant: 'destructive',
      });
      return false;
    }

    setLoading(true);
    try {
      // Check if user already has an active subscription or trial
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .single();

      if (existing) {
        toast({
          title: 'Already Subscribed',
          description: 'You already have an active subscription or trial',
          variant: 'destructive',
        });
        return false;
      }

      // Calculate trial end date (7 days from now)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);
      const trialEnd = Math.floor(trialEndDate.getTime() / 1000);

      // Create trial subscription
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          status: 'trialing',
          plan_name: planType === 'family' ? 'Family Plan Trial' : 'Premium Plan Trial',
          trial_end: trialEnd,
          current_period_end: trialEnd,
        });

      if (error) throw error;

      toast({
        title: '🎉 Trial Started!',
        description: 'Enjoy 7 days of premium features completely free',
      });

      return true;
    } catch (error) {
      console.error('Failed to start trial:', error);
      toast({
        title: 'Error',
        description: 'Failed to start trial. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { startTrial, loading };
};
