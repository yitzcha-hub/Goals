import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type GoalNotePhase = 1 | 2 | 3 | 4;

export interface GoalNote {
  id: string;
  content: string;
  date: string;
  createdAt: string;
  phase: GoalNotePhase;
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
        .select('id, content, date, created_at, phase')
        .eq('goal_id', goalId)
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (error) throw error;
      setNotes(
        (data ?? []).map((r: { id: string; content: string; date: string; created_at: string; phase?: number }) => ({
          id: r.id,
          content: r.content,
          date: r.date,
          createdAt: r.created_at,
          phase: (r.phase >= 1 && r.phase <= 4 ? r.phase : 1) as GoalNotePhase,
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
    async (content: string, date: string, phase: GoalNotePhase = 1) => {
      if (!user || !goalId) return;
      const { data, error } = await supabase
        .from('goal_notes')
        .insert({ goal_id: goalId, user_id: user.id, content, date, phase })
        .select('id, content, date, created_at, phase')
        .single();
      if (error) throw error;
      const p = (data.phase >= 1 && data.phase <= 4 ? data.phase : 1) as GoalNotePhase;
      setNotes((prev) => [
        { id: data.id, content: data.content, date: data.date, createdAt: data.created_at, phase: p },
        ...prev,
      ]);
    },
    [user?.id, goalId]
  );

  const deleteNote = useCallback(async (id: string) => {
    await supabase.from('goal_notes').delete().eq('id', id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const updateNote = useCallback(
    async (id: string, updates: Partial<Pick<GoalNote, 'content' | 'date' | 'phase'>>) => {
      if (!user || !goalId) return;
      const payload: { content?: string; date?: string; phase?: number } = {};
      if (updates.content != null) payload.content = updates.content;
      if (updates.date != null) payload.date = updates.date;
      if (updates.phase != null) payload.phase = updates.phase;
      const { data, error } = await supabase
        .from('goal_notes')
        .update(payload)
        .eq('id', id)
        .eq('goal_id', goalId)
        .eq('user_id', user.id)
        .select('id, content, date, created_at, phase')
        .single();
      if (error) throw error;
      const p = (data.phase >= 1 && data.phase <= 4 ? data.phase : 1) as GoalNotePhase;
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, content: data.content, date: data.date, createdAt: data.created_at, phase: p } : n
        )
      );
    },
    [user?.id, goalId]
  );

  return { notes, loading, addNote, updateNote, deleteNote, refresh: load };
}
