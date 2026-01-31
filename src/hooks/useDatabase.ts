import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

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
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      // Clear data when user logs out
      setGoals([]);
      setHabits([]);
      setJournalEntries([]);
      setLoading(false);
    }
  }, [user]);

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
    if (!user) return null;

    const { data, error } = await supabase
      .from('goals')
      .insert([{ ...goalData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error adding goal:', error);
      return null;
    }

    if (data) {
      setGoals(prev => [data, ...prev]);
      return data;
    }
    return null;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('goals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      return null;
    }

    if (data) {
      setGoals(prev => prev.map(g => g.id === id ? data : g));
      return data;
    }
    return null;
  };

  const addHabit = async (habitData: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('habits')
      .insert([{ ...habitData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error adding habit:', error);
      return null;
    }

    if (data) {
      setHabits(prev => [data, ...prev]);
      return data;
    }
    return null;
  };

  const addJournalEntry = async (entryData: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{ ...entryData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error adding journal entry:', error);
      return null;
    }

    if (data) {
      setJournalEntries(prev => [data, ...prev]);
      return data;
    }
    return null;
  };

  return {
    goals,
    habits,
    journalEntries,
    loading,
    addGoal,
    updateGoal,
    addHabit,
    addJournalEntry,
    refreshData: loadAllData
  };
}