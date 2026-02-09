import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Calendar as CalendarIcon, Plus, Bell } from 'lucide-react';
import type { ManifestationGoal } from '@/hooks/useManifestationDatabase';
import type { CalendarEventData, EventStatus } from '@/hooks/useEvents';

export interface CalendarEvent extends CalendarEventData {}

export type ReminderBefore = 0 | 15 | 60 | 1440; // minutes: none, 15min, 1hr, 1day

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (event: Omit<CalendarEventData, 'id'>, options?: { reminderBefore?: ReminderBefore }) => void | Promise<void>;
  event?: CalendarEventData;
  selectedDate?: Date;
  selectedTime?: string;
  /** Prefill for "Create from goal" flow */
  prefilledGoal?: { id: string; title: string };
  goals?: ManifestationGoal[];
}

const colors = [
  { value: '#2c9d73', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#ef4444', label: 'Red' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
];

export function EventDialog({
  open,
  onOpenChange,
  onSave,
  event,
  selectedDate,
  selectedTime,
  prefilledGoal,
  goals = [],
}: EventDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState('#2c9d73');
  const [location, setLocation] = useState('');
  const [goalId, setGoalId] = useState<string>('');
  const [status, setStatus] = useState<EventStatus>('planned');
  const [reminderBefore, setReminderBefore] = useState<ReminderBefore>(0);

  useEffect(() => {
    if (!open) return;

    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setDate(event.startTime.toISOString().split('T')[0]);
      setStartTime(event.startTime.toTimeString().slice(0, 5));
      setEndTime(event.endTime.toTimeString().slice(0, 5));
      setColor(event.color);
      setLocation(event.location || '');
      setGoalId(event.goalId || '');
      setStatus(event.status || 'planned');
      setReminderBefore(0);
    } else {
      // Reset form for new event
      setTitle(prefilledGoal?.title || '');
      setDescription('');
      setDate(selectedDate?.toISOString().split('T')[0] || '');
      setColor('#2c9d73');
      setLocation('');
      setGoalId(prefilledGoal?.id || '');
      setStatus('planned');
      setReminderBefore(0);

      if (selectedTime) {
        setStartTime(selectedTime);
        // Auto-compute end time = start + 1 hour
        const [h, m] = selectedTime.split(':').map(Number);
        const endH = Math.min(23, h + 1);
        setEndTime(`${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      } else {
        setStartTime('09:00');
        setEndTime('10:00');
      }
    }
  }, [open, event, selectedDate, selectedTime, prefilledGoal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startDateTime = new Date(`${date}T${startTime}`);
    let endDateTime = new Date(`${date}T${endTime}`);
    if (endDateTime <= startDateTime) {
      endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
    }

    onSave(
      {
        title,
        description,
        startTime: startDateTime,
        endTime: endDateTime,
        color,
        location,
        goalId: goalId || undefined,
        status,
      },
      reminderBefore ? { reminderBefore } : undefined
    );

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setStartTime('09:00');
    setEndTime('10:00');
    setColor('#2c9d73');
    setLocation('');
    setGoalId('');
    setStatus('planned');
    setReminderBefore(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="landing max-w-md p-0 overflow-hidden border-2 shadow-lg rounded-2xl bg-transparent" style={{ borderColor: 'var(--landing-primary)', backgroundColor: 'var(--landing-accent)' }}>
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold" style={{ color: 'var(--landing-text)' }}>
            <CalendarIcon className="h-5 w-5" style={{ color: 'var(--landing-primary)' }} />
            {event ? 'Edit commitment' : 'Schedule your commitment'}
          </DialogTitle>
          <p className="text-sm mt-1" style={{ color: 'var(--landing-text)', opacity: 0.8 }}>
            {event ? 'Update when you\'ll work on this.' : 'Attach your goal to time. Goals become commitments.'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Link to goal */}
          {goals.length > 0 && (
            <div>
              <Label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--landing-text)' }}>
                <Target className="h-4 w-4" style={{ color: 'var(--landing-primary)' }} />
                Link to goal
              </Label>
              <Select value={goalId || 'none'} onValueChange={(v) => setGoalId(v === 'none' ? '' : v)}>
                <SelectTrigger className="mt-1.5 border-[var(--landing-border)] focus-visible:ring-[var(--landing-primary)]" style={{ backgroundColor: 'white' }}>
                  <SelectValue placeholder="No goal linked" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No goal linked</SelectItem>
                  {goals.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      <span className="truncate">{g.title}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="font-medium" style={{ color: 'var(--landing-text)' }}>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1.5 border-[var(--landing-border)] focus-visible:ring-[var(--landing-primary)]"
              placeholder="e.g. Morning workout"
            />
          </div>

          <div>
            <Label className="font-medium" style={{ color: 'var(--landing-text)' }}>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1.5 border-[var(--landing-border)] focus-visible:ring-[var(--landing-primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-medium" style={{ color: 'var(--landing-text)' }}>Start</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="mt-1.5 border-[var(--landing-border)] focus-visible:ring-[var(--landing-primary)]"
              />
            </div>
            <div>
              <Label className="font-medium" style={{ color: 'var(--landing-text)' }}>End</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="mt-1.5 border-[var(--landing-border)] focus-visible:ring-[var(--landing-primary)]"
              />
            </div>
          </div>

          <div>
            <Label className="font-medium" style={{ color: 'var(--landing-text)' }}>Color</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger className="mt-1.5 border-[var(--landing-border)] focus-visible:ring-[var(--landing-primary)]" style={{ backgroundColor: 'white' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colors.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.value }} />
                      {c.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {event && (
            <div>
              <Label className="font-medium" style={{ color: 'var(--landing-text)' }}>Status</Label>
              <Select value={status} onValueChange={(v: EventStatus) => setStatus(v)}>
                <SelectTrigger className="mt-1.5 border-[var(--landing-border)] focus-visible:ring-[var(--landing-primary)]" style={{ backgroundColor: 'white' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="missed">Missed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!event && (
            <div>
              <Label className="flex items-center gap-2 font-medium" style={{ color: 'var(--landing-text)' }}>
                <Bell className="h-4 w-4" style={{ color: 'var(--landing-primary)' }} />
                Remind me before
              </Label>
              <Select value={String(reminderBefore)} onValueChange={(v) => setReminderBefore(Number(v) as ReminderBefore)}>
                <SelectTrigger className="mt-1.5 border-[var(--landing-border)] focus-visible:ring-[var(--landing-primary)]" style={{ backgroundColor: 'white' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No reminder</SelectItem>
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="1440">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="font-medium" style={{ color: 'var(--landing-text)' }}>Location (optional)</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1.5 border-[var(--landing-border)] focus-visible:ring-[var(--landing-primary)]"
              placeholder="e.g. Gym, Home"
            />
          </div>

          <div>
            <Label className="font-medium" style={{ color: 'var(--landing-text)' }}>Notes (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1.5 border-[var(--landing-border)] focus-visible:ring-[var(--landing-primary)]"
              placeholder="Any details..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 font-bold hero-cta-outline">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 font-bold text-white hero-cta-primary">
              {event ? (
                'Update'
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create commitment
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
