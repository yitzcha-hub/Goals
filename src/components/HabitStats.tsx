import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Award, Calendar, Target } from 'lucide-react';

interface Habit {
  id: number;
  name: string;
  category: string;
  streak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  color: string;
}

interface HabitStatsProps {
  habits: Habit[];
}

const HabitStats: React.FC<HabitStatsProps> = ({ habits }) => {
  // Generate mock weekly data
  const weeklyData = [
    { week: 'Week 1', completed: 18, total: 28 },
    { week: 'Week 2', completed: 22, total: 28 },
    { week: 'Week 3', completed: 25, total: 28 },
    { week: 'Week 4', completed: 20, total: 28 },
  ];

  // Generate mock streak data
  const streakData = [
    { day: 'Mon', streaks: 12 },
    { day: 'Tue', streaks: 13 },
    { day: 'Wed', streaks: 11 },
    { day: 'Thu', streaks: 14 },
    { day: 'Fri', streaks: 15 },
    { day: 'Sat', streaks: 16 },
    { day: 'Sun', streaks: 14 },
  ];

  const totalCompletions = habits.reduce((sum, habit) => sum + habit.weeklyProgress, 0);
  const totalGoals = habits.reduce((sum, habit) => sum + habit.weeklyGoal, 0);
  const completionRate = totalGoals > 0 ? Math.round((totalCompletions / totalGoals) * 100) : 0;
  const longestStreak = Math.max(...habits.map(h => h.streak));
  const averageStreak = Math.round(habits.reduce((sum, h) => sum + h.streak, 0) / habits.length);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Longest Streak</p>
                <p className="text-2xl font-bold">{longestStreak} days</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
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
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold">{totalCompletions}/{totalGoals}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Habit Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Habit Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {habits.map((habit) => {
              const habitRate = Math.round((habit.weeklyProgress / habit.weeklyGoal) * 100);
              return (
                <div key={habit.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${habit.color}`}></div>
                      <span className="font-medium">{habit.name}</span>
                      <Badge variant="outline" className="text-xs">{habit.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {habit.weeklyProgress}/{habit.weeklyGoal}
                      </span>
                      <span className="text-sm font-medium">{habitRate}%</span>
                    </div>
                  </div>
                  <Progress value={habitRate} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Current streak: {habit.streak} days</span>
                    <span>Weekly goal: {habit.weeklyGoal} times</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Completion Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Streak Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={streakData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="streaks" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HabitStats;