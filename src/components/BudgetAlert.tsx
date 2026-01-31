import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface BudgetAlertProps {
  phase: string;
  budget: number;
  spent: number;
  threshold?: number;
}

export default function BudgetAlert({ phase, budget, spent, threshold = 0.8 }: BudgetAlertProps) {
  const percentage = budget > 0 ? spent / budget : 0;
  
  if (percentage < threshold) return null;
  
  const getAlertType = () => {
    if (percentage >= 1) return { icon: XCircle, variant: 'destructive' as const, message: 'Budget exceeded!' };
    if (percentage >= 0.9) return { icon: AlertTriangle, variant: 'destructive' as const, message: 'Budget almost exceeded!' };
    return { icon: AlertTriangle, variant: 'default' as const, message: 'Approaching budget limit' };
  };
  
  const { icon: Icon, variant, message } = getAlertType();
  
  return (
    <Alert variant={variant} className="mb-4">
      <Icon className="h-4 w-4" />
      <AlertDescription>
        <strong>{phase}:</strong> {message} ({(percentage * 100).toFixed(1)}% of budget used)
      </AlertDescription>
    </Alert>
  );
}