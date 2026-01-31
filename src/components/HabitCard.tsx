import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Calendar, Flame } from 'lucide-react';

interface HabitCardProps {
  habit: {
    id: number;
    name: string;
    description: string;
    category: string;
    streak: number;
    completedToday: boolean;
    weeklyGoal: number;
    weeklyProgress: number;
    color: string;
  };
  onToggle: (id: number) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle }) => {
  const progressPercentage = (habit.weeklyProgress / habit.weeklyGoal) * 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{habit.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{habit.description}</p>
            <Badge variant="outline" className="text-xs">
              {habit.category}
            </Badge>
          </div>
          <div className={`w-4 h-4 rounded-full ${habit.color}`}></div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>{habit.streak} day streak</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>{habit.weeklyProgress}/{habit.weeklyGoal} this week</span>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${habit.color.replace('bg-', 'bg-')}`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>

          <Button
            onClick={() => onToggle(habit.id)}
            variant={habit.completedToday ? "default" : "outline"}
            className={`w-full ${habit.completedToday ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {habit.completedToday ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Completed Today
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                Mark Complete
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitCard;