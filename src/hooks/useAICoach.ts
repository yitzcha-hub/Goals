import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface AIAnalysis {
  successProbability: number;
  obstacles: string[];
  strategies: string[];
  motivation: string;
  suggestedDeadline?: string;
}

export interface AICheckIn {
  questions: string[];
}

export interface AIAdvice {
  message: string;
  nextSteps: string[];
}

export const useAICoach = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const analyzeGoal = async (goalData: any): Promise<AIAnalysis | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { action: 'analyze', goalData }
      });

      if (error) throw error;
      return data.data;
    } catch (error) {
      toast({
        title: 'AI Analysis Failed',
        description: 'Could not analyze goal. Please try again.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCheckInQuestions = async (goalData: any): Promise<string[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { action: 'checkin', goalData }
      });

      if (error) throw error;
      return data.data.questions || [];
    } catch (error) {
      toast({
        title: 'Check-in Failed',
        description: 'Could not generate questions.',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getPersonalizedAdvice = async (goalData: any, userProgress: any): Promise<AIAdvice | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { action: 'advice', goalData, userProgress }
      });

      if (error) throw error;
      return data.data;
    } catch (error) {
      toast({
        title: 'Advice Failed',
        description: 'Could not get advice.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeGoal, getCheckInQuestions, getPersonalizedAdvice, loading };
};
