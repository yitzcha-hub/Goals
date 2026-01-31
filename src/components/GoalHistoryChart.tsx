import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle, Clock, Target } from 'lucide-react';

interface Goal {
  id: number;
  title: string;
  category: string;
  progress: number;
  status: 'completed' | 'active' | 'paused' | 'cancelled';
  startDate: string;
  endDate?: string;
  targetDate: string;
}

const GoalHistoryChart: React.FC = () => {
  const goalHistory: Goal[] = [
    {
      id: 1,
      title: 'Complete React Certification',
      category: 'Education',
      progress: 100,
      status: 'completed',
      startDate: '2024-01-15',
      endDate: '2024-08-20',
      targetDate: '2024-09-01'
    },
    {
      id: 2,
      title: 'Read 24 Books This Year',
      category: 'Personal Development',
      progress: 100,
      status: 'completed',
      startDate: '2024-01-01',
      endDate: '2024-09-10',
      targetDate: '2024-12-31'
    },
    {
      id: 3,
      title: 'Build New Home Foundation',
      category: 'Personal',
      progress: 75,
      status: 'active',
      startDate: '2024-06-01',
      targetDate: '2024-12-31'
    },
    {
      id: 4,
      title: 'Run Marathon',
      category: 'Fitness',
      progress: 45,
      status: 'active',
      startDate: '2024-07-01',
      targetDate: '2024-11-15'
    },
    {
      id: 5,
      title: 'Build Portfolio Website',
      category: 'Career',
      progress: 30,
      status: 'paused',
      startDate: '2024-05-01',
      targetDate: '2024-10-01'
    }
  ];

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'active':
        return <Target className="h-4 w-4" />;
      case 'paused':
        return <Clock className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const completedGoals = goalHistory.filter(goal => goal.status === 'completed');
  const activeGoals = goalHistory.filter(goal => goal.status === 'active');

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Goals</p>
                <p className="text-2xl font-bold">{goalHistory.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedGoals.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-slate-700">
                  {Math.round((completedGoals.length / goalHistory.length) * 100)}%
                </p>
              </div>
              <Calendar className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goal History Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Goal History</CardTitle>
          <CardDescription>Your complete goal journey and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goalHistory.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-lg">{goal.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {goal.category}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(goal.status)}`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(goal.status)}
                          {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                        </span>
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>Started: {formatDate(goal.startDate)}</p>
                    {goal.endDate ? (
                      <p>Completed: {formatDate(goal.endDate)}</p>
                    ) : (
                      <p>Target: {formatDate(goal.targetDate)}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
                
                {goal.status === 'completed' && goal.endDate && (
                  <div className="text-sm text-green-600 font-medium">
                    ✅ Completed {new Date(goal.endDate) < new Date(goal.targetDate) ? 'early' : 'on time'}!
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalHistoryChart;