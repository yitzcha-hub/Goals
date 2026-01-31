import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Receipt } from 'lucide-react';

interface Expense {
  id: number;
  phase: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  receiptUrl?: string;
}

interface FinancialReportProps {
  expenses: Expense[];
}

export default function FinancialReport({ expenses }: FinancialReportProps) {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const phaseTotals = expenses.reduce((acc, expense) => {
    acc[expense.phase] = (acc[expense.phase] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const exportReport = () => {
    const csvContent = [
      ['Date', 'Phase', 'Category', 'Description', 'Amount'].join(','),
      ...expenses.map(exp => [
        exp.date,
        exp.phase,
        exp.category,
        `"${exp.description}"`,
        exp.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `construction-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Financial Report</h2>
        <Button onClick={exportReport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryTotals).map(([category, total]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="font-medium">{category}</span>
                  <Badge variant="secondary">{formatCurrency(total)}</Badge>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between items-center font-bold">
                <span>Total</span>
                <span>{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by Phase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(phaseTotals).map(([phase, total]) => (
                <div key={phase} className="flex justify-between items-center">
                  <span className="font-medium">{phase}</span>
                  <Badge variant="secondary">{formatCurrency(total)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.slice(-10).reverse().map((expense) => (
              <div key={expense.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{expense.description}</span>
                    {expense.receiptUrl && <Receipt className="w-4 h-4 text-gray-500" />}
                  </div>
                  <div className="text-sm text-gray-600">
                    {expense.phase} • {expense.category} • {expense.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(expense.amount)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}