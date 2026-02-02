import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useStorageMode } from '@/contexts/StorageModeContext';

const DEMO_KEYS = { goals: 'goals_app_demo_goals', habits: 'goals_app_demo_habits', journal: 'goals_app_demo_journal' } as const;

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  progress: number;
  due_date?: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  streak: number;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  title?: string;
  content: string;
  mood?: number;
  created_at: string;
  updated_at: string;
}

export function useDatabase() {
  const { user } = useAuth();
  const { isDemoMode } = useStorageMode();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // When user is logged in: always use database. When not logged in and on /demo: use localStorage only.
  const useLocalStorageOnly = !user && isDemoMode;

  useEffect(() => {
    if (user) {
      loadAllData();
      return;
    }
    if (useLocalStorageOnly) {
      setLoading(true);
      try {
        const g = localStorage.getItem(DEMO_KEYS.goals);
        const h = localStorage.getItem(DEMO_KEYS.habits);
        const j = localStorage.getItem(DEMO_KEYS.journal);
        setGoals(g ? JSON.parse(g) : []);
        setHabits(h ? JSON.parse(h) : []);
        setJournalEntries(j ? JSON.parse(j) : []);
      } catch {
        setGoals([]);
        setHabits([]);
        setJournalEntries([]);
      }
      setLoading(false);
      return;
    }
    setGoals([]);
    setHabits([]);
    setJournalEntries([]);
    setLoading(false);
  }, [user, useLocalStorageOnly]);

  const loadAllData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [goalsRes, habitsRes, journalRes] = await Promise.all([
        supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('journal_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);
      if (goalsRes.data) setGoals(goalsRes.data);
      if (habitsRes.data) setHabits(habitsRes.data);
      if (journalRes.data) setJournalEntries(journalRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
    if (useLocalStorageOnly) {
      const now = new Date().toISOString();
      const data: Goal = { ...goalData, id: crypto.randomUUID(), created_at: now, updated_at: now };
      setGoals(prev => {
        const next = [data, ...prev];
        localStorage.setItem(DEMO_KEYS.goals, JSON.stringify(next));
        return next;
      });
      return data;
    }
    if (!user) return null;
    const { data, error } = await supabase.from('goals').insert([{ ...goalData, user_id: user.id }]).select().single();
    if (error) { console.error('Error adding goal:', error); return null; }
    if (data) { setGoals(prev => [data, ...prev]); return data; }
    return null;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (useLocalStorageOnly) {
      const now = new Date().toISOString();
      setGoals(prev => {
        const next = prev.map(g => g.id === id ? { ...g, ...updates, updated_at: now } : g);
        localStorage.setItem(DEMO_KEYS.goals, JSON.stringify(next));
        return next;
      });
      return goals.find(g => g.id === id) ?? null;
    }
    if (!user) return null;
    const { data, error } = await supabase.from('goals').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id).select().single();
    if (error) { console.error('Error updating goal:', error); return null; }
    if (data) { setGoals(prev => prev.map(g => g.id === id ? data : g)); return data; }
    return null;
  };

  const addHabit = async (habitData: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => {
    if (useLocalStorageOnly) {
      const now = new Date().toISOString();
      const data: Habit = { ...habitData, id: crypto.randomUUID(), created_at: now, updated_at: now };
      setHabits(prev => {
        const next = [data, ...prev];
        localStorage.setItem(DEMO_KEYS.habits, JSON.stringify(next));
        return next;
      });
      return data;
    }
    if (!user) return null;
    const { data, error } = await supabase.from('habits').insert([{ ...habitData, user_id: user.id }]).select().single();
    if (error) { console.error('Error adding habit:', error); return null; }
    if (data) { setHabits(prev => [data, ...prev]); return data; }
    return null;
  };

  const addJournalEntry = async (entryData: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>) => {
    if (useLocalStorageOnly) {
      const now = new Date().toISOString();
      const data: JournalEntry = { ...entryData, id: crypto.randomUUID(), created_at: now, updated_at: now };
      setJournalEntries(prev => {
        const next = [data, ...prev];
        localStorage.setItem(DEMO_KEYS.journal, JSON.stringify(next));
        return next;
      });
      return data;
    }
    if (!user) return null;
    const { data, error } = await supabase.from('journal_entries').insert([{ ...entryData, user_id: user.id }]).select().single();
    if (error) { console.error('Error adding journal entry:', error); return null; }
    if (data) { setJournalEntries(prev => [data, ...prev]); return data; }
    return null;
  };

  const updateJournalEntry = async (id: string, updates: Partial<JournalEntry>) => {
    if (useLocalStorageOnly) {
      const now = new Date().toISOString();
      setJournalEntries(prev => {
        const next = prev.map(j => j.id === id ? { ...j, ...updates, updated_at: now } : j);
        localStorage.setItem(DEMO_KEYS.journal, JSON.stringify(next));
        return next;
      });
      return journalEntries.find(j => j.id === id) ?? null;
    }
    if (!user) return null;
    const { data, error } = await supabase.from('journal_entries').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id).select().single();
    if (error) { console.error('Error updating journal entry:', error); return null; }
    if (data) { setJournalEntries(prev => prev.map(j => j.id === id ? data : j)); return data; }
    return null;
  };

  const deleteJournalEntry = async (id: string) => {
    if (useLocalStorageOnly) {
      setJournalEntries(prev => {
        const next = prev.filter(j => j.id !== id);
        localStorage.setItem(DEMO_KEYS.journal, JSON.stringify(next));
        return next;
      });
      return true;
    }
    if (!user) return false;
    const { error } = await supabase.from('journal_entries').delete().eq('id', id).eq('user_id', user.id);
    if (error) { console.error('Error deleting journal entry:', error); return false; }
    setJournalEntries(prev => prev.filter(j => j.id !== id));
    return true;
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    if (useLocalStorageOnly) {
      const now = new Date().toISOString();
      setHabits(prev => {
        const next = prev.map(h => h.id === id ? { ...h, ...updates, updated_at: now } : h);
        localStorage.setItem(DEMO_KEYS.habits, JSON.stringify(next));
        return next;
      });
      return habits.find(h => h.id === id) ?? null;
    }
    if (!user) return null;
    const { data, error } = await supabase.from('habits').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id).select().single();
    if (error) { console.error('Error updating habit:', error); return null; }
    if (data) { setHabits(prev => prev.map(h => h.id === id ? data : h)); return data; }
    return null;
  };

  const deleteHabit = async (id: string) => {
    if (useLocalStorageOnly) {
      setHabits(prev => {
        const next = prev.filter(h => h.id !== id);
        localStorage.setItem(DEMO_KEYS.habits, JSON.stringify(next));
        return next;
      });
      return true;
    }
    if (!user) return false;
    const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', user.id);
    if (error) { console.error('Error deleting habit:', error); return false; }
    setHabits(prev => prev.filter(h => h.id !== id));
    return true;
  };

  const deleteGoal = async (id: string) => {
    if (useLocalStorageOnly) {
      setGoals(prev => {
        const next = prev.filter(g => g.id !== id);
        localStorage.setItem(DEMO_KEYS.goals, JSON.stringify(next));
        return next;
      });
      return true;
    }
    if (!user) return false;
    const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', user.id);
    if (error) { console.error('Error deleting goal:', error); return false; }
    setGoals(prev => prev.filter(g => g.id !== id));
    return true;
  };

  return {
    goals,
    habits,
    journalEntries,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    addHabit,
    updateHabit,
    deleteHabit,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    refreshData: loadAllData
  };
}