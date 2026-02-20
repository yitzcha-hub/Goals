import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { ManifestationGoal, GoalStep } from '@/hooks/useManifestationDatabase';

const timelineLabels: Record<string, string> = {
  '30': '30 Days',
  '60': '60 Days',
  '90': '90 Days',
  '1year': '1 Year',
  '5year': '5 Year Plan',
};

export interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (goal: Omit<ManifestationGoal, 'id' | 'createdAt' | 'progress' | 'recommendations'>) => void | Promise<void>;
}

export function AddGoalDialog({ open, onOpenChange, onAdd }: AddGoalDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeline, setTimeline] = useState<'30' | '60' | '90' | '1year' | '5year'>('30');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [targetDate, setTargetDate] = useState('');
  const [stepTitles, setStepTitles] = useState<string[]>(['']);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setTimeline('30');
      setPriority('medium');
      setTargetDate('');
      setStepTitles(['']);
    }
  }, [open]);

  const addStep = () => setStepTitles((s) => [...s, '']);
  const removeStep = (i: number) => setStepTitles((s) => s.filter((_, idx) => idx !== i));
  const setStep = (i: number, v: string) => setStepTitles((s) => { const n = [...s]; n[i] = v; return n; });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const steps: GoalStep[] = stepTitles
      .filter((s) => s.trim() !== '')
      .map((s, i) => ({ id: `s${Date.now()}-${i}`, title: s.trim(), completed: false }));
    onAdd({
      title: title.trim(),
      description: description.trim(),
      timeline,
      priority,
      imageUrl: '',
      targetDate: targetDate.trim() || undefined,
      steps: steps.length ? steps : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-2 max-w-md max-h-[90vh] overflow-y-auto" style={{ borderColor: 'var(--landing-border)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--landing-text)' }}>Add goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label style={{ color: 'var(--landing-text)' }}>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Run 5K"
              className="mt-1.5 rounded-xl border-[var(--landing-border)]"
              required
            />
          </div>
          <div>
            <Label style={{ color: 'var(--landing-text)' }}>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you want to achieve?"
              rows={2}
              className="mt-1.5 rounded-xl border-[var(--landing-border)]"
            />
          </div>
          <div>
            <Label style={{ color: 'var(--landing-text)' }}>Timeline</Label>
            <Select value={timeline} onValueChange={(v: '30' | '60' | '90' | '1year' | '5year') => setTimeline(v)}>
              <SelectTrigger className="mt-1.5 rounded-xl border-[var(--landing-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(timelineLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label style={{ color: 'var(--landing-text)' }}>Deadline (optional)</Label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="mt-1.5 rounded-xl border-[var(--landing-border)]"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label style={{ color: 'var(--landing-text)' }}>Steps (optional)</Label>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={addStep}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add step
              </Button>
            </div>
            <div className="space-y-2">
              {stepTitles.map((step, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={step}
                    onChange={(e) => setStep(i, e.target.value)}
                    placeholder={`Step ${i + 1}`}
                    className="rounded-xl border-[var(--landing-border)] flex-1"
                  />
                  {stepTitles.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 h-9 w-9 text-red-600" onClick={() => removeStep(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label style={{ color: 'var(--landing-text)' }}>Priority</Label>
            <Select value={priority} onValueChange={(v: 'high' | 'medium' | 'low') => setPriority(v)}>
              <SelectTrigger className="mt-1.5 rounded-xl border-[var(--landing-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl flex-1">
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl flex-1" disabled={!title.trim()}>
              Add goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
