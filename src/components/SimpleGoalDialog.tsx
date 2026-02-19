import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';
import { GoalPrivacySelector } from './GoalPrivacySelector';


interface SimpleGoalDialogProps {
  trigger: React.ReactNode;
  onGoalAdd: (goal: any) => void;
}

const SimpleGoalDialog: React.FC<SimpleGoalDialogProps> = ({ trigger, onGoalAdd }) => {
  const { markGoalComplete } = useOnboardingProgress();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [privacy, setPrivacy] = useState<'private' | 'friends' | 'public'>('private');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !category) {
      alert('Please enter a goal title and select a category');
      return;
    }

    const newGoal = {
      id: Date.now(),
      title: title.trim(),
      category,
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      progress: 0,
      status: 'active',
      privacy // Include privacy setting (defaults to 'private')
    };


    onGoalAdd(newGoal);
    markGoalComplete();
    
    // Reset form
    setTitle('');
    setCategory('');
    setOpen(false);

  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">What's your goal?</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Exercise daily, Learn Spanish, Save money"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Health">Health & Fitness</SelectItem>
                <SelectItem value="Career">Career & Work</SelectItem>
                <SelectItem value="Personal">Personal Growth</SelectItem>
                <SelectItem value="Finance">Money & Finance</SelectItem>
                <SelectItem value="Learning">Learning & Skills</SelectItem>
                <SelectItem value="Relationships">Relationships</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
                <SelectItem value="Friends">Friends</SelectItem>
                <SelectItem value="Community">Community</SelectItem>
                <SelectItem value="Volunteer">Volunteer</SelectItem>
                <SelectItem value="Contribute">Contribute</SelectItem>
                <SelectItem value="Donate">Donate</SelectItem>
                <SelectItem value="Ideas">Ideas</SelectItem>
              </SelectContent>
            </Select>
          </div>


          <div className="space-y-2">
            <Label>Privacy (Optional)</Label>
            <GoalPrivacySelector value={privacy} onChange={setPrivacy} />
            <p className="text-xs text-gray-500">Goals are private by default. Share only when you want feedback or support.</p>
          </div>
          
          
          <div className="flex justify-end gap-2 pt-4">

            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Goal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleGoalDialog;