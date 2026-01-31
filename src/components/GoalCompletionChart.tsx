import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface GoalCompletionChartProps {
  data: Array<{ date: string; completed: number; total: number }>;
}

export const GoalCompletionChart: React.FC<GoalCompletionChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.total));
  const trend = data[data.length - 1].completed > data[0].completed;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Goal Completion Trend</CardTitle>
          <div className="flex items-center gap-2">
            {trend ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <span className={trend ? 'text-green-600' : 'text-red-600'}>
              {trend ? '+' : '-'}{Math.abs(data[data.length - 1].completed - data[0].completed)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.date}</span>
                <span className="text-gray-600">{item.completed}/{item.total} completed</span>
              </div>
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{ width: `${(item.completed / maxValue) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  {((item.completed / item.total) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
