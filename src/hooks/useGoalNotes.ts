import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface GoalNote {
  id: string;
  content: string;
  date: string;
  createdAt: string;
}

export function useGoalNotes(goalId: string | null) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<GoalNote[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user || !goalId) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('goal_notes')
        .select('id, content, date, created_at')
        .eq('goal_id', goalId)
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (error) throw error;
      setNotes(
        (data ?? []).map((r: { id: string; content: string; date: string; created_at: string }) => ({
          id: r.id,
          content: r.content,
          date: r.date,
          createdAt: r.created_at,
        }))
      );
    } catch (e) {
      console.error('Error loading goal notes:', e);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, goalId]);

  useEffect(() => {
    load();
  }, [load]);

  const addNote = useCallback(
    async (content: string, date: string) => {
      if (!user || !goalId) return;
      const { data, error } = await supabase
        .from('goal_notes')
        .insert({ goal_id: goalId, user_id: user.id, content, date })
        .select('id, content, date, created_at')
        .single();
      if (error) throw error;
      setNotes((prev) => [
        { id: data.id, content: data.content, date: data.date, createdAt: data.created_at },
        ...prev,
      ]);
    },
    [user?.id, goalId]
  );

  const deleteNote = useCallback(async (id: string) => {
    await supabase.from('goal_notes').delete().eq('id', id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notes, loading, addNote, deleteNote, refresh: load };
}
