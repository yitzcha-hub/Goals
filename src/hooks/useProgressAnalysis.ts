import { useState, useCallback } from 'react';
import {
  analyzeProgressWithAI,
  analyzeGoalWithAI,
  type ProgressAnalysisInput,
  type AIProgressAnalysis,
  type GoalAnalysisInput,
  type AIGoalAnalysis,
} from '@/lib/openaiProgressAnalysis';

export function useProgressAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeProgress = useCallback(async (input: ProgressAnalysisInput): Promise<AIProgressAnalysis | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeProgressWithAI(input);
      if (!result) {
        setError('Could not analyze progress. Check your OpenAI API key.');
      }
      return result;
    } catch (e: any) {
      setError(e?.message || 'Failed to analyze progress.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeGoal = useCallback(async (input: GoalAnalysisInput): Promise<AIGoalAnalysis | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeGoalWithAI(input);
      return result;
    } catch (e: any) {
      setError(e?.message || 'Failed to analyze goal.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyzeProgress, analyzeGoal, loading, error };
}
