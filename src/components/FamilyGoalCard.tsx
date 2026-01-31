import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Calendar, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FamilyGoalCardProps {
  goal: {
    id: string;
    title: string;
    description: string;
    target_value: number;
    current_value: number;
    unit: string;
    status: string;
    deadline?: string;
  };
  onContribute: (goalId: string) => void;
}

export function FamilyGoalCard({ goal, onContribute }: FamilyGoalCardProps) {
  const progress = (goal.current_value / goal.target_value) * 100;
  const isCompleted = goal.status === 'completed';
  const daysLeft = goal.deadline 
    ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className={`w-5 h-5 ${isCompleted ? 'text-yellow-500' : 'text-purple-500'}`} />
            <h3 className="font-semibold text-lg">{goal.title}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
        </div>
        {isCompleted && (
          <Badge className="bg-green-500">Completed</Badge>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold">
              {goal.current_value} / {goal.target_value} {goal.unit}
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Family Goal</span>
            </div>
            {daysLeft !== null && daysLeft > 0 && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{daysLeft} days left</span>
              </div>
            )}
          </div>
          {!isCompleted && (
            <Button 
              size="sm" 
              onClick={() => onContribute(goal.id)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Contribute
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
