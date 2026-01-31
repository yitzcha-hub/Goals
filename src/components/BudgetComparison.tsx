import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface BudgetData {
  phase: string;
  budget: number;
  spent: number;
}

interface BudgetComparisonProps {
  budgets: BudgetData[];
}

export default function BudgetComparison({ budgets }: BudgetComparisonProps) {
  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const getVarianceColor = (budget: number, spent: number) => {
    const percentage = budget > 0 ? spent / budget : 0;
    if (percentage > 1) return 'destructive';
    if (percentage > 0.9) return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Project Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Remaining</p>
              <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalRemaining)}
              </p>
            </div>
          </div>
          <Progress value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0} className="h-3" />
          <p className="text-sm text-gray-600 mt-2 text-center">
            {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% of total budget used
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {budgets.map((budget) => {
          const percentage = budget.budget > 0 ? (budget.spent / budget.budget) * 100 : 0;
          const remaining = budget.budget - budget.spent;
          
          return (
            <Card key={budget.phase}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{budget.phase}</h3>
                  <Badge variant={getVarianceColor(budget.budget, budget.spent)}>
                    {percentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                  <div>
                    <span className="text-gray-600">Budget: </span>
                    <span className="font-medium">{formatCurrency(budget.budget)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Spent: </span>
                    <span className="font-medium">{formatCurrency(budget.spent)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Remaining: </span>
                    <span className={`font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}