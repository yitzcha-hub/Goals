import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Goal, Habit } from './useDatabase';

export interface Recommendation {
  id: string;
  type: 'goal' | 'habit' | 'milestone';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export function useRecommendations(goals: Goal[] = [], habits: Habit[] = []) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  // Ensure we always have valid arrays
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeHabits = Array.isArray(habits) ? habits : [];

  const fetchRecommendations = async () => {
    const safeGoals = Array.isArray(goals) ? goals : [];
    const safeHabits = Array.isArray(habits) ? habits : [];
    
    if (safeGoals.length === 0 && safeHabits.length === 0) {
      // Show default recommendations for new users
      setRecommendations([
        {
          id: 'default_1',
          type: 'goal',
          title: 'Set Your First Goal',
          description: 'Start your journey by setting a meaningful goal that excites you',
          priority: 'high'
        },
        {
          id: 'default_2',
          type: 'habit',
          title: 'Build a Daily Habit',
          description: 'Small daily actions compound into remarkable results over time',
          priority: 'high'
        }
      ]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: {
          goals: safeGoals.map(g => ({
            title: g.title,
            category: g.category,
            progress: g.progress,
            status: g.status
          })),
          habits: safeHabits.map(h => ({
            name: h.name,
            category: h.category,
            streak: h.streak,
            frequency: h.frequency
          })),
          userProfile: {
            totalGoals: safeGoals.length,
            totalHabits: safeHabits.length,
            avgProgress: safeGoals.length > 0 ? safeGoals.reduce((acc, g) => acc + (g.progress || 0), 0) / safeGoals.length : 0
          }
        }
      });

      if (error) {
        console.error('Error fetching recommendations:', error);
        return;
      }

      if (data?.recommendations && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error calling recommendations function:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we have valid arrays
    if (Array.isArray(goals) && Array.isArray(habits)) {
      fetchRecommendations();
    }
  }, [goals?.length, habits?.length]);






  const dismissRecommendation = (id: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  return {
    recommendations,
    loading,
    dismissRecommendation,
    refreshRecommendations: fetchRecommendations
  };
}