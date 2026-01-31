import { useState } from 'react';
import { Link2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDatabase } from '@/hooks/useDatabase';
import { Badge } from '@/components/ui/badge';

interface GoalDependenciesProps {
  goalId: string;
}

export function GoalDependencies({ goalId }: GoalDependenciesProps) {
  const { goals } = useDatabase();
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [open, setOpen] = useState(false);

  const currentGoal = goals.find(g => g.id === goalId);
  const availableGoals = goals.filter(g => g.id !== goalId && !dependencies.includes(g.id));

  const addDependency = () => {
    if (selectedGoal) {
      setDependencies([...dependencies, selectedGoal]);
      setSelectedGoal('');
      setOpen(false);
    }
  };

  const removeDependency = (id: string) => {
    setDependencies(dependencies.filter(d => d !== id));
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          <h4 className="font-semibold">Dependencies</h4>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Goal</DialogTitle>
            </DialogHeader>
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                {availableGoals.map(g => (
                  <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addDependency}>Add Dependency</Button>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {dependencies.map(depId => {
          const dep = goals.find(g => g.id === depId);
          return dep ? (
            <div key={depId} className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm">{dep.title}</span>
              <Button size="sm" variant="ghost" onClick={() => removeDependency(depId)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : null;
        })}
      </div>
    </Card>
  );
}
