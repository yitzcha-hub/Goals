import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityData {
  day: string;
  tasks: number;
  maxTasks: number;
}

interface WeeklyActivityChartProps {
  data: ActivityData[];
}

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.tasks), 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-end justify-between gap-2">
          {data.map((item, index) => {
            const height = (item.tasks / maxValue) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full bg-gray-100 rounded-t-lg overflow-hidden" style={{ height: '160px' }}>
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500 rounded-t-lg"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute top-2 w-full text-center text-xs font-bold text-white">
                      {item.tasks}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-600">{item.day}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
