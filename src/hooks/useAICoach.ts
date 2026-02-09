import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  analyzeGoalWithAI,
  getCheckInQuestionsWithAI,
  getPersonalizedAdviceWithAI,
} from '@/lib/openaiProgressAnalysis';

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
      // Try Supabase edge function first (if deployed)
      try {
        const { data, error } = await supabase.functions.invoke('ai-coach', {
          body: { action: 'analyze', goalData },
        });
        if (!error && data?.data) return data.data;
      } catch {
        /* fallback to direct OpenAI */
      }

      // Direct OpenAI (uses VITE_OPENAI_API_KEY)
      const result = await analyzeGoalWithAI({
        title: goalData.title,
        description: goalData.description,
        timeline: goalData.timeline || '90',
        progress: goalData.progress ?? 0,
      });
      if (result) {
        return {
          successProbability: result.successProbability,
          obstacles: result.obstacles,
          strategies: result.strategies,
          motivation: result.motivation,
          suggestedDeadline: result.suggestedDeadline,
        };
      }
      toast({
        title: 'AI Analysis Failed',
        description: 'Could not analyze goal. Check your OpenAI API key or try again.',
        variant: 'destructive',
      });
      return null;
    } catch {
      toast({
        title: 'AI Analysis Failed',
        description: 'Could not analyze goal. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCheckInQuestions = async (goalData: any): Promise<string[]> => {
    setLoading(true);
    try {
      try {
        const { data, error } = await supabase.functions.invoke('ai-coach', {
          body: { action: 'checkin', goalData },
        });
        if (!error && data?.data?.questions?.length) return data.data.questions;
      } catch {
        /* fallback */
      }

      const questions = await getCheckInQuestionsWithAI(
        goalData.title,
        goalData.progress ?? 0
      );
      return questions;
    } catch {
      toast({
        title: 'Check-in Failed',
        description: 'Could not generate questions.',
        variant: 'destructive',
      });
      return [
        `What progress have you made on "${goalData.title}" recently?`,
        `What's one small step you could take today?`,
        `How do you feel about your current progress?`,
      ];
    } finally {
      setLoading(false);
    }
  };

  const getPersonalizedAdvice = async (goalData: any, userProgress: any): Promise<AIAdvice | null> => {
    setLoading(true);
    try {
      try {
        const { data, error } = await supabase.functions.invoke('ai-coach', {
          body: { action: 'advice', goalData, userProgress },
        });
        if (!error && data?.data) return data.data;
      } catch {
        /* fallback */
      }

      const result = await getPersonalizedAdviceWithAI(
        { title: goalData.title, progress: goalData.progress ?? 0 },
        {
          eventsCompleted: userProgress.eventsCompleted ?? 0,
          todosCompleted: userProgress.todosCompleted ?? 0,
          streak: userProgress.streak ?? 0,
        }
      );
      return result;
    } catch {
      toast({
        title: 'Advice Failed',
        description: 'Could not get advice.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeGoal, getCheckInQuestions, getPersonalizedAdvice, loading };
};
