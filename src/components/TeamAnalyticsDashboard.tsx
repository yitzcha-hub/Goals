import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Users, CheckCircle, Clock, Award } from 'lucide-react';

interface TeamAnalyticsDashboardProps {
  goalId: string;
}

export const TeamAnalyticsDashboard = ({ goalId }: TeamAnalyticsDashboardProps) => {
  const [analytics, setAnalytics] = useState({
    totalMembers: 0,
    activeMembers: 0,
    completedTasks: 0,
    totalTasks: 0,
    avgProgress: 0,
    topContributors: [] as any[]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [goalId]);

  const fetchAnalytics = async () => {
    const { data: collaborators } = await supabase
      .from('goal_collaborators')
      .select('*')
      .eq('goal_id', goalId);

    const { data: tasks } = await supabase
      .from('goal_tasks')
      .select('*')
      .eq('goal_id', goalId);

    const { data: activities } = await supabase
      .from('team_activity_logs')
      .select('user_id, activity_type')
      .eq('goal_id', goalId);

    const activityCount = activities?.reduce((acc: any, act) => {
      acc[act.user_id] = (acc[act.user_id] || 0) + 1;
      return acc;
    }, {});

    const topContributors = Object.entries(activityCount || {})
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([userId, count]) => ({ userId, count }));

    setAnalytics({
      totalMembers: collaborators?.length || 0,
      activeMembers: collaborators?.filter(c => c.status === 'active').length || 0,
      completedTasks: tasks?.filter(t => t.completed).length || 0,
      totalTasks: tasks?.length || 0,
      avgProgress: tasks?.reduce((sum, t) => sum + (t.progress || 0), 0) / (tasks?.length || 1),
      topContributors
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalMembers}</div>
            <p className="text-xs text-muted-foreground">{analytics.activeMembers} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedTasks}/{analytics.totalTasks}</div>
            <Progress value={(analytics.completedTasks / analytics.totalTasks) * 100} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.avgProgress)}%</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Top Contributors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topContributors.map((contrib, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{idx + 1}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">User {contrib.userId.slice(0, 8)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-semibold">{contrib.count} activities</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
