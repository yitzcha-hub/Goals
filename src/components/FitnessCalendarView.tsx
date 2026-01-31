import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Flame, Award } from 'lucide-react';

interface DailyActivity {
  date: string;
  steps: number;
  calories: number;
  activeMinutes: number;
}

interface Props {
  activityData: Record<string, DailyActivity>;
  goals: { steps: number; calories: number; activeMinutes: number };
  currentStreak: number;
  longestStreak: number;
}

export const FitnessCalendarView = ({ activityData, goals, currentStreak, longestStreak }: Props) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const getActivityLevel = (dateStr: string) => {
    const activity = activityData[dateStr];
    if (!activity) return 'none';
    
    const stepsPercent = (activity.steps / goals.steps) * 100;
    if (stepsPercent >= 100) return 'complete';
    if (stepsPercent >= 50) return 'partial';
    return 'low';
  };

  const levelColors = {
    none: 'bg-gray-100',
    low: 'bg-blue-200',
    partial: 'bg-blue-400',
    complete: 'bg-green-500'
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-3xl font-bold">{currentStreak}</p>
                <p className="text-sm text-gray-600">Day Current Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-3xl font-bold">{longestStreak}</p>
                <p className="text-sm text-gray-600">Day Longest Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const level = getActivityLevel(dateStr);
              const activity = activityData[dateStr];
              
              return (
                <div key={day} className={`aspect-square rounded p-1 ${levelColors[level]} flex items-center justify-center text-sm font-medium cursor-pointer hover:ring-2 ring-blue-500 transition-all`}
                  title={activity ? `${activity.steps} steps, ${activity.calories} cal` : 'No activity'}>
                  {day}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100" />
              <span>No activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-200" />
              <span>&lt;50%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-400" />
              <span>50-99%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span>Goal met</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
