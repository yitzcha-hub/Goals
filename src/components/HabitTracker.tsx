import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HabitCard from './HabitCard';
import HabitTimeline from './HabitTimeline';
import HabitStats from './HabitStats';
import { Plus, TrendingUp, Calendar, Target } from 'lucide-react';

interface HabitTrackerProps {
  habits?: any[];
  onHabitsUpdate?: (habits: any[]) => void;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ habits = [], onHabitsUpdate }) => {
  // Ensure habits is always an array
  const safeHabits = Array.isArray(habits) ? habits : [];
  
  // Use provided habits or fallback to default habits
  const defaultHabits = [
    {
      id: 1,
      name: 'Morning Exercise',
      description: '30 minutes of physical activity',
      category: 'Health',
      streak: 12,
      completedToday: true,
      weeklyGoal: 5,
      weeklyProgress: 4,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Read Books',
      description: 'Read for at least 20 minutes',
      category: 'Learning',
      streak: 8,
      completedToday: false,
      weeklyGoal: 7,
      weeklyProgress: 5,
      color: 'bg-green-500'
    },
    {
      id: 3,
      name: 'Meditation',
      description: '10 minutes of mindfulness',
      category: 'Wellness',
      streak: 15,
      completedToday: true,
      weeklyGoal: 7,
      weeklyProgress: 6,
      color: 'bg-purple-500'
    },
    {
      id: 4,
      name: 'Drink Water',
      description: '8 glasses of water daily',
      category: 'Health',
      streak: 5,
      completedToday: false,
      weeklyGoal: 7,
      weeklyProgress: 3,
      color: 'bg-cyan-500'
    }
  ];

  // Use provided habits or default habits
  const displayHabits = safeHabits.length > 0 ? safeHabits : defaultHabits;


  const handleToggleHabit = (habitId: number) => {
    const updatedHabits = displayHabits.map(habit => {
      if (habit.id === habitId) {
        const newCompleted = !habit.completedToday;
        return {
          ...habit,
          completedToday: newCompleted,
          streak: newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1),
          weeklyProgress: newCompleted 
            ? Math.min(habit.weeklyGoal, habit.weeklyProgress + 1)
            : Math.max(0, habit.weeklyProgress - 1)
        };
      }
      return habit;
    });
    
    if (onHabitsUpdate) {
      onHabitsUpdate(updatedHabits);
    }
  };

  const completedToday = displayHabits.filter(h => h.completedToday).length;
  const totalHabits = displayHabits.length;
  const averageStreak = totalHabits > 0 ? Math.round(displayHabits.reduce((sum, h) => sum + h.streak, 0) / totalHabits) : 0;
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Progress</p>
                <p className="text-2xl font-bold">{completedToday}/{totalHabits}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Streak</p>
                <p className="text-2xl font-bold">{averageStreak} days</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Habits</p>
                <p className="text-2xl font-bold">{totalHabits}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="habits" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="habits">My Habits</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="habits" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Habits</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={handleToggleHabit}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-4">
          <HabitTimeline habits={displayHabits} />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <HabitStats habits={displayHabits} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HabitTracker;