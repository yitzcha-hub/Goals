import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Target, CheckCircle, Star, TrendingUp } from 'lucide-react';
import { ProductivityMetrics } from './ProductivityMetrics';

interface DemoAnalyticsSectionProps {
  goals: Array<{ id: string; title: string; progress: number }>;
  tasks: Array<{ id: string; title: string; completed: boolean; priority?: 'low' | 'medium' | 'high'; points: number }>;
}

export const DemoAnalyticsSection: React.FC<DemoAnalyticsSectionProps> = ({ goals, tasks }) => {
  const completedGoals = goals.filter(g => g.progress >= 10).length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalPoints = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
  const avgProgress = goals.length > 0
    ? Math.round((goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) * 10)
    : 0;

  const tasksWithPriority = tasks.map(t => ({
    ...t,
    priority: (t.priority || 'medium') as 'low' | 'medium' | 'high',
  }));

  const completionData = goals.map(g => ({
    title: g.title,
    completed: g.progress,
    total: 10,
  }));

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--landing-text)' }}>
        <BarChart3 className="h-7 w-7" style={{ color: 'var(--landing-primary)' }} />
        Analytics Dashboard
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 opacity-70" style={{ color: 'var(--landing-primary)' }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--landing-primary)' }}>{completedGoals}</div>
            <p className="text-sm opacity-90" style={{ color: 'var(--landing-text)' }}>Goals at 10/10</p>
            <p className="text-xs mt-1 opacity-70" style={{ color: 'var(--landing-text)' }}>
              {completedGoals} of {goals.length} goals
            </p>
          </CardContent>
        </Card>
        <Card style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 opacity-70" style={{ color: 'var(--landing-primary)' }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--landing-primary)' }}>{completedTasks}</div>
            <p className="text-sm opacity-90" style={{ color: 'var(--landing-text)' }}>Tasks Done</p>
            <p className="text-xs mt-1 opacity-70" style={{ color: 'var(--landing-text)' }}>
              {completedTasks} of {tasks.length} tasks
            </p>
          </CardContent>
        </Card>
        <Card style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <Star className="h-8 w-8 opacity-70" style={{ color: 'var(--landing-primary)' }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--landing-primary)' }}>{totalPoints}</div>
            <p className="text-sm opacity-90" style={{ color: 'var(--landing-text)' }}>Points Earned</p>
            <p className="text-xs mt-1 opacity-70" style={{ color: 'var(--landing-text)' }}>
              From completed tasks
            </p>
          </CardContent>
        </Card>
        <Card style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 opacity-70" style={{ color: 'var(--landing-primary)' }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--landing-primary)' }}>{avgProgress}%</div>
            <p className="text-sm opacity-90" style={{ color: 'var(--landing-text)' }}>Avg Progress</p>
            <p className="text-xs mt-1 opacity-70" style={{ color: 'var(--landing-text)' }}>
              Across all goals
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4" style={{ color: 'var(--landing-text)' }}>Goal Progress (0–10)</h4>
            <div className="space-y-4">
              {completionData.slice(0, 5).map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate max-w-[70%]" style={{ color: 'var(--landing-text)' }}>{item.title}</span>
                    <span style={{ color: 'var(--landing-primary)' }}>{item.completed}/10</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--landing-accent)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${item.completed * 10}%`,
                        backgroundColor: 'var(--landing-primary)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4" style={{ color: 'var(--landing-text)' }}>Tasks by Priority</h4>
            <ProductivityMetrics tasks={tasksWithPriority} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
