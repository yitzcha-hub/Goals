import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useStorageMode } from '@/contexts/StorageModeContext';

const DEMO_KEY_BUDGETS = 'goals_app_demo_construction_budgets';
const DEMO_KEY_EXPENSES = 'goals_app_demo_construction_expenses';

export interface Expense {
  id: string;
  phase: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  receiptUrl?: string;
}

export function useConstructionBudget() {
  const { user } = useAuth();
  const { isDemoMode } = useStorageMode();
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [expenses, setExpenses] = useState<Expense[]>([]);
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
        const b = localStorage.getItem(DEMO_KEY_BUDGETS);
        const e = localStorage.getItem(DEMO_KEY_EXPENSES);
        setBudgets(b ? JSON.parse(b) : {});
        setExpenses(e ? JSON.parse(e) : []);
      } catch {
        setBudgets({});
        setExpenses([]);
      }
      setLoading(false);
      return;
    }
    setBudgets({});
    setExpenses([]);
    setLoading(false);
  }, [user, useLocalStorageOnly]);

  const loadBudgets = async () => {
    if (!user) return {};
    const { data } = await supabase.from('construction_budgets').select('*').eq('user_id', user.id);
    const map: Record<string, number> = {};
    (data ?? []).forEach((row: { phase: string; amount: number }) => {
      map[row.phase] = Number(row.amount);
    });
    return map;
  };

  const loadExpenses = async (): Promise<Expense[]> => {
    if (!user) return [];
    const { data } = await supabase.from('construction_expenses').select('*').eq('user_id', user.id).order('date', { ascending: false });
    return (data ?? []).map((row: { id: string; phase: string; category: string; amount: number; description: string; date: string; receipt_url?: string }) => ({
      id: row.id,
      phase: row.phase,
      category: row.category,
      amount: Number(row.amount),
      description: row.description ?? '',
      date: row.date,
      receiptUrl: row.receipt_url
    }));
  };

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [budgetMap, expenseList] = await Promise.all([loadBudgets(), loadExpenses()]);
      setBudgets(budgetMap);
      setExpenses(expenseList);
    } finally {
      setLoading(false);
    }
  };

  const setBudget = async (phase: string, amount: number) => {
    if (useLocalStorageOnly) {
      setBudgets(prev => {
        const next = { ...prev, [phase]: amount };
        localStorage.setItem(DEMO_KEY_BUDGETS, JSON.stringify(next));
        return next;
      });
      return;
    }
    if (!user) return;
    await supabase.from('construction_budgets').upsert(
      { user_id: user.id, phase, amount },
      { onConflict: 'user_id,phase' }
    );
    setBudgets(prev => ({ ...prev, [phase]: amount }));
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (useLocalStorageOnly) {
      const data: Expense = { ...expense, id: crypto.randomUUID() };
      setExpenses(prev => {
        const next = [data, ...prev];
        localStorage.setItem(DEMO_KEY_EXPENSES, JSON.stringify(next));
        return next;
      });
      return;
    }
    if (!user) return;
    const { data, error } = await supabase.from('construction_expenses').insert({
      user_id: user.id,
      phase: expense.phase,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      date: expense.date,
      receipt_url: expense.receiptUrl
    }).select('id').single();
    if (!error && data) {
      setExpenses(prev => [{ ...expense, id: data.id }, ...prev]);
    }
  };

  return { budgets, expenses, loading, setBudget, addExpense, refresh: loadAll };
}
