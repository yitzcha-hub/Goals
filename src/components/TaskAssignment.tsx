import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, UserCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  assigned_to: string;
  assigned_email: string;
  completed: boolean;
  created_at: string;
}

interface TaskAssignmentProps {
  goalId: string;
  collaborators: any[];
}

export const TaskAssignment = ({ goalId, collaborators }: TaskAssignmentProps) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [assignee, setAssignee] = useState('');

  useEffect(() => {
    if (!goalId) return;
    fetchTasks();
    subscribeToTasks();
  }, [goalId]);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('goal_tasks')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false });
    if (data) setTasks(data);
    else setTasks([]);
  };


  const subscribeToTasks = () => {
    const channel = supabase
      .channel(`tasks-${goalId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'goal_tasks', filter: `goal_id=eq.${goalId}` },
        () => fetchTasks()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  };

  const handleAddTask = async () => {
    if (!newTask.trim() || !assignee) return;
    
    const assignedUser = collaborators.find(c => c.user_id === assignee);
    const { error } = await supabase.from('goal_tasks').insert({
      goal_id: goalId,
      title: newTask.trim(),
      assigned_to: assignee,
      assigned_email: assignedUser?.email || '',
      completed: false
    });

    if (!error) {
      setNewTask('');
      setAssignee('');
      toast.success('Task assigned');
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from('goal_tasks')
      .update({ completed: !completed })
      .eq('id', taskId);
    if (!error) toast.success(completed ? 'Task reopened' : 'Task completed');
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 font-semibold">
        <UserCheck className="h-5 w-5" />
        Task Assignments
      </div>
      <div className="flex gap-2">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task..."
        />
        <Select value={assignee} onValueChange={setAssignee}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Assign to" />
          </SelectTrigger>
          <SelectContent>
            {(collaborators || []).map((c) => (
              <SelectItem key={c.user_id} value={c.user_id}>
                {c.email?.split('@')[0]}
              </SelectItem>
            ))}
          </SelectContent>

        </Select>
        <Button onClick={handleAddTask} disabled={!newTask.trim() || !assignee}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleTask(task.id, task.completed)}
            />
            <div className="flex-1">
              <div className={task.completed ? 'line-through text-muted-foreground' : ''}>
                {task.title}
              </div>
              <div className="text-xs text-muted-foreground">
                Assigned to: {task.assigned_email}
              </div>
            </div>
            {task.completed && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          </div>
        ))}
      </div>
    </Card>
  );
};
