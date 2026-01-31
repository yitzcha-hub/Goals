import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradePrompt from './UpgradePrompt';
import { Users, Target, TrendingUp, Award, MessageCircle, CheckSquare } from 'lucide-react';
import { CollaborationManager } from './CollaborationManager';

interface SharedGoal {
  id: string;
  title: string;
  progress: number;
  category: string;
  collaborator_count: number;
  task_count: number;
  comment_count: number;
  role: string;
}

export const CollaborationDashboard = () => {
  const { user } = useAuth();
  const { hasFeatureAccess } = useSubscription();
  const [sharedGoals, setSharedGoals] = useState<SharedGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });

  // Check if user has access to Collaboration features
  if (!hasFeatureAccess('collaboration')) {
    return <UpgradePrompt feature="collaboration" />;
  }


  useEffect(() => {
    if (!user) return;
    fetchSharedGoals();
  }, [user]);

  const fetchSharedGoals = async () => {
    // Fetch goals where user is a collaborator
    const { data: collabData } = await supabase
      .from('goal_collaborators')
      .select('goal_id, role')
      .eq('user_id', user?.id);


    if (!collabData || collabData.length === 0) {
      setSharedGoals([]);
      return;
    }

    const goalIds = collabData.map(c => c.goal_id);
    const { data: goalsData } = await supabase
      .from('goals')
      .select('*')
      .in('id', goalIds);

    if (goalsData && goalsData.length > 0) {

      const enrichedGoals = await Promise.all(
        goalsData.map(async (goal) => {
          const role = collabData.find(c => c.goal_id === goal.id)?.role || 'viewer';
          
          const { count: collabCount } = await supabase
            .from('goal_collaborators')
            .select('*', { count: 'exact', head: true })
            .eq('goal_id', goal.id);

          const { count: taskCount } = await supabase
            .from('goal_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('goal_id', goal.id);

          const { count: commentCount } = await supabase
            .from('goal_comments')
            .select('*', { count: 'exact', head: true })
            .eq('goal_id', goal.id);

          return {
            ...goal,
            role,
            collaborator_count: collabCount || 0,
            task_count: taskCount || 0,
            comment_count: commentCount || 0
          };
        })
      );

      setSharedGoals(enrichedGoals);
      setStats({
        total: enrichedGoals.length,
        active: enrichedGoals.filter(g => g.progress < 100).length,
        completed: enrichedGoals.filter(g => g.progress >= 100).length
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Collaboration Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shared Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {sharedGoals.map((goal) => (
          <Card key={goal.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold">{goal.title}</h3>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{goal.category}</Badge>
                      <Badge variant="outline">{goal.role}</Badge>
                    </div>
                  </div>
                  <Button onClick={() => setSelectedGoal(goal.id)}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} />
                </div>

                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {goal.collaborator_count} members
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckSquare className="h-4 w-4" />
                    {goal.task_count} tasks
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {goal.comment_count} comments
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedGoal && (
        <CollaborationManager
          goalId={selectedGoal}
          open={!!selectedGoal}
          onOpenChange={(open) => !open && setSelectedGoal(null)}
        />
      )}
    </div>
  );
};
