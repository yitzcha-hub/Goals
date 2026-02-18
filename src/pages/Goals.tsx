import React, { useState, useMemo } from 'react';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Plus, Trash2, CalendarClock, PenLine, Sparkles, CheckCircle2, ChevronDown, ChevronUp, ImageIcon } from 'lucide-react';
import { useManifestationDatabase } from '@/hooks/useManifestationDatabase';
import { useReminders } from '@/hooks/useReminders';
import { InspirationSection } from '@/components/InspirationSection';
import type { GoalTemplateData } from '@/data/goalTemplatesData';
import { useEvents } from '@/hooks/useEvents';
import { EventDialog } from '@/components/EventDialog';
import type { CalendarEventData } from '@/hooks/useEvents';
import type { ManifestationGoal } from '@/hooks/useManifestationDatabase';
import goalsImg from '@/assets/images/Goals.jpg';
import { HeroFloatingCircles } from '@/components/HeroFloatingCircles';
import { TrialBanner } from '@/components/TrialBanner';
import { useToast } from '@/hooks/use-toast';
import { ProgressPhotos } from '@/components/ProgressPhotos';
import type { GoalStep } from '@/hooks/useManifestationDatabase';

const timelineLabels: Record<string, string> = {
  '30': '30 Days',
  '60': '60 Days',
  '90': '90 Days',
  '1year': '1 Year',
  '5year': '5 Year Plan',
};

/** Default goals — user can add with one click, then CRUD as normal */
const defaultGoals = [
  { title: 'Reach Ideal Weight', description: 'Achieve and maintain my target healthy weight.', timeline: '90' as const, priority: 'high' as const, icon: '⚖️' },
  { title: 'Daily Exercise Routine', description: 'Work out at least 30 minutes every day.', timeline: '30' as const, priority: 'medium' as const, icon: '💪' },
  { title: 'Read 12 Books This Year', description: 'Read one book per month.', timeline: '1year' as const, priority: 'medium' as const, icon: '📚' },
  { title: 'Save Emergency Fund', description: 'Build a 3-6 month emergency fund.', timeline: '1year' as const, priority: 'high' as const, icon: '💰' },
];

function generateRecommendations(timeline: string): string[] {
  if (timeline === '30') return ['Break into weekly milestones', 'Set daily check-ins'];
  if (timeline === '5year') return ['Create yearly milestones', 'Identify skills to develop'];
  return ['Review progress weekly', 'Celebrate small wins'];
}

export default function Goals() {
  const { toast } = useToast();
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventData | undefined>();
  const [prefilledGoal, setPrefilledGoal] = useState<{ id: string; title: string } | undefined>();
  const [photosOpenGoalIds, setPhotosOpenGoalIds] = useState<Set<string>>(new Set());

  const { goals, addGoal, updateGoalProgress, deleteGoal } = useManifestationDatabase();
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { createReminder } = useReminders();

  const eventsByGoalId = useMemo(() => {
    const map: Record<string, CalendarEventData[]> = {};
    for (const ev of events) {
      if (ev.goalId) {
        if (!map[ev.goalId]) map[ev.goalId] = [];
        map[ev.goalId].push(ev);
      }
    }
    Object.keys(map).forEach((id) => map[id].sort((a, b) => a.startTime.getTime() - b.startTime.getTime()));
    return map;
  }, [events]);

  const handleSaveEvent = async (
    data: Omit<CalendarEventData, 'id'>,
    options?: { reminderBefore?: number }
  ) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, data);
        toast({ title: 'Updated', description: 'Schedule updated.' });
      } else {
        const eventId = await addEvent(data);
        if (options?.reminderBefore && eventId) {
          const reminderTime = new Date(data.startTime.getTime() - options.reminderBefore * 60 * 1000);
          const label = options.reminderBefore === 15 ? '15 minutes' : options.reminderBefore === 60 ? '1 hour' : '1 day';
          await createReminder({
            type: 'event_reminder',
            entity_type: 'calendar_event',
            entity_id: eventId,
            reminder_time: reminderTime.toISOString(),
            message: `Your commitment "${data.title}" starts in ${label}`,
            channels: ['push'],
          });
        }
        toast({ title: 'Scheduled', description: 'Added to calendar.' });
      }
      setEditingEvent(undefined);
      setPrefilledGoal(undefined);
      setEventDialogOpen(false);
    } catch {
      toast({ title: 'Error', description: 'Could not save.', variant: 'destructive' });
    }
  };

  const openScheduleForGoal = (goal: ManifestationGoal) => {
    setPrefilledGoal({ id: goal.id, title: goal.title });
    setEditingEvent(undefined);
    setEventDialogOpen(true);
  };

  const addDefaultGoal = (suggested: (typeof defaultGoals)[0]) => {
    addGoal({
      title: suggested.title,
      description: suggested.description,
      timeline: suggested.timeline,
      priority: suggested.priority,
      imageUrl: '',
      progress: 0,
      recommendations: generateRecommendations(suggested.timeline),
    });
    toast({ title: 'Added', description: `"${suggested.title}" added. You can edit and schedule it.` });
  };

  const isDefaultAdded = (title: string) => goals.some((g) => g.title === title);

  const handleSelectTemplate = (template: GoalTemplateData) => {
    const timelineMap: Record<string, '30' | '60' | '90' | '1year' | '5year'> = {
      '8 weeks': '60',
      '12 weeks': '90',
      '16 weeks': '90',
      '20 weeks': '90',
      '6 months': '1year',
      '12 months': '1year',
      '18 months': '1year',
    };
    const timeline = timelineMap[template.duration] || '90';
    addGoal({
      title: template.title,
      description: template.description,
      timeline,
      priority: template.difficulty === 'Hard' ? 'high' : 'medium',
      imageUrl: '',
      progress: 0,
      recommendations: template.bestPractices || [],
    });
    toast({ title: 'Added', description: `"${template.title}" added from inspiration templates.` });
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen landing" style={{ backgroundColor: 'var(--landing-bg)', color: 'var(--landing-text)' }}>
        {/* Hero — full width, modern style, point animation */}
        <section
          className="relative w-full overflow-hidden"
          style={{ minHeight: '240px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
        >
          <div className="absolute inset-0">
            <img src={goalsImg} alt="" className="w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(160deg, rgba(15,23,42,0.75) 0%, rgba(26,107,79,0.82) 40%, rgba(44,157,115,0.78) 100%)',
              }}
            />
          </div>
          <HeroFloatingCircles variant="dark" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Your goals, your timeline
                </h1>
                <p className="mt-3 text-sm sm:text-base text-white/90 max-w-2xl leading-relaxed">
                  Set goals with clear steps, timelines, and deadlines. Track percent complete, upload progress photos, and attach sessions to your calendar—so it doesn&apos;t look like a calendar; it looks like your goals.
                </p>
              </div>
              <Button
                onClick={() => setAddGoalOpen(true)}
                className="hero-cta-primary font-semibold rounded-xl shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add goal
              </Button>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <TrialBanner />
          {/* Default goals — add with one click */}
          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden mb-6 mt-6" style={{ borderColor: 'var(--landing-border)' }}>
            <CardHeader style={{ backgroundColor: 'var(--landing-accent)' }}>
              <CardTitle className="text-base" style={{ color: 'var(--landing-text)' }}>
                Default goals — add one to get started, then edit and schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {defaultGoals.map((suggested, i) => {
                  const added = isDefaultAdded(suggested.title);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => !added && addDefaultGoal(suggested)}
                      disabled={added}
                      className={`rounded-xl p-4 text-left transition-all border-2 ${
                        added
                          ? 'opacity-60 cursor-default border-green-200'
                          : 'hover:border-[var(--landing-primary)] hover:shadow-md border-transparent'
                      }`}
                      style={{
                        backgroundColor: added ? 'rgba(44,157,115,0.08)' : 'var(--landing-bg)',
                        borderColor: added ? 'rgba(44,157,115,0.3)' : undefined,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-lg mr-2" aria-hidden>{suggested.icon}</span>
                          <span className="font-semibold text-sm" style={{ color: 'var(--landing-text)' }}>
                            {suggested.title}
                          </span>
                          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--landing-text)', opacity: 0.8 }}>
                            {suggested.description}
                          </p>
                          <span className="text-xs mt-1 inline-block" style={{ color: 'var(--landing-primary)' }}>
                            {timelineLabels[suggested.timeline]}
                          </span>
                        </div>
                        {added ? (
                          <span className="text-xs font-medium shrink-0" style={{ color: 'var(--landing-primary)' }}>Added</span>
                        ) : (
                          <span className="text-xs font-medium shrink-0" style={{ color: 'var(--landing-primary)' }}>Add</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--landing-text)', opacity: 0.7 }}>
                Or create your own goal below.
              </p>
            </CardContent>
          </Card>

          {/* Inspiration from successful people */}
          <div className="mb-6">
            <InspirationSection
              title="Inspired by successful people"
              subtitle="Goals and development plans used by entrepreneurs, professionals, athletes, and creators."
              onSelectTemplate={handleSelectTemplate}
              showAddButton={true}
            />
          </div>

          {goals.length === 0 ? (
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden" style={{ borderColor: 'var(--landing-border)' }}>
              <CardContent className="p-8 text-center">
                <Target className="h-10 w-10 mx-auto mb-3 opacity-50" style={{ color: 'var(--landing-primary)' }} />
                <p className="font-medium text-sm" style={{ color: 'var(--landing-text)' }}>Your goals will appear here</p>
                <p className="text-xs mt-1" style={{ color: 'var(--landing-text)', opacity: 0.7 }}>
                  Add a default goal above or create your own with steps and a deadline.
                </p>
                <Button onClick={() => setAddGoalOpen(true)} className="mt-4 rounded-xl" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add custom goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {goals.map((goal) => {
                const goalEvents = eventsByGoalId[goal.id] ?? [];
                const steps = goal.steps ?? [];
                const completedSteps = steps.filter((s) => s.completed).length;
                const percentComplete = steps.length > 0
                  ? Math.round((completedSteps / steps.length) * 100)
                  : goal.progress * 10;
                const photosOpen = photosOpenGoalIds.has(goal.id);
                const setPhotosOpen = (open: boolean) => {
                  setPhotosOpenGoalIds((prev) => {
                    const next = new Set(prev);
                    if (open) next.add(goal.id); else next.delete(goal.id);
                    return next;
                  });
                };
                return (
                  <Card
                    key={goal.id}
                    className="border-0 shadow-xl rounded-2xl overflow-hidden"
                    style={{ borderColor: 'var(--landing-border)' }}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-4" style={{ backgroundColor: 'var(--landing-accent)' }}>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg flex items-center gap-2" style={{ color: 'var(--landing-text)' }}>
                          {goal.title}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs font-medium rounded-full px-2 py-0.5 border" style={{ borderColor: 'var(--landing-primary)', color: 'var(--landing-primary)' }}>
                            {timelineLabels[goal.timeline] ?? goal.timeline}
                          </span>
                          {goal.targetDate && (
                            <span className="text-xs" style={{ color: 'var(--landing-text)', opacity: 0.9 }}>
                              Deadline: {new Date(goal.targetDate).toLocaleDateString('en-US')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                          onClick={() => openScheduleForGoal(goal)}
                        >
                          <CalendarClock className="h-4 w-4 mr-2" />
                          Schedule
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-lg text-red-600"
                          onClick={async () => {
                            if (window.confirm('Delete this goal?')) {
                              await deleteGoal(goal.id);
                              toast({ title: 'Deleted', description: 'Goal removed.' });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {goal.description && (
                        <p className="text-sm" style={{ color: 'var(--landing-text)', opacity: 0.9 }}>
                          {goal.description}
                        </p>
                      )}
                      {/* Steps */}
                      {steps.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--landing-text)', opacity: 0.7 }}>
                            Steps
                          </p>
                          <ul className="space-y-1.5">
                            {steps.map((step) => (
                              <li
                                key={step.id}
                                className="flex items-center gap-2 py-1.5 rounded-lg px-2"
                                style={{ backgroundColor: step.completed ? 'var(--landing-accent)' : 'transparent' }}
                              >
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const next = steps.map((s) => s.id === step.id ? { ...s, completed: !s.completed } : s);
                                    const done = next.filter((s) => s.completed).length;
                                    const newProgress = steps.length ? Math.round((done / steps.length) * 10) : goal.progress;
                                    await updateGoal(goal.id, { steps: next, progress: newProgress });
                                    toast({ title: step.completed ? 'Unchecked' : 'Step completed!' });
                                  }}
                                  className="flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center"
                                  style={{ borderColor: step.completed ? 'var(--landing-primary)' : 'var(--landing-border)' }}
                                >
                                  {step.completed && <CheckCircle2 className="h-3.5 w-3.5" style={{ color: 'var(--landing-primary)' }} />}
                                </button>
                                <span className={`text-sm ${step.completed ? 'line-through opacity-70' : ''}`} style={{ color: 'var(--landing-text)' }}>
                                  {step.title}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* Percent complete & progress */}
                      <div>
                        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--landing-text)', opacity: 0.8 }}>
                          <span>Percent complete</span>
                          <span>{steps.length > 0 ? `${percentComplete}%` : `${goal.progress}/10`}</span>
                        </div>
                        <Progress value={steps.length > 0 ? percentComplete : goal.progress * 10} className="h-2 rounded-full" />
                        {steps.length === 0 && (
                          <div className="flex gap-2 mt-2">
                            {[0, 2, 4, 6, 8, 10].map((v) => (
                              <Button
                                key={v}
                                size="sm"
                                variant={goal.progress === v ? 'default' : 'outline'}
                                className="rounded-lg h-7 px-2"
                                onClick={() => updateGoalProgress(goal.id, v)}
                              >
                                {v}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Schedule (secondary) */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--landing-text)', opacity: 0.7 }}>
                          Schedule
                        </p>
                        {goalEvents.length === 0 ? (
                          <p className="text-sm" style={{ color: 'var(--landing-text)', opacity: 0.6 }}>
                            No times scheduled. Click Schedule to add.
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {goalEvents.map((ev) => (
                              <li
                                key={ev.id}
                                className="flex items-center justify-between gap-2 p-2 rounded-lg border"
                                style={{ borderColor: 'var(--landing-border)', backgroundColor: 'var(--landing-bg)' }}
                              >
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-sm" style={{ color: 'var(--landing-text)' }}>
                                    {ev.startTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                  </span>
                                  <span className="text-sm ml-2" style={{ color: 'var(--landing-text)', opacity: 0.8 }}>
                                    {ev.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} –{' '}
                                    {ev.endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                  </span>
                                  <span className="ml-2 text-xs" style={{ color: 'var(--landing-text)', opacity: 0.6 }}>
                                    {ev.title}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg"
                                    onClick={() => {
                                      setEditingEvent(ev);
                                      setPrefilledGoal(undefined);
                                      setEventDialogOpen(true);
                                    }}
                                  >
                                    <PenLine className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-red-600"
                                    onClick={async () => {
                                      await deleteEvent(ev.id);
                                      toast({ title: 'Removed', description: 'Schedule removed.' });
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {/* Progress photos (collapsible) */}
                      <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--landing-border)' }}>
                        <button
                          type="button"
                          onClick={() => setPhotosOpen(!photosOpen)}
                          className="w-full flex items-center justify-between gap-2 p-3 text-left"
                          style={{ backgroundColor: 'var(--landing-accent)' }}
                        >
                          <span className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--landing-text)' }}>
                            <ImageIcon className="h-4 w-4" style={{ color: 'var(--landing-primary)' }} />
                            Progress photos
                          </span>
                          {photosOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {photosOpen && (
                          <div className="p-3" style={{ backgroundColor: 'var(--landing-bg)' }}>
                            <ProgressPhotos goalId={goal.id} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <AddGoalDialog
            open={addGoalOpen}
            onOpenChange={setAddGoalOpen}
            onAdd={async (g) => {
              await addGoal({
                ...g,
                progress: 0,
                recommendations: generateRecommendations(g.timeline),
              });
              setAddGoalOpen(false);
              toast({ title: 'Added', description: 'Goal created.' });
            }}
          />

          <EventDialog
            open={eventDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setEditingEvent(undefined);
                setPrefilledGoal(undefined);
              }
              setEventDialogOpen(open);
            }}
            onSave={handleSaveEvent}
            event={editingEvent}
            selectedDate={new Date()}
            prefilledGoal={prefilledGoal}
            goals={goals}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

function AddGoalDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (goal: Omit<ManifestationGoal, 'id' | 'createdAt' | 'progress' | 'recommendations'>) => void | Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeline, setTimeline] = useState<'30' | '60' | '90' | '1year' | '5year'>('30');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [targetDate, setTargetDate] = useState('');
  const [stepTitles, setStepTitles] = useState<string[]>(['']);

  React.useEffect(() => {
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
            <Select value={timeline} onValueChange={(v: any) => setTimeline(v)}>
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
            <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
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
