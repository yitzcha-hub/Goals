import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';


interface TaskInputDialogProps {
  onAddTask: (task: {
    title: string;
    priority: 'low' | 'medium' | 'high';
  }) => void;
  children: React.ReactNode;
}

export const TaskInputDialog: React.FC<TaskInputDialogProps> = ({ onAddTask, children }) => {
  const { markTaskComplete } = useOnboardingProgress();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask({ title: title.trim(), priority });
      markTaskComplete();
      setTitle('');
      setPriority('medium');
      setOpen(false);
    }
  };

  return (

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Your Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="task-title">Task</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Practice guitar for 30 minutes"
              required
            />
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority (5 points)</SelectItem>
                <SelectItem value="medium">Medium Priority (15 points)</SelectItem>
                <SelectItem value="high">High Priority (25 points)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};