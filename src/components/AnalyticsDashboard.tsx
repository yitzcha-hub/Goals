import React from 'react';
import { AnalyticsCard } from './AnalyticsCard';
import { GoalCompletionChart } from './GoalCompletionChart';
import { ProgressTrendChart } from './ProgressTrendChart';
import { ProductivityMetrics } from './ProductivityMetrics';

interface AnalyticsDashboardProps {
  goals: Array<{
    id: string;
    title: string;
    description: string;
    progress: number;
    category: string;
    timeframe: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    points: number;
  }>;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ goals, tasks }) => {
  const completedGoals = goals.filter(g => g.progress >= 10).length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalPoints = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);
  const avgProgress = goals.reduce((sum, g) => sum + g.progress, 0) / goals.length || 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Goals Completed"
          value={completedGoals}
          change={12}
          icon={<span>🎯</span>}
          description={`${completedGoals} of ${goals.length} goals`}
        />
        <AnalyticsCard
          title="Tasks Done"
          value={completedTasks}
          change={8}
          icon={<span>✅</span>}
          description={`${completedTasks} of ${tasks.length} tasks`}
        />
        <AnalyticsCard
          title="Points Earned"
          value={totalPoints}
          change={15}
          icon={<span>⭐</span>}
          description="Total productivity points"
        />
        <AnalyticsCard
          title="Avg Progress"
          value={`${Math.round(avgProgress)}%`}
          change={-2}
          icon={<span>📈</span>}
          description="Average goal completion"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Goal Completion Status</h3>
          <GoalCompletionChart goals={goals} />
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Progress Trend</h3>
          <ProgressTrendChart />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Productivity by Priority</h3>
        <ProductivityMetrics tasks={tasks} />
      </div>
    </div>
  );
};