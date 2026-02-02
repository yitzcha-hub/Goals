import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useStorageMode } from '@/contexts/StorageModeContext';

const DEMO_KEY_FITNESS = 'goals_app_demo_fitness_activity';

export interface DailyActivity {
  date: string;
  steps: number;
  calories: number;
  distance: number;
  activeMinutes: number;
}

export function useFitnessActivity() {
  const { user } = useAuth();
  const { isDemoMode } = useStorageMode();
  const [activityHistory, setActivityHistory] = useState<Record<string, DailyActivity>>({});
  const [loading, setLoading] = useState(true);

  const useLocalStorageOnly = !user && isDemoMode;

  useEffect(() => {
    if (user) {
      loadAll();
      return;
    }
    if (useLocalStorageOnly) {
      setLoading(true);
      try {
        const raw = localStorage.getItem(DEMO_KEY_FITNESS);
        setActivityHistory(raw ? JSON.parse(raw) : {});
      } catch {
        setActivityHistory({});
      }
      setLoading(false);
      return;
    }
    setActivityHistory({});
    setLoading(false);
  }, [user, useLocalStorageOnly]);

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fitness_daily_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      const map: Record<string, DailyActivity> = {};
      (data ?? []).forEach((row: { date: string; steps: number; calories: number; distance: number; active_minutes: number }) => {
        map[row.date] = {
          date: row.date,
          steps: row.steps,
          calories: row.calories,
          distance: Number(row.distance),
          activeMinutes: row.active_minutes
        };
      });
      setActivityHistory(map);
    } catch (e) {
      console.error('Error loading fitness activity:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveActivity = async (activity: DailyActivity) => {
    if (useLocalStorageOnly) {
      setActivityHistory(prev => {
        const next = { ...prev, [activity.date]: activity };
        localStorage.setItem(DEMO_KEY_FITNESS, JSON.stringify(next));
        return next;
      });
      return;
    }
    if (!user) return;
    try {
      await supabase.from('fitness_daily_activity').upsert({
        user_id: user.id,
        date: activity.date,
        steps: activity.steps,
        calories: activity.calories,
        distance: activity.distance,
        active_minutes: activity.activeMinutes
      }, { onConflict: 'user_id,date' });
      setActivityHistory(prev => ({ ...prev, [activity.date]: activity }));
    } catch (e) {
      console.error('Error saving fitness activity:', e);
    }
  };

  return { activityHistory, loading, saveActivity, refresh: loadAll };
}
