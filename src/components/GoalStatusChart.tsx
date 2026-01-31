import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, Target, AlertCircle } from 'lucide-react';

interface StatusData {
  status: string;
  count: number;
  color: string;
  icon: React.ReactNode;
}

interface GoalStatusChartProps {
  completed: number;
  inProgress: number;
  notStarted: number;
  overdue: number;
}

export const GoalStatusChart: React.FC<GoalStatusChartProps> = ({
  completed, inProgress, notStarted, overdue
}) => {
  const total = completed + inProgress + notStarted + overdue;
  
  const statusData: StatusData[] = [
    { status: 'Completed', count: completed, color: 'bg-green-500', icon: <CheckCircle2 className="h-5 w-5" /> },
    { status: 'In Progress', count: inProgress, color: 'bg-blue-500', icon: <Clock className="h-5 w-5" /> },
    { status: 'Not Started', count: notStarted, color: 'bg-gray-400', icon: <Target className="h-5 w-5" /> },
    { status: 'Overdue', count: overdue, color: 'bg-red-500', icon: <AlertCircle className="h-5 w-5" /> }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goals by Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusData.map((item, index) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`${item.color} text-white p-1 rounded`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-sm">{item.status}</span>
                </div>
                <span className="text-sm text-gray-600">{item.count} ({percentage.toFixed(0)}%)</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
