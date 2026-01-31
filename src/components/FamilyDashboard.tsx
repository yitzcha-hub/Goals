import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradePrompt from './UpgradePrompt';
import { FamilyGoalCard } from './FamilyGoalCard';
import { FamilyLeaderboard } from './FamilyLeaderboard';
import { FamilyTaskList } from './FamilyTaskList';
import { FamilyAchievements } from './FamilyAchievements';
import { FamilyCelebration } from './FamilyCelebration';
import { Button } from './ui/button';
import { Plus, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';

export function FamilyDashboard() {
  const { user } = useAuth();
  const { hasFeatureAccess } = useSubscription();
  const [familyGroup, setFamilyGroup] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [celebration, setCelebration] = useState({ show: false, title: '', message: '' });
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', description: '', target_value: 100, unit: 'points' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', points: 10 });

  // Check if user has access to Family Groups
  if (!hasFeatureAccess('family-groups')) {
    return <UpgradePrompt feature="family-groups" />;
  }


  useEffect(() => {
    if (user) {
      loadFamilyData();
    }
  }, [user]);

  const loadFamilyData = async () => {
    const { data: memberData } = await supabase
      .from('family_members')
      .select('family_group_id, family_groups(*)')
      .eq('user_id', user?.id)
      .single();

    if (memberData) {
      setFamilyGroup(memberData.family_groups);
      loadGoals(memberData.family_group_id);
      loadTasks(memberData.family_group_id);
      loadAchievements(memberData.family_group_id);
      loadLeaderboard(memberData.family_group_id);
    } else {
      // Demo data if no family group
      setGoals([
        { id: '1', title: 'Family Fitness Challenge', description: 'Complete 1000 exercise minutes together', target_value: 1000, current_value: 450, unit: 'minutes', status: 'active' },
        { id: '2', title: 'Reading Marathon', description: 'Read 50 books as a family', target_value: 50, current_value: 23, unit: 'books', status: 'active' },
      ]);
      setTasks([
        { id: '1', title: 'Plan weekend hike', description: 'Research trails and pack supplies', points: 20, status: 'pending', assigned_name: 'Dad' },
        { id: '2', title: 'Family game night', description: 'Choose games and prepare snacks', points: 15, status: 'pending', assigned_name: 'Mom' },
      ]);
      setLeaderboard([
        { user_id: '1', name: 'Sarah', points: 450, tasks_completed: 23, goals_contributed: 8, rank: 1 },
        { user_id: '2', name: 'Mike', points: 380, tasks_completed: 19, goals_contributed: 7, rank: 2 },
        { user_id: '3', name: 'Emma', points: 320, tasks_completed: 16, goals_contributed: 6, rank: 3 },
        { user_id: '4', name: 'Jake', points: 290, tasks_completed: 14, goals_contributed: 5, rank: 4 },
      ]);
      setAchievements([
        { id: '1', title: 'First Goal Together', description: 'Completed your first family goal', icon: 'trophy', earned_at: new Date().toISOString() },
        { id: '2', title: 'Team Player', description: 'All members contributed to a goal', icon: 'star', earned_at: new Date().toISOString() },
      ]);
    }
  };

  const loadGoals = async (groupId: string) => {
    const { data } = await supabase.from('family_goals').select('*').eq('family_group_id', groupId).order('created_at', { ascending: false });
    if (data) setGoals(data);
  };

  const loadTasks = async (groupId: string) => {
    const { data } = await supabase.from('family_tasks').select('*').eq('family_group_id', groupId).order('created_at', { ascending: false });
    if (data) setTasks(data);
  };

  const loadAchievements = async (groupId: string) => {
    const { data } = await supabase.from('family_achievements').select('*').eq('family_group_id', groupId).order('earned_at', { ascending: false });
    if (data) setAchievements(data);
  };

  const loadLeaderboard = async (groupId: string) => {
    const { data } = await supabase.from('family_member_progress').select('*').eq('family_group_id', groupId).order('points', { ascending: false });
    if (data) {
      const ranked = data.map((m, i) => ({ ...m, rank: i + 1, name: 'Member ' + (i + 1) }));
      setLeaderboard(ranked);
    }
  };

  const handleContribute = async (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const newValue = goal.current_value + 10;
    
    if (familyGroup) {
      const { error } = await supabase.from('family_goals').update({ current_value: newValue }).eq('id', goalId);
      if (!error && newValue >= goal.target_value) {
        setCelebration({ show: true, title: '🎉 Goal Completed!', message: `Your family completed "${goal.title}"!` });
        await supabase.from('family_achievements').insert({ family_group_id: familyGroup.id, title: goal.title, description: 'Completed family goal', icon: 'trophy' });
      }
    } else {
      setGoals(goals.map(g => g.id === goalId ? { ...g, current_value: newValue } : g));
      if (newValue >= goal.target_value) {
        setCelebration({ show: true, title: '🎉 Goal Completed!', message: `Your family completed "${goal.title}"!` });
      }
    }
    toast.success('Contribution added!');
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending', completed_by_name: 'You' } : t));
    toast.success('Task updated!');
  };

  const createGoal = async () => {
    if (!goalForm.title) return;
    const newGoal = { ...goalForm, id: Date.now().toString(), current_value: 0, status: 'active' };
    setGoals([newGoal, ...goals]);
    setNewGoalOpen(false);
    setGoalForm({ title: '', description: '', target_value: 100, unit: 'points' });
    toast.success('Goal created!');
  };

  const createTask = async () => {
    if (!taskForm.title) return;
    const newTask = { ...taskForm, id: Date.now().toString(), status: 'pending' };
    setTasks([newTask, ...tasks]);
    setNewTaskOpen(false);
    setTaskForm({ title: '', description: '', points: 10 });
    toast.success('Task created!');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Family Dashboard</h1>
          <p className="text-gray-600">Work together to achieve your goals</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={newGoalOpen} onOpenChange={setNewGoalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700"><Plus className="mr-2 w-4 h-4" />New Goal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Family Goal</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title</Label><Input value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} /></div>
                <div><Label>Target</Label><Input type="number" value={goalForm.target_value} onChange={(e) => setGoalForm({ ...goalForm, target_value: parseInt(e.target.value) })} /></div>
                <Button onClick={createGoal} className="w-full">Create Goal</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Plus className="mr-2 w-4 h-4" />New Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Family Task</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title</Label><Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} /></div>
                <div><Label>Points</Label><Input type="number" value={taskForm.points} onChange={(e) => setTaskForm({ ...taskForm, points: parseInt(e.target.value) })} /></div>
                <Button onClick={createTask} className="w-full">Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6"><div className="flex items-center gap-4"><Users className="w-10 h-10 text-purple-600" /><div><p className="text-sm text-gray-600">Family Members</p><p className="text-2xl font-bold">{leaderboard.length}</p></div></div></Card>
        <Card className="p-6"><div className="flex items-center gap-4"><TrendingUp className="w-10 h-10 text-green-600" /><div><p className="text-sm text-gray-600">Active Goals</p><p className="text-2xl font-bold">{goals.filter(g => g.status === 'active').length}</p></div></div></Card>
        <Card className="p-6"><div className="flex items-center gap-4"><Plus className="w-10 h-10 text-blue-600" /><div><p className="text-sm text-gray-600">Total Points</p><p className="text-2xl font-bold">{leaderboard.reduce((sum, m) => sum + m.points, 0)}</p></div></div></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {goals.map(goal => (<FamilyGoalCard key={goal.id} goal={goal} onContribute={handleContribute} />))}
        </div>
        <FamilyLeaderboard members={leaderboard} />
      </div>

      <FamilyTaskList tasks={tasks} onToggleTask={handleToggleTask} onAddTask={() => setNewTaskOpen(true)} />
      <FamilyAchievements achievements={achievements} />
      <FamilyCelebration {...celebration} onClose={() => setCelebration({ ...celebration, show: false })} />
    </div>
  );
}
