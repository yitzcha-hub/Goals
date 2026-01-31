import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  completedDate?: string;
  status: 'completed' | 'in-progress' | 'upcoming';
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
  goalTitle: string;
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones, goalTitle }) => {
  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const completionRate = (completedCount / milestones.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Milestone Timeline - {goalTitle}</CardTitle>
          <Badge variant="outline">
            {completedCount}/{milestones.length} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Overall Progress</span>
            <span className="font-medium">{completionRate.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                {milestone.status === 'completed' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : milestone.status === 'in-progress' ? (
                  <Clock className="h-6 w-6 text-blue-600" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-300" />
                )}
                {index < milestones.length - 1 && (
                  <div className={`w-0.5 h-12 ${milestone.status === 'completed' ? 'bg-green-600' : 'bg-gray-300'}`} />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{milestone.title}</h4>
                    <p className="text-sm text-gray-600">
                      Target: {milestone.targetDate}
                      {milestone.completedDate && ` • Completed: ${milestone.completedDate}`}
                    </p>
                  </div>
                  <Badge
                    variant={
                      milestone.status === 'completed' ? 'default' :
                      milestone.status === 'in-progress' ? 'secondary' : 'outline'
                    }
                  >
                    {milestone.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
