import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DailyActivity {
  date: string;
  steps: number;
  calories: number;
  activeMinutes: number;
}

interface Props {
  weekData: DailyActivity[];
  goals: { steps: number; calories: number; activeMinutes: number };
}

export const WeeklyFitnessChart = ({ weekData, goals }: Props) => {
  const maxSteps = Math.max(...weekData.map(d => d.steps), goals.steps);
  const maxCalories = Math.max(...weekData.map(d => d.calories), goals.calories);
  const maxMinutes = Math.max(...weekData.map(d => d.activeMinutes), goals.activeMinutes);

  const avgSteps = Math.round(weekData.reduce((sum, d) => sum + d.steps, 0) / weekData.length);
  const avgCalories = Math.round(weekData.reduce((sum, d) => sum + d.calories, 0) / weekData.length);
  
  const getTrend = (current: number, avg: number) => {
    if (current > avg * 1.1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < avg * 0.9) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Steps - Last 7 Days</CardTitle>
          <p className="text-sm text-gray-600">Daily Goal: {goals.steps.toLocaleString()} | Avg: {avgSteps.toLocaleString()}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-48">
            {weekData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs font-medium">{day.steps.toLocaleString()}</div>
                <div className="w-full bg-gray-100 rounded relative" style={{ height: '100%' }}>
                  <div className="absolute bottom-0 w-full bg-blue-500 rounded transition-all"
                    style={{ height: `${(day.steps / maxSteps) * 100}%` }} />
                  {day.steps >= goals.steps && (
                    <div className="absolute top-0 w-full h-0.5 bg-green-500" />
                  )}
                </div>
                <div className="text-xs text-gray-600">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Calories Burned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {weekData.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs">{day.calories}</div>
                  <div className="w-full bg-gray-100 rounded relative" style={{ height: '100%' }}>
                    <div className="absolute bottom-0 w-full bg-orange-500 rounded"
                      style={{ height: `${(day.calories / maxCalories) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Minutes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-32">
              {weekData.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-xs">{day.activeMinutes}</div>
                  <div className="w-full bg-gray-100 rounded relative" style={{ height: '100%' }}>
                    <div className="absolute bottom-0 w-full bg-green-500 rounded"
                      style={{ height: `${(day.activeMinutes / maxMinutes) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
