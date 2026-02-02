import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import ExpenseEntry from './ExpenseEntry';
import BudgetComparison from './BudgetComparison';
import FinancialReport from './FinancialReport';
import BudgetAlert from './BudgetAlert';
import { DollarSign, TrendingUp, FileText } from 'lucide-react';
import { useConstructionBudget } from '@/hooks/useConstructionBudget';

const phases = [
  'Foundation Complete',
  'Framing Done',
  'Roofing Finished',
  'Electrical/Plumbing',
  'Interior Finishing'
];

interface Expense {
  id: string;
  phase: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  receiptUrl?: string;
}

export default function BudgetTracker() {
  const { budgets, expenses, loading, setBudget, addExpense } = useConstructionBudget();

  const handleBudgetChange = (phase: string, amount: string) => {
    const value = parseFloat(amount) || 0;
    setBudget(phase, value);
  };

  const handleExpenseAdded = (expense: { phase: string; category: string; amount: number; description: string; date: string; receiptUrl?: string }) => {
    addExpense(expense);
  };

  const getPhaseSpent = (phase: string) => {
    return expenses
      .filter(exp => exp.phase === phase)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const budgetData = phases.map(phase => ({
    phase,
    budget: budgets[phase] || 0,
    spent: getPhaseSpent(phase)
  }));

  const totalBudget = Object.values(budgets).reduce((sum, budget) => sum + budget, 0);
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Construction Budget Tracker</h1>
        <ExpenseEntry onExpenseAdded={handleExpenseAdded} />
      </div>

      {/* Budget Alerts */}
      <div>
        {budgetData.map(data => (
          <BudgetAlert
            key={data.phase}
            phase={data.phase}
            budget={data.budget}
            spent={data.spent}
          />
        ))}
      </div>

      <Tabs defaultValue="budgets" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="budgets" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Budget Setup
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Budget vs Actual
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Financial Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="budgets">
          <Card>
            <CardHeader>
              <CardTitle>Set Phase Budgets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {phases.map(phase => (
                  <div key={phase} className="flex items-center justify-between p-4 border rounded-lg">
                    <Label className="font-medium flex-1">{phase}</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={budgets[phase] || ''}
                        onChange={(e) => handleBudgetChange(phase, e.target.value)}
                        placeholder="0.00"
                        className="w-32"
                      />
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 flex justify-between items-center font-bold text-lg">
                  <span>Total Project Budget:</span>
                  <span>${totalBudget.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <BudgetComparison budgets={budgetData} />
        </TabsContent>

        <TabsContent value="reports">
          <FinancialReport expenses={expenses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}