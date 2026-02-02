import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useStorageMode } from '@/contexts/StorageModeContext';

const DEMO_KEY_MANIFESTATION = 'goals_app_demo_manifestation';

export interface ManifestationGoal {
  id: string;
  title: string;
  description: string;
  timeline: '30' | '60' | '90' | '1year' | '5year';
  progress: number;
  imageUrl?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  recommendations: string[];
}

export interface ManifestationTodo {
  id: string;
  title: string;
  completed: boolean;
  points: number;
  createdAt: string;
}

export interface ManifestationGratitude {
  id: string;
  content: string;
  date: string;
}

export interface ManifestationJournalEntry {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  mood: 'great' | 'good' | 'okay' | 'tough';
  date: string;
}

function persistDemo(state: { goals: ManifestationGoal[]; todos: ManifestationTodo[]; gratitudeEntries: ManifestationGratitude[]; journalEntries: ManifestationJournalEntry[]; totalPoints: number; streak: number }) {
  try {
    localStorage.setItem(DEMO_KEY_MANIFESTATION, JSON.stringify(state));
  } catch {}
}

export function useManifestationDatabase() {
  const { user } = useAuth();
  const { isDemoMode } = useStorageMode();
  const [goals, setGoals] = useState<ManifestationGoal[]>([]);
  const [todos, setTodos] = useState<ManifestationTodo[]>([]);
  const [gratitudeEntries, setGratitudeEntries] = useState<ManifestationGratitude[]>([]);
  const [journalEntries, setJournalEntries] = useState<ManifestationJournalEntry[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const useLocalStorageOnly = !user && isDemoMode;

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [goalsRes, todosRes, gratitudeRes, journalRes, statsRes] = await Promise.all([
        supabase.from('manifestation_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('manifestation_todos').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('manifestation_gratitude_entries').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('manifestation_journal_entries').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('manifestation_stats').select('*').eq('user_id', user.id).maybeSingle()
      ]);
      if (goalsRes.data) setGoals(goalsRes.data.map((r: any) => ({ id: r.id, title: r.title, description: r.description ?? '', timeline: r.timeline, progress: r.progress, imageUrl: r.image_url, priority: r.priority, createdAt: r.created_at, recommendations: (r.recommendations ?? []) as string[] })));
      if (todosRes.data) setTodos(todosRes.data.map((r: any) => ({ id: r.id, title: r.title, completed: r.completed, points: r.points, createdAt: r.created_at })));
      if (gratitudeRes.data) setGratitudeEntries(gratitudeRes.data.map((r: any) => ({ id: r.id, content: r.content, date: r.date })));
      if (journalRes.data) setJournalEntries(journalRes.data.map((r: any) => ({ id: r.id, title: r.title ?? '', content: r.content, imageUrl: r.image_url, mood: r.mood, date: r.date })));
      if (statsRes.data) {
        setTotalPoints(statsRes.data.total_points ?? 0);
        setStreak(statsRes.data.streak ?? 0);
      }
    } catch (e) {
      console.error('Error loading manifestation data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAll();
      return;
    }
    if (useLocalStorageOnly) {
      setLoading(true);
      try {
        const raw = localStorage.getItem(DEMO_KEY_MANIFESTATION);
        if (raw) {
          const data = JSON.parse(raw);
          setGoals(data.goals ?? []);
          setTodos(data.todos ?? []);
          setGratitudeEntries(data.gratitudeEntries ?? []);
          setJournalEntries(data.journalEntries ?? []);
          setTotalPoints(data.totalPoints ?? 0);
          setStreak(data.streak ?? 0);
        } else {
          setGoals([]);
          setTodos([]);
          setGratitudeEntries([]);
          setJournalEntries([]);
          setTotalPoints(0);
          setStreak(0);
        }
      } catch {
        setGoals([]);
        setTodos([]);
        setGratitudeEntries([]);
        setJournalEntries([]);
        setTotalPoints(0);
        setStreak(0);
      }
      setLoading(false);
      return;
    }
    setGoals([]);
    setTodos([]);
    setGratitudeEntries([]);
    setJournalEntries([]);
    setTotalPoints(0);
    setStreak(0);
    setLoading(false);
  }, [user, useLocalStorageOnly]);

  const updateStats = async (pointsDelta: number, streakDelta: number) => {
    if (useLocalStorageOnly) return; // Demo handlers update state and persist directly
    if (!user) return;
    const newPoints = totalPoints + pointsDelta;
    const newStreak = Math.max(0, streak + streakDelta);
    await supabase.from('manifestation_stats').upsert({ user_id: user.id, total_points: newPoints, streak: newStreak, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    setTotalPoints(newPoints);
    setStreak(newStreak);
  };

  const addGoal = async (goal: Omit<ManifestationGoal, 'id' | 'createdAt'>) => {
    if (useLocalStorageOnly) {
      const now = new Date().toISOString();
      const data: ManifestationGoal = { ...goal, id: crypto.randomUUID(), createdAt: now };
      setGoals(prev => {
        const next = [data, ...prev];
        persistDemo({ goals: next, todos, gratitudeEntries, journalEntries, totalPoints: totalPoints + 10, streak });
        return next;
      });
      setTotalPoints(p => p + 10);
      return;
    }
    if (!user) return;
    const { data, error } = await supabase.from('manifestation_goals').insert({
      user_id: user.id,
      title: goal.title,
      description: goal.description,
      timeline: goal.timeline,
      progress: goal.progress,
      image_url: goal.imageUrl,
      priority: goal.priority,
      recommendations: goal.recommendations ?? []
    }).select('id,created_at').single();
    if (error) throw error;
    setGoals(prev => [{ ...goal, id: data.id, createdAt: data.created_at }, ...prev]);
    await updateStats(10, 0);
  };

  const updateGoalProgress = async (goalId: string, progress: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const wasComplete = goal.progress === 10;
    const isNowComplete = progress === 10;
    if (useLocalStorageOnly) {
      setGoals(prev => {
        const next = prev.map(g => g.id === goalId ? { ...g, progress } : g);
        const newPoints = totalPoints + (isNowComplete && !wasComplete ? 100 : 0);
        persistDemo({ goals: next, todos, gratitudeEntries, journalEntries, totalPoints: newPoints, streak });
        return next;
      });
      if (isNowComplete && !wasComplete) setTotalPoints(p => p + 100);
      return;
    }
    await supabase.from('manifestation_goals').update({ progress }).eq('id', goalId);
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, progress } : g));
    if (!wasComplete && isNowComplete) await updateStats(100, 0);
  };

  const deleteGoal = async (goalId: string) => {
    if (useLocalStorageOnly) {
      setGoals(prev => {
        const next = prev.filter(g => g.id !== goalId);
        persistDemo({ goals: next, todos, gratitudeEntries, journalEntries, totalPoints, streak });
        return next;
      });
      return;
    }
    await supabase.from('manifestation_goals').delete().eq('id', goalId);
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const addTodo = async (todo: Omit<ManifestationTodo, 'id' | 'createdAt'>) => {
    if (useLocalStorageOnly) {
      const now = new Date().toISOString();
      const data: ManifestationTodo = { ...todo, id: crypto.randomUUID(), createdAt: now };
      setTodos(prev => {
        const next = [data, ...prev];
        persistDemo({ goals, todos: next, gratitudeEntries, journalEntries, totalPoints, streak });
        return next;
      });
      return;
    }
    if (!user) return;
    const { data, error } = await supabase.from('manifestation_todos').insert({
      user_id: user.id,
      title: todo.title,
      completed: todo.completed,
      points: todo.points
    }).select('id,created_at').single();
    if (error) throw error;
    setTodos(prev => [{ ...todo, id: data.id, createdAt: data.created_at }, ...prev]);
  };

  const toggleTodo = async (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;
    const newCompleted = !todo.completed;
    if (useLocalStorageOnly) {
      setTodos(prev => {
        const next = prev.map(t => t.id === todoId ? { ...t, completed: newCompleted } : t);
        const newPoints = totalPoints + (newCompleted ? todo.points : 0);
        persistDemo({ goals, todos: next, gratitudeEntries, journalEntries, totalPoints: newPoints, streak });
        return next;
      });
      if (newCompleted) setTotalPoints(p => p + todo.points);
      return;
    }
    await supabase.from('manifestation_todos').update({ completed: newCompleted }).eq('id', todoId);
    setTodos(prev => prev.map(t => t.id === todoId ? { ...t, completed: newCompleted } : t));
    if (newCompleted) await updateStats(todo.points, 0);
  };

  const deleteTodo = async (todoId: string) => {
    if (useLocalStorageOnly) {
      setTodos(prev => {
        const next = prev.filter(t => t.id !== todoId);
        persistDemo({ goals, todos: next, gratitudeEntries, journalEntries, totalPoints, streak });
        return next;
      });
      return;
    }
    await supabase.from('manifestation_todos').delete().eq('id', todoId);
    setTodos(prev => prev.filter(t => t.id !== todoId));
  };

  const addGratitude = async (content: string) => {
    const date = new Date().toISOString().split('T')[0];
    if (useLocalStorageOnly) {
      const data: ManifestationGratitude = { id: crypto.randomUUID(), content, date };
      setGratitudeEntries(prev => {
        const next = [data, ...prev];
        persistDemo({ goals, todos, gratitudeEntries: next, journalEntries, totalPoints: totalPoints + 5, streak: streak + 1 });
        return next;
      });
      setTotalPoints(p => p + 5);
      setStreak(s => s + 1);
      return;
    }
    if (!user) return;
    const { data, error } = await supabase.from('manifestation_gratitude_entries').insert({
      user_id: user.id,
      content,
      date
    }).select('id,date').single();
    if (error) throw error;
    setGratitudeEntries(prev => [{ id: data.id, content, date: data.date }, ...prev]);
    await updateStats(5, 1);
  };

  const addJournalEntry = async (entry: Omit<ManifestationJournalEntry, 'id'>) => {
    const date = entry.date.split('T')[0];
    if (useLocalStorageOnly) {
      const data: ManifestationJournalEntry = { ...entry, id: crypto.randomUUID(), date };
      setJournalEntries(prev => {
        const next = [data, ...prev];
        persistDemo({ goals, todos, gratitudeEntries, journalEntries: next, totalPoints: totalPoints + 15, streak });
        return next;
      });
      setTotalPoints(p => p + 15);
      return;
    }
    if (!user) return;
    const { data, error } = await supabase.from('manifestation_journal_entries').insert({
      user_id: user.id,
      title: entry.title,
      content: entry.content,
      image_url: entry.imageUrl,
      mood: entry.mood,
      date
    }).select('id,date').single();
    if (error) throw error;
    setJournalEntries(prev => [{ ...entry, id: data.id, date: data.date }, ...prev]);
    await updateStats(15, 0);
  };

  return {
    goals,
    todos,
    gratitudeEntries,
    journalEntries,
    totalPoints,
    streak,
    loading,
    addGoal,
    updateGoalProgress,
    deleteGoal,
    addTodo,
    toggleTodo,
    deleteTodo,
    addGratitude,
    addJournalEntry,
    refresh: loadAll
  };
}
