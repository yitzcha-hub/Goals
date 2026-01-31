import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users } from 'lucide-react';

interface ComparisonData {
  goalTitle: string;
  yourProgress: number;
  avgProgress: number;
  topPerformers: number;
  timeSpent: number;
  avgTimeSpent: number;
}

interface GoalComparisonProps {
  comparisons: ComparisonData[];
}

export const GoalComparison: React.FC<GoalComparisonProps> = ({ comparisons = [] }) => {
  if (comparisons.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No comparison data available. Start tracking goals to see insights!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Comparison with Similar Goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {comparisons.map((comp, index) => {

            const performanceDiff = comp.yourProgress - comp.avgProgress;
            const isAboveAvg = performanceDiff > 0;
            
            return (
              <div key={index} className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{comp.goalTitle}</h4>
                  <Badge variant={isAboveAvg ? 'default' : 'secondary'}>
                    {isAboveAvg ? '+' : ''}{performanceDiff.toFixed(0)}% vs avg
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Your Progress</span>
                    <span className="font-medium">{comp.yourProgress}%</span>
                  </div>
                  <Progress value={comp.yourProgress} className="h-2" />
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Community Average</span>
                    <span>{comp.avgProgress}%</span>
                  </div>
                  <Progress value={comp.avgProgress} className="h-1 opacity-50" />
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Top 10% Performers</span>
                    <span>{comp.topPerformers}%</span>
                  </div>
                  <Progress value={comp.topPerformers} className="h-1 opacity-30" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs text-gray-600">Your Time Spent</p>
                    <p className="text-lg font-bold text-blue-600">{comp.timeSpent}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Avg Time Spent</p>
                    <p className="text-lg font-bold text-gray-600">{comp.avgTimeSpent}h</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
