import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Plus, X, Upload, Image as ImageIcon } from 'lucide-react';

interface DemoGoalDialogProps {
  trigger: React.ReactNode;
  onGoalAdd: (goal: any) => void;
}

const DemoGoalDialog: React.FC<DemoGoalDialogProps> = ({ trigger, onGoalAdd }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [progress, setProgress] = useState([0]);
  const [steps, setSteps] = useState<string[]>(['']);
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addStep = () => setSteps([...steps, '']);
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));
  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !category) {
      alert('Please enter a goal title and select a category');
      return;
    }

    const newGoal = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      category,
      timeframe: timeframe || '3 months',
      progress: progress[0],
      steps: steps.filter(s => s.trim() !== ''),
      images: images
    };


    onGoalAdd(newGoal);
    
    // Reset form
    setTitle('');
    setDescription('');
    setCategory('');
    setTimeframe('');
    setProgress([0]);
    setSteps(['']);
    setImages([]);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Run a Marathon"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does achieving this goal mean to you?"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="health">Health & Fitness</SelectItem>
                <SelectItem value="business">Career & Business</SelectItem>
                <SelectItem value="personal">Personal Growth</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
                <SelectItem value="purpose">Purpose</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeframe">Timeline</Label>
            <Input
              id="timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              placeholder="e.g., 6 months, 1 year"
            />
          </div>

          <div className="space-y-2">
            <Label>Current Progress: {progress[0]}%</Label>
            <Slider
              value={progress}
              onValueChange={setProgress}
              max={100}
              step={5}
              className="w-full"
            />
          </div>


          <div className="space-y-2">
            <Label>Inspiration Images</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload images</p>
                <p className="text-xs text-gray-400">Add photos to visualize your goal</p>
              </label>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt={`Goal ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Steps to Achieve</Label>
              <Button type="button" size="sm" variant="outline" onClick={addStep}>
                <Plus className="h-4 w-4 mr-1" /> Add Step
              </Button>
            </div>
            {steps.map((step, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                />
                {steps.length > 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeStep(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Goal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DemoGoalDialog;
