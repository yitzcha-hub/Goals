import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Plus, Star } from 'lucide-react';

interface FamilyTask {
  id: string;
  title: string;
  description: string;
  points: number;
  assigned_to?: string;
  assigned_name?: string;
  status: string;
  completed_by_name?: string;
}

interface FamilyTaskListProps {
  tasks: FamilyTask[];
  onToggleTask: (taskId: string) => void;
  onAddTask: () => void;
}

export function FamilyTaskList({ tasks, onToggleTask, onAddTask }: FamilyTaskListProps) {
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Shared Tasks</h2>
        <Button onClick={onAddTask} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="space-y-4">
        {pendingTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">PENDING</h3>
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => onToggleTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        {task.points} pts
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    {task.assigned_name && (
                      <p className="text-xs text-purple-600 mt-1">Assigned to {task.assigned_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">COMPLETED</h3>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-green-50 opacity-75"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium line-through text-gray-600">{task.title}</h4>
                    {task.completed_by_name && (
                      <p className="text-xs text-green-600 mt-1">Completed by {task.completed_by_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
