import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Target,
  Calendar as CalendarIcon,
  Check,
  Heart,
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  Clock,
  ListTodo,
  PenLine,
  CheckCircle2,
  Image as ImageIcon,
  DollarSign,
  SparklesIcon,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useManifestationDatabase } from '@/hooks/useManifestationDatabase';
import { useEvents } from '@/hooks/useEvents';
import { useReminders } from '@/hooks/useReminders';
import { EventDialog } from '@/components/EventDialog';
import { DayTimelineView } from '@/components/DayTimelineView';
import type { DayEventInput } from '@/lib/dayEventLayout';
import { TrialBanner } from '@/components/TrialBanner';
import type { CalendarEventData } from '@/hooks/useEvents';
import type { ManifestationGoal, ManifestationTodo, ManifestationGratitude, ManifestationJournalEntry } from '@/hooks/useManifestationDatabase';
import dashboardHeroImg from '@/assets/images/Life-is-in-Time-woman.jpg';
import { HeroFloatingCircles } from '@/components/HeroFloatingCircles';
import { useToast } from '@/hooks/use-toast';
import GoalDetailView from '@/components/GoalDetailView';
import { DemoOnboardingModals } from '@/components/DemoOnboardingModals';
import type { DemoGoalGenerated } from '@/data/demoOnboardingMockData';
import { getDefaultImageForCategory } from '@/data/demoOnboardingMockData';
import { generateGoalsWithOpenAI, recommendImagesForGoals, generateTodosWithOpenAI, getActiveProvider } from '@/lib/openaiProgressAnalysis';
import demoHeroBg from '@/assets/images/Demo-bg.png';

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function isSameDay(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

const timelineLabels: Record<string, string> = {
  '30': '30 Days',
  '60': '60 Days',
  '90': '90 Days',
  '1year': '1 Year',
  '5year': '5 Year Plan',
};

export default function Dashboard() {
  const { toast } = useToast();
  const [dashboardHeroUrl, setDashboardHeroUrl] = useState(dashboardHeroImg);
  const [heroEditOpen, setHeroEditOpen] = useState(false);
  const [heroInputUrl, setHeroInputUrl] = useState('');
  const heroFileInputRef = React.useRef<HTMLInputElement>(null);
  const MAX_HERO_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB for data URL in localStorage
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const selectedIso = toISODate(selectedDate);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventData | undefined>();
  const [gratitudeDialogOpen, setGratitudeDialogOpen] = useState(false);
  const [journalDialogOpen, setJournalDialogOpen] = useState(false);
  const [slotClickTime, setSlotClickTime] = useState<string | undefined>();
  const [overviewNewTaskTitle, setOverviewNewTaskTitle] = useState('');
  const [overviewNewGratitude, setOverviewNewGratitude] = useState('');
  const navigate = useNavigate();

  const {
    goals,
    todos,
    gratitudeEntries,
    journalEntries,
    totalPoints,
    streak,
    addGoal,
    updateGoal,
    updateGoalProgress,
    deleteGoal,
    addTodo,
    toggleTodo,
    deleteTodo,
    addGratitudeForDate,
    updateGratitude,
    deleteGratitude,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
  } = useManifestationDatabase();

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const selectedGoal = selectedGoalId ? goals.find((g) => g.id === selectedGoalId) : null;

  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDay, setNewTaskDay] = useState<'today' | 'tomorrow'>('today');
  const [newTaskTimeSlot, setNewTaskTimeSlot] = useState('');
  const [newGratitude, setNewGratitude] = useState('');

  const todayIso = toISODate(new Date());
  const tomorrowIso = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toISODate(d);
  })();

  useEffect(() => {
    if (goals.length === 0 && !localStorage.getItem('goals_app_dashboard_onboarding_done')) {
      setOnboardingOpen(true);
    }
  }, [goals.length]);

  const handleOnboardingRecommended = async (generated: DemoGoalGenerated[]) => {
    try {
      for (const g of generated) {
        await addGoal({
          title: g.title,
          description: g.description,
          timeline: g.timeline as '30' | '60' | '90' | '1year' | '5year',
          progress: g.progress,
          imageUrl: g.image,
          priority: g.priority,
          recommendations: [],
          targetDate: g.targetDate,
          steps: (g.steps ?? []).map((s) => ({
            id: s.id,
            title: s.title,
            completed: s.completed ?? false,
            predictDate: s.predictDate,
            predictPrice: s.predictPrice,
          })),
          budget: g.budget ?? 0,
          spent: g.spent ?? 0,
        });
      }
      localStorage.setItem('goals_app_dashboard_onboarding_done', '1');
      setOnboardingOpen(false);
      toast({ title: 'Goals added', description: `${generated.length} goal${generated.length === 1 ? '' : 's'} added to your goals list.` });
      document.getElementById('dashboard-content')?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      toast({ title: 'Could not add goals', description: e instanceof Error ? e.message : 'Something went wrong.', variant: 'destructive' });
    }
  };

  const handleRecommendRequest = async (
    occupation: string,
    aspiration: string,
    description: string,
  ): Promise<DemoGoalGenerated[]> => {
    const result = await generateGoalsWithOpenAI(occupation, aspiration, description);
    if (!result || result.length === 0) return [];
    const images = await recommendImagesForGoals(result);
    const id = () => `ai-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return result.map((g, i) => ({
      id: id(),
      title: g.title,
      description: g.description,
      progress: 0,
      timeline: g.timeline,
      priority: g.priority,
      category: g.category,
      targetDate: g.targetDate,
      image: images[i] ?? getDefaultImageForCategory(g.category),
      budget: g.budget,
      spent: 0,
      steps: (g.steps ?? []).map((s, j) => ({
        id: `s${j}-${id()}`,
        title: s.title,
        completed: false,
        predictDate: s.predictDate,
        predictPrice: s.predictPrice,
      })),
    }));
  };

  const [aiTodosLoading, setAiTodosLoading] = useState<'today' | 'tomorrow' | null>(null);

  const handleAIGenerateTodos = async (day: 'today' | 'tomorrow') => {
    if (!getActiveProvider()) {
      toast({ title: 'AI not configured', description: 'Set VITE_OPENAI_API_KEY in .env to generate to-dos.', variant: 'destructive' });
      return;
    }
    setAiTodosLoading(day);
    try {
      const previousTodos = todos.map((t) => ({ title: t.title, completed: t.completed }));
      const generated = await generateTodosWithOpenAI(
        day,
        goals.map((g) => ({ title: g.title, progress: g.progress })),
        previousTodos,
      );
      if (generated && generated.length > 0) {
        const iso = day === 'today' ? todayIso : tomorrowIso;
        for (const item of generated) {
          addTodo({
            title: item.title,
            completed: false,
            points: 5,
            scheduledDate: iso,
            timeSlot: item.timeSlot ?? undefined,
          });
        }
        toast({ title: 'To-dos added', description: `Generated ${generated.length} tasks for ${day}.` });
      } else {
        toast({ title: 'No suggestions', description: 'Could not generate to-dos. Try again.', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Failed', description: e instanceof Error ? e.message : 'Could not generate to-dos.', variant: 'destructive' });
    } finally {
      setAiTodosLoading(null);
    }
  };

  const todosToday = useMemo(() => todos.filter((t) => t.scheduledDate === todayIso), [todos, todayIso]);
  const todosTomorrow = useMemo(() => todos.filter((t) => t.scheduledDate === tomorrowIso), [todos, tomorrowIso]);

  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { createReminder } = useReminders();

  const eventsOnDate = useMemo(
    () => events.filter((e) => isSameDay(e.startTime, selectedDate)),
    [events, selectedDate]
  );

  /** Completed to-dos whose completedAt falls on the selected date */
  const completedTodosOnDate = useMemo(
    () =>
      todos.filter((t) => {
        if (!t.completed || !t.completedAt) return false;
        return t.completedAt.split('T')[0] === selectedIso;
      }),
    [todos, selectedIso],
  );

  const dayEvents: DayEventInput[] = useMemo(() => {
    const dayStart = new Date(selectedIso + 'T00:00:00').getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    // Regular calendar events
    const calendarItems: DayEventInput[] = eventsOnDate.map((e) => {
      const startMs = Math.max(e.startTime.getTime(), dayStart);
      const endMs = Math.min(e.endTime.getTime(), dayEnd);
      const startMinutes = ((new Date(startMs).getTime() - dayStart) / (60 * 1000)) | 0;
      const endMinutes = ((new Date(endMs).getTime() - dayStart) / (60 * 1000)) | 0;
      return {
        id: e.id,
        title: e.title,
        start: Math.max(0, startMinutes),
        end: Math.min(24 * 60, Math.max(endMinutes, startMinutes + 1)),
      };
    });

    // Completed to-dos rendered as 15-min activity markers
    const todoItems: DayEventInput[] = completedTodosOnDate.map((t) => {
      const doneAt = new Date(t.completedAt!);
      const startMinutes = doneAt.getHours() * 60 + doneAt.getMinutes();
      return {
        id: `todo-${t.id}`,
        title: `✓ ${t.title}`,
        start: Math.max(0, startMinutes),
        end: Math.min(24 * 60, startMinutes + 15),
      };
    });

    return [...calendarItems, ...todoItems];
  }, [eventsOnDate, completedTodosOnDate, selectedDate, selectedIso]);

  const eventColors = useMemo(() => {
    const colors: Record<string, string> = {};
    eventsOnDate.forEach((e) => { colors[e.id] = e.color; });
    // Completed to-dos get a green "done" color
    completedTodosOnDate.forEach((t) => { colors[`todo-${t.id}`] = '#16a34a'; });
    return colors;
  }, [eventsOnDate, completedTodosOnDate]);
  const todosOnDate = useMemo(
    () => todos.filter((t) => t.scheduledDate === selectedIso),
    [todos, selectedIso]
  );
  const gratitudeForDate = useMemo(
    () => gratitudeEntries.find((g) => g.date === selectedIso),
    [gratitudeEntries, selectedIso]
  );
  const journalForDate = useMemo(
    () => journalEntries.find((j) => j.date === selectedIso),
    [journalEntries, selectedIso]
  );

  const stats = {
    totalGoals: goals.length,
    scheduleToday: eventsOnDate.length,
    todosToday: todosOnDate.length,
  };

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
        toast({ title: 'Scheduled', description: 'Added to your day.' });
      }
      setEditingEvent(undefined);
      setEventDialogOpen(false);
    } catch {
      toast({ title: 'Error', description: 'Could not save.', variant: 'destructive' });
    }
  };

  const handleEventTimeUpdate = useCallback(
    async (id: string, newStartMinutes: number, newEndMinutes: number) => {
      // Ignore drag on to-do activity markers
      if (id.startsWith('todo-')) return;
      const dayStart = new Date(selectedIso + 'T00:00:00');
      const newStart = new Date(dayStart.getTime() + newStartMinutes * 60 * 1000);
      const newEnd = new Date(dayStart.getTime() + newEndMinutes * 60 * 1000);
      try {
        await updateEvent(id, { startTime: newStart, endTime: newEnd });
        toast({ title: 'Updated', description: 'Schedule time updated.' });
      } catch {
        toast({ title: 'Error', description: 'Could not update.', variant: 'destructive' });
      }
    },
    [selectedIso, updateEvent, toast],
  );

  const handleSlotClick = useCallback(
    (startMinutes: number) => {
      const h = Math.floor(startMinutes / 60);
      const m = startMinutes % 60;
      setSlotClickTime(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      );
      setEditingEvent(undefined);
      setEventDialogOpen(true);
    },
    [],
  );

  const openNewSchedule = () => {
    setEditingEvent(undefined);
    setSlotClickTime(undefined);
    setEventDialogOpen(true);
  };

  const dateLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (selectedGoal && selectedGoalId) {
    return (
      <GoalDetailView
        goal={selectedGoal}
        onBack={() => setSelectedGoalId(null)}
        updateGoal={updateGoal}
      />
    );
  }

  return (
    <div className="min-h-screen landing" style={{ backgroundColor: 'var(--landing-bg)', color: 'var(--landing-text)' }}>
      {/* Hero — Demo-style: same as Demo page */}
      <section
        id="hero"
        className="relative py-20 sm:py-28 px-4 min-h-[28rem] flex items-center justify-center overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${demoHeroBg})` }}
          aria-hidden
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'var(--landing-accent)', opacity: 0.85 }} aria-hidden />
        <HeroFloatingCircles />
        <div className="relative z-10 max-w-6xl mx-auto text-center px-4 sm:px-6">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent animate-slide-up"
            style={{
              backgroundImage: 'linear-gradient(135deg, var(--landing-primary) 0%, var(--landing-primary-soft) 50%, #1a6b4f 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              animationDelay: '0.1s',
            }}
          >
            Your Dashboard
          </h1>
          <p
            className="text-lg sm:text-xl mb-4 font-bold max-w-2xl mx-auto bg-clip-text text-transparent animate-slide-up"
            style={{
              backgroundImage: 'linear-gradient(135deg, #4a5568 0%, #2d3748 50%, #1a1a1a 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              animationDelay: '0.25s',
            }}
          >
            Goals, steps, progress timeline, and daily to-dos — all in one place
          </p>
          <p className="text-sm font-medium opacity-90 mb-8 animate-slide-up" style={{ color: 'var(--landing-text)', animationDelay: '0.3s' }}>
            Click a goal to see details • Use AI to generate to-dos • Add gratitude
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" variant="default" className="hero-cta-primary" onClick={() => setOnboardingOpen(true)}>
              <Sparkles className="h-5 w-5 mr-2" />
              Start guided setup
            </Button>
            <Button size="lg" variant="outline" onClick={() => document.getElementById('dashboard-content')?.scrollIntoView({ behavior: 'smooth' })} className="hero-cta-outline">
              Go to my goals
            </Button>
          </div>
        </div>
      </section>

      <DemoOnboardingModals
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onCompleteWithOwnPlan={() => {
          localStorage.setItem('goals_app_dashboard_onboarding_done', '1');
          setOnboardingOpen(false);
        }}
        onCompleteWithRecommended={handleOnboardingRecommended}
        onRecommendRequest={handleRecommendRequest}
      />

      {/* Stats Bar */}
      <section className="py-8 px-4 border-t" style={{ backgroundColor: 'var(--landing-bg)', borderColor: 'var(--landing-border)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-border)' }}>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--landing-primary)' }}>{goals.length}</div>
            <div className="text-sm font-medium" style={{ color: 'var(--landing-text)' }}>Active Goals</div>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-border)' }}>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--landing-primary)' }}>{todos.filter((t) => t.completed).length}/{todos.length}</div>
            <div className="text-sm font-medium" style={{ color: 'var(--landing-text)' }}>Tasks Done</div>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-border)' }}>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--landing-primary)' }}>{totalPoints}</div>
            <div className="text-sm font-medium" style={{ color: 'var(--landing-text)' }}>Total Points</div>
          </div>
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-border)' }}>
            <div className="text-3xl font-bold mb-1" style={{ color: 'var(--landing-primary)' }}>{streak} days</div>
            <div className="text-sm font-medium" style={{ color: 'var(--landing-text)' }}>Current Streak</div>
          </div>
        </div>
      </section>

      {/* Main content: Goals grid + To-Do by day + Gratitude */}
      <section id="dashboard-content" className="py-12 px-4 sm:px-6 border-t scroll-mt-24" style={{ backgroundColor: 'var(--landing-bg)', borderColor: 'var(--landing-border)' }}>
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Goals Grid */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8" style={{ color: 'var(--landing-primary)' }} />
                <h2 className="text-3xl font-bold" style={{ color: 'var(--landing-text)' }}>Your Goals (0-10 Scale)</h2>
              </div>
              <Button className="hero-cta-primary rounded-xl" onClick={() => navigate('/goals')}>
                <Plus className="h-5 w-5 mr-2" />
                Add Goal
              </Button>
            </div>
            {goals.length === 0 ? (
              <Card className="overflow-hidden shadow-lg rounded-2xl feature-card-shadow" style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
                <CardContent className="p-8 text-center">
                  <Target className="h-10 w-10 mx-auto mb-3 opacity-50" style={{ color: 'var(--landing-primary)' }} />
                  <p className="font-medium" style={{ color: 'var(--landing-text)' }}>No goals yet</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--landing-text)', opacity: 0.7 }}>Start guided setup above or add goals from the Goals page.</p>
                  <Button onClick={() => setOnboardingOpen(true)} className="mt-4 rounded-xl" size="sm">Start guided setup</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => (
                  <Card
                    key={goal.id}
                    className="overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer feature-card-shadow"
                    style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}
                    onClick={() => setSelectedGoalId(goal.id)}
                  >
                    {goal.imageUrl && (
                      <div className="w-full h-40 overflow-hidden">
                        <img src={goal.imageUrl} alt={goal.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--landing-text)' }}>{goal.title}</h3>
                        <span className="text-2xl font-bold" style={{ color: 'var(--landing-primary)' }}>{goal.progress}/10</span>
                      </div>
                      <p className="text-sm mb-3 opacity-90" style={{ color: 'var(--landing-text)' }}>{goal.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" style={{ borderColor: 'var(--landing-primary)', color: 'var(--landing-primary)' }}>{timelineLabels[goal.timeline] ?? goal.timeline}</Badge>
                        <Badge style={{ backgroundColor: goal.priority === 'high' ? 'rgba(220,38,38,0.12)' : 'var(--landing-accent)', color: goal.priority === 'high' ? '#dc2626' : 'var(--landing-primary)' }}>{goal.priority}</Badge>
                      </div>
                      {(goal.budget != null && goal.budget > 0) && (
                        <div className="flex flex-wrap gap-4 mb-3 text-sm" style={{ color: 'var(--landing-text)' }}>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" style={{ color: 'var(--landing-primary)' }} />
                            <span><strong>Budget:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(goal.budget)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" style={{ color: 'var(--landing-primary)' }} />
                            <span><strong>Spent:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(goal.spent ?? 0)}</span>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <Slider value={[goal.progress]} onValueChange={(v) => updateGoalProgress(goal.id, v[0])} max={10} step={1} className="w-full" />
                        <Progress value={goal.progress * 10} className="h-2" style={{ backgroundColor: 'var(--landing-accent)' }} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Two Column: To-Do by day + Gratitude */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* To-Do List by day — Today/Tomorrow, time slot, AI generate */}
            <Card className="shadow-lg feature-card-shadow" style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-7 w-7" style={{ color: 'var(--landing-primary)' }} />
                    <h3 className="text-2xl font-semibold" style={{ color: 'var(--landing-text)' }}>To-Do List</h3>
                    <Badge style={{ backgroundColor: 'var(--landing-accent)', color: 'var(--landing-primary)' }}>By day · +5 pts each</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => handleAIGenerateTodos('today')} className="text-xs" disabled={aiTodosLoading !== null}>
                      {aiTodosLoading === 'today' ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <SparklesIcon className="h-3 w-3 mr-1" />} AI: Today
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => handleAIGenerateTodos('tomorrow')} className="text-xs" disabled={aiTodosLoading !== null}>
                      {aiTodosLoading === 'tomorrow' ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <SparklesIcon className="h-3 w-3 mr-1" />} AI: Tomorrow
                    </Button>
                  </div>
                </div>
                <Tabs defaultValue="today" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4" style={{ backgroundColor: 'var(--landing-accent)' }}>
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
                  </TabsList>
                  <TabsContent value="today" className="space-y-3 mt-0">
                    {todosToday.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 p-4 rounded-xl transition-all ${task.completed ? 'border-2' : ''}`}
                        style={{ backgroundColor: task.completed ? 'var(--landing-accent)' : 'var(--landing-bg)', borderColor: task.completed ? 'var(--landing-primary)' : 'transparent' }}
                      >
                        <button type="button" onClick={() => toggleTodo(task.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${task.completed ? '' : 'border-gray-300'}`} style={task.completed ? { backgroundColor: 'var(--landing-primary)', borderColor: 'var(--landing-primary)' } : {}}>
                          {task.completed && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </button>
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          {task.timeSlot && <span className="flex items-center gap-1 text-xs shrink-0 opacity-80" style={{ color: 'var(--landing-text)' }}><Clock className="h-3 w-3" /> {task.timeSlot}</span>}
                          <span className={`${task.completed ? 'line-through opacity-70' : ''}`} style={{ color: 'var(--landing-text)' }}>{task.title}</span>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="tomorrow" className="space-y-3 mt-0">
                    {todosTomorrow.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 p-4 rounded-xl transition-all ${task.completed ? 'border-2' : ''}`}
                        style={{ backgroundColor: task.completed ? 'var(--landing-accent)' : 'var(--landing-bg)', borderColor: task.completed ? 'var(--landing-primary)' : 'transparent' }}
                      >
                        <button type="button" onClick={() => toggleTodo(task.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${task.completed ? '' : 'border-gray-300'}`} style={task.completed ? { backgroundColor: 'var(--landing-primary)', borderColor: 'var(--landing-primary)' } : {}}>
                          {task.completed && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </button>
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          {task.timeSlot && <span className="flex items-center gap-1 text-xs shrink-0 opacity-80" style={{ color: 'var(--landing-text)' }}><Clock className="h-3 w-3" /> {task.timeSlot}</span>}
                          <span className={`${task.completed ? 'line-through opacity-70' : ''}`} style={{ color: 'var(--landing-text)' }}>{task.title}</span>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const title = newTaskTitle.trim();
                    if (title) {
                      const iso = newTaskDay === 'today' ? todayIso : tomorrowIso;
                      addTodo({ title, completed: false, points: 5, scheduledDate: iso, timeSlot: newTaskTimeSlot.trim() || undefined });
                      setNewTaskTitle('');
                      setNewTaskTimeSlot('');
                      toast({ title: 'Added', description: `Task added for ${newTaskDay}.` });
                    }
                  }}
                  className="space-y-2 mt-4"
                >
                  <div className="flex flex-wrap gap-2 items-center">
                    <Input placeholder="Add a task..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="flex-1 min-w-[140px]" style={{ borderColor: 'var(--landing-border)' }} />
                    <Select value={newTaskDay} onValueChange={(v: 'today' | 'tomorrow') => setNewTaskDay(v)}>
                      <SelectTrigger className="w-[110px]" style={{ borderColor: 'var(--landing-border)' }}><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="today">Today</SelectItem><SelectItem value="tomorrow">Tomorrow</SelectItem></SelectContent>
                    </Select>
                    <Input placeholder="Time (e.g. 09:00)" value={newTaskTimeSlot} onChange={(e) => setNewTaskTimeSlot(e.target.value)} className="w-[100px]" style={{ borderColor: 'var(--landing-border)' }} />
                    <Button type="submit" size="sm" className="hero-cta-primary" disabled={!newTaskTitle.trim()}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Gratitude — Demo style */}
            <Card className="shadow-lg feature-card-shadow" style={{ borderColor: 'var(--landing-border)', backgroundColor: 'var(--landing-accent)' }}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="h-7 w-7" style={{ color: 'var(--landing-primary)' }} />
                  <h3 className="text-2xl font-semibold" style={{ color: 'var(--landing-text)' }}>Gratitude Journal</h3>
                </div>
                <div className="space-y-4 mb-4">
                  {gratitudeEntries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="p-4 rounded-xl border" style={{ backgroundColor: 'white', borderColor: 'var(--landing-border)' }}>
                      <p style={{ color: 'var(--landing-text)' }}>{entry.content}</p>
                      <p className="text-xs mt-2 opacity-70" style={{ color: 'var(--landing-text)' }}>{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                  ))}
                </div>
                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const content = newGratitude.trim(); if (content) { addGratitudeForDate(todayIso, content); setNewGratitude(''); toast({ title: 'Saved', description: 'Gratitude saved.' }); } }}>
                  <Input placeholder="What are you grateful for today?" value={newGratitude} onChange={(e) => setNewGratitude(e.target.value)} style={{ borderColor: 'var(--landing-border)' }} className="flex-1 rounded-xl" />
                  <Button type="submit" size="sm" className="hero-cta-primary rounded-xl" disabled={!newGratitude.trim()}><PenLine className="h-4 w-4 mr-1" /> Add</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Dialog open={heroEditOpen} onOpenChange={setHeroEditOpen}>
        <DialogContent className="rounded-2xl max-w-sm" style={{ borderColor: 'var(--landing-border)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--landing-text)' }}>Home screen picture</DialogTitle>
          </DialogHeader>
          <p className="text-sm mb-3" style={{ color: 'var(--landing-text)', opacity: 0.9 }}>
            Use an image URL or upload a photo from your device. Leave blank to use the default.
          </p>
          <div className="space-y-3">
            <Label style={{ color: 'var(--landing-text)' }}>Image URL</Label>
            <Input
              value={heroInputUrl.startsWith('data:') || heroInputUrl === '[Uploaded image]' ? '' : heroInputUrl}
              onChange={(e) => setHeroInputUrl(e.target.value)}
              placeholder="https://... or upload below"
              className="rounded-xl border-[var(--landing-border)]"
            />
            <div className="relative">
              <Label style={{ color: 'var(--landing-text)' }}>Or upload from device</Label>
              <input
                ref={heroFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > MAX_HERO_IMAGE_BYTES) {
                    toast({ title: 'File too large', description: 'Please choose an image under 2MB.', variant: 'destructive' });
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    const dataUrl = reader.result as string;
                    setHeroInputUrl(dataUrl);
                    toast({ title: 'Image loaded', description: 'Click Save to set as home screen.' });
                  };
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full mt-1.5 rounded-xl"
                style={{ borderColor: 'var(--landing-border)' }}
                onClick={() => heroFileInputRef.current?.click()}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Choose image (max 2MB)
              </Button>
              {heroInputUrl.startsWith('data:') && (
                <p className="text-xs mt-1" style={{ color: 'var(--landing-primary)' }}>Image selected. Click Save to apply.</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setHeroEditOpen(false)} className="rounded-xl flex-1">Cancel</Button>
            <Button
              className="rounded-xl flex-1"
              onClick={() => {
                const urlToSave = heroInputUrl === '[Uploaded image]' ? dashboardHeroUrl : heroInputUrl;
                setDashboardHeroUrl(urlToSave.trim() || '');
                setHeroEditOpen(false);
                toast({ title: 'Saved', description: 'Home screen picture updated.' });
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OverviewCard({
  title,
  count,
  set,
  icon,
  summary,
}: {
  title: string;
  count?: number;
  set?: boolean;
  icon: React.ReactNode;
  summary: string;
}) {
  return (
    <Card className="overflow-hidden shadow-lg rounded-2xl feature-card-shadow" style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
      <CardHeader className="pb-2 flex flex-row items-center gap-2" style={{ backgroundColor: 'var(--landing-accent)' }}>
        {icon}
        <CardTitle className="text-base font-semibold" style={{ color: 'var(--landing-text)' }}>
          {title}
          {(count !== undefined || set !== undefined) && (
            <span className="ml-2 text-sm font-normal opacity-80">
              {count !== undefined ? count : set ? 'Set' : ''}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <p className="text-xs truncate" style={{ color: 'var(--landing-text)', opacity: 0.8 }}>
          {summary}
        </p>
      </CardContent>
    </Card>
  );
}

function TasksTab({
  selectedIso,
  todosOnDate,
  addTodo,
  toggleTodo,
  deleteTodo,
  toast,
}: {
  selectedIso: string;
  todosOnDate: ManifestationTodo[];
  addTodo: (t: Omit<ManifestationTodo, 'id' | 'createdAt'>) => void | Promise<void>;
  toggleTodo: (id: string) => void | Promise<void>;
  deleteTodo: (id: string) => void | Promise<void>;
  toast: ReturnType<typeof useToast>['toast'];
}) {
  const [title, setTitle] = useState('');
  const today = toISODate(new Date());

  const handleAdd = () => {
    if (!title.trim()) return;
    if (selectedIso < today) {
      toast({ title: 'Invalid date', description: 'Cannot add tasks to past dates.', variant: 'destructive' });
      return;
    }
    addTodo({
      title: title.trim(),
      completed: false,
      points: 5,
      scheduledDate: selectedIso,
    });
    setTitle('');
    toast({ title: 'Added', description: 'To-Do added for this day.' });
  };

  return (
    <Card className="overflow-hidden shadow-lg rounded-2xl feature-card-shadow" style={{ borderColor: 'var(--landing-border)', backgroundColor: 'white' }}>
      <CardHeader style={{ backgroundColor: 'var(--landing-accent)' }}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <ListTodo className="h-7 w-7" style={{ color: 'var(--landing-primary)' }} />
            <CardTitle className="text-xl font-semibold" style={{ color: 'var(--landing-text)' }}>To-Do for {selectedIso}</CardTitle>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--landing-primary)', color: 'white' }}>+5 pts each</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="rounded-xl border-[var(--landing-border)]"
          />
          <Button onClick={handleAdd} className="rounded-xl" disabled={!title.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        <ul className="space-y-2">
          {todosOnDate.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: 'var(--landing-border)', backgroundColor: 'var(--landing-bg)' }}
            >
              <button
                type="button"
                onClick={() => toggleTodo(t.id)}
                className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                style={{
                  borderColor: t.completed ? 'var(--landing-primary)' : 'var(--landing-border)',
                  backgroundColor: t.completed ? 'var(--landing-primary)' : 'transparent',
                }}
              >
                {t.completed && <Check className="h-3.5 w-3.5 text-white" />}
              </button>
              <span
                className={`flex-1 ${t.completed ? 'line-through opacity-70' : ''}`}
                style={{ color: 'var(--landing-text)' }}
              >
                {t.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg text-red-600"
                onClick={async () => {
                  await deleteTodo(t.id);
                  toast({ title: 'Removed', description: 'To-Do removed.' });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
        {todosOnDate.length === 0 && (
          <p className="text-sm py-4 text-center" style={{ color: 'var(--landing-text)', opacity: 0.7 }}>
            No To-Do for this day. Add one above.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function GratitudeDialog({
  open,
  onOpenChange,
  selectedIso,
  existing,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIso: string;
  existing: ManifestationGratitude | undefined;
  onSave: (content: string) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}) {
  const [content, setContent] = useState(existing?.content ?? '');

  React.useEffect(() => {
    if (open) setContent(existing?.content ?? '');
  }, [open, existing]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-2 max-w-md" style={{ borderColor: 'var(--landing-border)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--landing-text)' }}>
            Gratitude for {new Date(selectedIso + 'T12:00:00').toLocaleDateString('en-US')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Textarea
            placeholder="What are you grateful for today?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="rounded-xl border-[var(--landing-border)]"
          />
          <div className="flex gap-2">
            {onDelete && (
              <Button variant="outline" className="rounded-xl text-red-600 border-red-200" onClick={onDelete}>
                Remove
              </Button>
            )}
            <Button className="rounded-xl ml-auto" onClick={() => content.trim() && onSave(content.trim())} disabled={!content.trim()}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function JournalDialog({
  open,
  onOpenChange,
  selectedIso,
  existing,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIso: string;
  existing: ManifestationJournalEntry | undefined;
  onSave: (entry: { title: string; content: string; mood: 'great' | 'good' | 'okay' | 'tough'; imageUrl?: string }) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}) {
  const [title, setTitle] = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'tough'>(existing?.mood ?? 'good');

  React.useEffect(() => {
    if (open) {
      setTitle(existing?.title ?? '');
      setContent(existing?.content ?? '');
      setMood(existing?.mood ?? 'good');
    }
  }, [open, existing]);

  const handleSave = () => {
    if (!content.trim()) return;
    onSave({ title: title.trim(), content: content.trim(), mood });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-2 max-w-md" style={{ borderColor: 'var(--landing-border)' }}>
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--landing-text)' }}>
            Journal for {new Date(selectedIso + 'T12:00:00').toLocaleDateString('en-US')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border-[var(--landing-border)]"
          />
          <Textarea
            placeholder="Write your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="rounded-xl border-[var(--landing-border)]"
          />
          <div className="flex flex-wrap gap-2">
            {(['great', 'good', 'okay', 'tough'] as const).map((m) => (
              <Button
                key={m}
                variant={mood === m ? 'default' : 'outline'}
                size="sm"
                className="rounded-xl capitalize"
                onClick={() => setMood(m)}
              >
                {m}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            {onDelete && (
              <Button variant="outline" className="rounded-xl text-red-600 border-red-200" onClick={onDelete}>
                Remove
              </Button>
            )}
            <Button className="rounded-xl ml-auto" onClick={handleSave} disabled={!content.trim()}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
