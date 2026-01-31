import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Target, Calendar, Clock, Award, BarChart3, Zap } from 'lucide-react';
import { GoalCompletionChart } from './GoalCompletionChart';
import { ProgressTrendChart } from './ProgressTrendChart';
import { MilestoneTimeline } from './MilestoneTimeline';
import { GoalComparison } from './GoalComparison';
import { CategoryDistributionChart } from './CategoryDistributionChart';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { GoalStatusChart } from './GoalStatusChart';
import { calculateCompletionRate, predictCompletionDate, generateInsights } from '@/lib/analyticsUtils';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradePrompt from './UpgradePrompt';


interface Goal {
  id: number;
  title: string;
  progress: number;
  category: string;
  dueDate: string;
  status: string;
  createdAt?: string;
  timeSpent?: number;
}

interface ComprehensiveAnalyticsProps {
  goals: Goal[];
}

export const ComprehensiveAnalytics: React.FC<ComprehensiveAnalyticsProps> = ({ goals = [] }) => {
  const { hasFeatureAccess } = useSubscription();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Check if user has access to Advanced Analytics
  if (!hasFeatureAccess('advanced-analytics')) {
    return <UpgradePrompt feature="advanced-analytics" />;
  }


  // Ensure goals is always an array
  const safeGoals = Array.isArray(goals) ? goals : [];

  // Filter goals by category
  const filteredGoals = selectedCategory === 'all' 
    ? safeGoals 
    : safeGoals.filter(g => g.category === selectedCategory);


  // Calculate KPIs with safe defaults
  const completionRate = calculateCompletionRate(filteredGoals);
  const avgProgress = filteredGoals.length > 0 
    ? filteredGoals.reduce((sum, g) => sum + g.progress, 0) / filteredGoals.length 
    : 0;
  const onTrackGoals = filteredGoals.filter(g => g.progress >= 70).length;
  const totalTimeSpent = filteredGoals.reduce((sum, g) => sum + (g.timeSpent || 0), 0);


  // Mock historical data for charts
  const completionHistory = [
    { date: 'Week 1', completed: 2, total: 10 },
    { date: 'Week 2', completed: 3, total: 10 },
    { date: 'Week 3', completed: 5, total: 10 },
    { date: 'Week 4', completed: 7, total: 10 }
  ];

  // Progress trends for each goal
  const progressTrends = filteredGoals.slice(0, 3).map(goal => ({
    goalTitle: goal.title,
    progressData: [
      { date: 'Week 1', progress: Math.max(0, goal.progress - 30), tasksCompleted: 2 },
      { date: 'Week 2', progress: Math.max(0, goal.progress - 20), tasksCompleted: 3 },
      { date: 'Week 3', progress: Math.max(0, goal.progress - 10), tasksCompleted: 5 },
      { date: 'Week 4', progress: goal.progress, tasksCompleted: 7 }
    ],
    predictedCompletion: predictCompletionDate(goal, [goal.progress - 30, goal.progress - 20, goal.progress - 10, goal.progress])
  }));

  // Milestone data
  const milestoneData = filteredGoals.slice(0, 2).map(goal => ({
    goalTitle: goal.title,
    milestones: [
      { id: '1', title: 'Initial Setup', targetDate: 'Jan 15', completedDate: 'Jan 14', status: 'completed' as const },
      { id: '2', title: 'First Milestone', targetDate: 'Feb 1', completedDate: 'Feb 2', status: 'completed' as const },
      { id: '3', title: 'Mid-Point Check', targetDate: 'Feb 15', status: 'in-progress' as const },
      { id: '4', title: 'Final Review', targetDate: 'Mar 1', status: 'upcoming' as const }
    ]
  }));

  // Comparison data
  const comparisonData = filteredGoals.slice(0, 3).map(goal => ({
    goalTitle: goal.title,
    yourProgress: goal.progress,
    avgProgress: Math.max(40, goal.progress - 15),
    topPerformers: Math.min(95, goal.progress + 20),
    timeSpent: goal.timeSpent || Math.floor(Math.random() * 50) + 10,
    avgTimeSpent: Math.floor(Math.random() * 60) + 15
  }));

  // Generate insights
  const insights = generateInsights(filteredGoals);

  const categories = ['all', ...Array.from(new Set(safeGoals.map(g => g.category)))];

  // Category distribution data
  const categoryData = categories.slice(1).map((cat, index) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
    return {
      category: cat,
      count: safeGoals.filter(g => g.category === cat).length,
      color: colors[index % colors.length]
    };
  });

  // Weekly activity data
  const weeklyActivity = [
    { day: 'Mon', tasks: 5, maxTasks: 10 },
    { day: 'Tue', tasks: 8, maxTasks: 10 },
    { day: 'Wed', tasks: 6, maxTasks: 10 },
    { day: 'Thu', tasks: 9, maxTasks: 10 },
    { day: 'Fri', tasks: 7, maxTasks: 10 },
    { day: 'Sat', tasks: 4, maxTasks: 10 },
    { day: 'Sun', tasks: 3, maxTasks: 10 }
  ];

  // Goal status counts
  const completedGoals = filteredGoals.filter(g => g.progress === 100).length;
  const inProgressGoals = filteredGoals.filter(g => g.progress > 0 && g.progress < 100).length;
  const notStartedGoals = filteredGoals.filter(g => g.progress === 0).length;
  const overdueGoals = 0; // Would need due date logic


  return (
    <div className="space-y-6 p-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Advanced Analytics Dashboard</h2>
          <p className="text-gray-600">Detailed insights into your goal progress and performance</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-green-600">{completionRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-1">+5% from last month</p>
              </div>
              <Target className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-3xl font-bold text-blue-600">{avgProgress.toFixed(0)}%</p>
                <p className="text-xs text-gray-500 mt-1">Across {filteredGoals.length} goals</p>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Track Goals</p>
                <p className="text-3xl font-bold text-purple-600">{onTrackGoals}</p>
                <p className="text-xs text-gray-500 mt-1">{filteredGoals.length > 0 ? ((onTrackGoals/filteredGoals.length)*100).toFixed(0) : 0}% of total</p>

              </div>
              <Calendar className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Invested</p>
                <p className="text-3xl font-bold text-orange-600">{totalTimeSpent}h</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <Clock className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategoryDistributionChart data={categoryData.length > 0 ? categoryData : [
          { category: 'Personal', count: 3, color: '#3b82f6' },
          { category: 'Health', count: 2, color: '#10b981' },
          { category: 'Career', count: 4, color: '#f59e0b' }
        ]} />
        <WeeklyActivityChart data={weeklyActivity} />
        <GoalStatusChart 
          completed={completedGoals}
          inProgress={inProgressGoals}
          notStarted={notStartedGoals}
          overdue={overdueGoals}
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Progress Trends</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="comparison">Comparisons</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        
        <TabsContent value="trends" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {progressTrends.map((trend, index) => (
              <ProgressTrendChart
                key={index}
                goalTitle={trend.goalTitle}
                progressData={trend.progressData}
                predictedCompletion={trend.predictedCompletion}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="milestones" className="space-y-4 mt-6">
          <div className="space-y-6">
            {milestoneData.map((data, index) => (
              <MilestoneTimeline
                key={index}
                goalTitle={data.goalTitle}
                milestones={data.milestones}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-4 mt-6">
          <GoalComparison comparisons={comparisonData} />
        </TabsContent>
        
        <TabsContent value="completion" className="space-y-4 mt-6">
          <GoalCompletionChart data={completionHistory} />
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {insight.type === 'positive' && <Award className="h-6 w-6 text-green-600" />}
                      {insight.type === 'warning' && <Zap className="h-6 w-6 text-yellow-600" />}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold mb-1">Performance Summary</h4>
                    <p className="text-sm text-gray-600">
                      You're {avgProgress > 60 ? 'exceeding' : 'meeting'} expectations with an average progress of {avgProgress.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
