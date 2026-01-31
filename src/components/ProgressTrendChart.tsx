import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProgressTrendChartProps {
  goalTitle: string;
  progressData: Array<{ date: string; progress: number; tasksCompleted: number }>;
  predictedCompletion?: string;
}

export const ProgressTrendChart: React.FC<ProgressTrendChartProps> = ({
  goalTitle,
  progressData,
  predictedCompletion
}) => {
  const maxProgress = 100;
  const currentProgress = progressData[progressData.length - 1]?.progress || 0;
  const avgWeeklyGrowth = progressData.length > 1
    ? (progressData[progressData.length - 1].progress - progressData[0].progress) / progressData.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{goalTitle}</CardTitle>
          <Badge variant={currentProgress >= 70 ? 'default' : 'secondary'}>
            {currentProgress}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-40 relative">
          <svg className="w-full h-full" viewBox="0 0 400 160">
            <defs>
              <linearGradient id={`gradient-${goalTitle}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((val) => (
              <line
                key={val}
                x1="0"
                y1={160 - (val * 1.6)}
                x2="400"
                y2={160 - (val * 1.6)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            {/* Progress line */}
            <polyline
              points={progressData.map((d, i) => 
                `${(i / (progressData.length - 1)) * 400},${160 - (d.progress * 1.6)}`
              ).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
            />
            {/* Area under line */}
            <polygon
              points={`0,160 ${progressData.map((d, i) => 
                `${(i / (progressData.length - 1)) * 400},${160 - (d.progress * 1.6)}`
              ).join(' ')} 400,160`}
              fill={`url(#gradient-${goalTitle})`}
            />
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{currentProgress}%</p>
            <p className="text-xs text-gray-600">Current</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">+{avgWeeklyGrowth.toFixed(1)}%</p>
            <p className="text-xs text-gray-600">Avg Weekly</p>
          </div>
          <div>
            <p className="text-lg font-bold text-purple-600">{predictedCompletion || 'TBD'}</p>
            <p className="text-xs text-gray-600">Est. Completion</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
