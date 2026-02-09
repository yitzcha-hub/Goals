import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  CalendarClock,
  ListTodo,
  PenLine,
} from 'lucide-react';
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

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function isSameDay(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

export default function Dashboard() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const selectedIso = toISODate(selectedDate);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventData | undefined>();
  const [gratitudeDialogOpen, setGratitudeDialogOpen] = useState(false);
  const [journalDialogOpen, setJournalDialogOpen] = useState(false);
  const [slotClickTime, setSlotClickTime] = useState<string | undefined>();

  const {
    goals,
    todos,
    gratitudeEntries,
    journalEntries,
    addGoal,
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

  return (
    <div className="min-h-screen landing" style={{ backgroundColor: 'var(--landing-bg)', color: 'var(--landing-text)' }}>
      {/* Hero — full width, modern style, point animation */}
      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: '240px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      >
        <div className="absolute inset-0">
          <img src={dashboardHeroImg} alt="" className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(160deg, rgba(15,23,42,0.75) 0%, rgba(26,107,79,0.82) 40%, rgba(44,157,115,0.78) 100%)',
            }}
          />
        </div>
        <HeroFloatingCircles variant="dark" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Your day at a glance
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/90 max-w-2xl leading-relaxed">
              Choose any date to view your 24-hour timeline: scheduled events, to-dos, gratitude, and journal. Use the tabs below for Overview, Goals, Tasks, Gratitude, Journals, and Feedback—all in one dashboard.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <Label htmlFor="dashboard-date" className="text-white/95 font-semibold text-sm sr-only sm:not-sr-only">
                  Date
                </Label>
                <Input
                  id="dashboard-date"
                  type="date"
                  value={selectedIso}
                  onChange={(e) => setSelectedDate(new Date(e.target.value + 'T12:00:00'))}
                  className="max-w-[180px] bg-white/95 border-0 text-[var(--landing-primary)] font-semibold rounded-xl h-11"
                />
              </div>
                <Button
                  onClick={openNewSchedule}
                  className="hero-cta-primary font-semibold rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New schedule
                </Button>
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 text-center min-w-[90px]">
                <p className="text-2xl font-bold text-white">{stats.totalGoals}</p>
                <p className="text-xs text-white/90">Goals</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 text-center min-w-[90px]">
                <p className="text-2xl font-bold text-white">{stats.scheduleToday}</p>
                <p className="text-xs text-white/90">Scheduled</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 text-center min-w-[90px]">
                <p className="text-2xl font-bold text-white">{stats.todosToday}</p>
                <p className="text-xs text-white/90">To-Do</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <TrialBanner />
        <Tabs defaultValue="overview" className="space-y-6 mt-6">
          <TabsList
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-2 rounded-2xl border shadow-sm w-full"
            style={{ backgroundColor: 'var(--landing-accent)', borderColor: 'var(--landing-border)' }}
          >
            <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-[var(--landing-primary)] py-3">
              <CalendarClock className="h-4 w-4 mr-2 hidden sm:inline" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="goals" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-[var(--landing-primary)] py-3">
              <Target className="h-4 w-4 mr-2 hidden sm:inline" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="tasks" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-[var(--landing-primary)] py-3">
              <ListTodo className="h-4 w-4 mr-2 hidden sm:inline" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="gratitude" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-[var(--landing-primary)] py-3">
              <Heart className="h-4 w-4 mr-2 hidden sm:inline" />
              Gratitude
            </TabsTrigger>
            <TabsTrigger value="journals" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-[var(--landing-primary)] py-3">
              <BookOpen className="h-4 w-4 mr-2 hidden sm:inline" />
              Journals
            </TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-[var(--landing-primary)] py-3">
              <Sparkles className="h-4 w-4 mr-2 hidden sm:inline" />
              Feedback
            </TabsTrigger>
          </TabsList>

          {/* Overview: 24h timeline + cards */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden" style={{ borderColor: 'var(--landing-border)' }}>
              <CardHeader className="pb-3" style={{ backgroundColor: 'var(--landing-accent)' }}>
                <CardTitle className="flex items-center gap-2" style={{ color: 'var(--landing-text)' }}>
                  <Clock className="h-5 w-5" style={{ color: 'var(--landing-primary)' }} />
                  {dateLabel} — 24h timeline
                </CardTitle>
                {/* Day markers: To-Do, Gratitude, Journal — pill row */}
                {(todosOnDate.length > 0 || gratitudeForDate || journalForDate) && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {todosOnDate.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--landing-bg)', color: 'var(--landing-text)', border: '1px solid var(--landing-border)' }}>
                        <ListTodo className="h-3.5 w-3.5" style={{ color: 'var(--landing-primary)' }} />
                        {todosOnDate.length} To-Do{todosOnDate.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {gratitudeForDate && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(236, 72, 153, 0.12)', color: 'var(--landing-text)', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                        <Heart className="h-3.5 w-3.5" style={{ color: '#ec4899' }} />
                        Gratitude
                      </span>
                    )}
                    {journalForDate && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--landing-text)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                        <BookOpen className="h-3.5 w-3.5" style={{ color: '#3b82f6' }} />
                        Journal
                      </span>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <DayTimelineView
                  events={dayEvents}
                  showCurrentTime={selectedIso === toISODate(new Date())}
                  pxPerMinute={1}
                  eventColors={eventColors}
                  onEventClick={(id) => {
                    const ev = eventsOnDate.find((e) => e.id === id);
                    if (ev) {
                      setSlotClickTime(undefined);
                      setEditingEvent(ev);
                      setEventDialogOpen(true);
                    }
                  }}
                  onEventUpdate={handleEventTimeUpdate}
                  onSlotClick={handleSlotClick}
                  selectedEventId={editingEvent?.id}
                  maxHeight="min(2880px, 70vh)"
                  emptyMessage="No schedule for this day"
                />
              </CardContent>
            </Card>

            {/* Completion timeline: to-dos completed / gratitude & journal created on selected date */}
            {(() => {
              type CompletionItem = { type: 'todo'; time: string; title: string; id: string } | { type: 'gratitude'; time: string; content: string; id: string } | { type: 'journal'; time: string; title: string; id: string };
              const items: CompletionItem[] = [];
              todos.forEach((t) => {
                if (!t.completed || !t.completedAt) return;
                const d = t.completedAt.split('T')[0];
                if (d !== selectedIso) return;
                items.push({ type: 'todo', time: t.completedAt, title: t.title, id: t.id });
              });
              if (gratitudeForDate && gratitudeForDate.date === selectedIso && gratitudeForDate.createdAt) {
                items.push({ type: 'gratitude', time: gratitudeForDate.createdAt, content: gratitudeForDate.content.slice(0, 60) + (gratitudeForDate.content.length > 60 ? '…' : ''), id: gratitudeForDate.id });
              }
              if (journalForDate && journalForDate.date === selectedIso && journalForDate.createdAt) {
                items.push({ type: 'journal', time: journalForDate.createdAt, title: journalForDate.title || 'Journal', id: journalForDate.id });
              }
              items.sort((a, b) => a.time.localeCompare(b.time));
              if (items.length === 0) return null;
              return (
                <Card className="border-0 shadow-xl rounded-2xl overflow-hidden" style={{ borderColor: 'var(--landing-border)' }}>
                  <CardHeader className="pb-3" style={{ backgroundColor: 'var(--landing-accent)' }}>
                    <CardTitle className="flex items-center gap-2" style={{ color: 'var(--landing-text)' }}>
                      <Check className="h-5 w-5" style={{ color: 'var(--landing-primary)' }} />
                      Completion timeline — {dateLabel}
                    </CardTitle>
                    <p className="text-sm mt-1" style={{ color: 'var(--landing-text)', opacity: 0.8 }}>
                      When you completed tasks and added gratitude or journal for this day
                    </p>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-3">
                      {items.map((item) => {
                        const timeStr = new Date(item.time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                        return (
                          <li key={`${item.type}-${item.id}`} className="flex items-start gap-3">
                            <span className="text-xs font-medium shrink-0 mt-0.5 w-14" style={{ color: 'var(--landing-text)', opacity: 0.8 }}>{timeStr}</span>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium shrink-0" style={{ backgroundColor: 'var(--landing-bg)', color: 'var(--landing-text)', border: '1px solid var(--landing-border)' }}>
                              {item.type === 'todo' && <ListTodo className="h-3.5 w-3.5" style={{ color: 'var(--landing-primary)' }} />}
                              {item.type === 'gratitude' && <Heart className="h-3.5 w-3.5" style={{ color: '#ec4899' }} />}
                              {item.type === 'journal' && <BookOpen className="h-3.5 w-3.5" style={{ color: '#3b82f6' }} />}
                              {item.type === 'todo' ? 'To-Do' : item.type === 'gratitude' ? 'Gratitude' : 'Journal'}
                            </span>
                            <span className="text-sm min-w-0" style={{ color: 'var(--landing-text)' }}>
                              {item.type === 'todo' ? item.title : item.type === 'gratitude' ? item.content : item.title}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <OverviewCard
                title="Goals"
                count={goals.length}
                icon={<Target className="h-5 w-5" style={{ color: 'var(--landing-primary)' }} />}
                summary={goals.filter((g) => g.progress === 10).length + ' completed'}
              />
              <OverviewCard
                title="To-Do"
                count={todosOnDate.length}
                icon={<ListTodo className="h-5 w-5" style={{ color: 'var(--landing-primary)' }} />}
                summary={todosOnDate.filter((t) => t.completed).length + ' done today'}
              />
              <OverviewCard
                title="Gratitude"
                set={!!gratitudeForDate}
                icon={<Heart className="h-5 w-5" style={{ color: 'var(--landing-primary)' }} />}
                summary={gratitudeForDate ? gratitudeForDate.content.slice(0, 40) + (gratitudeForDate.content.length > 40 ? '…' : '') : 'Not set'}
              />
              <OverviewCard
                title="Journal"
                set={!!journalForDate}
                icon={<BookOpen className="h-5 w-5" style={{ color: 'var(--landing-primary)' }} />}
                summary={journalForDate ? (journalForDate.title || journalForDate.content.slice(0, 40)) + (journalForDate.content.length > 40 ? '…' : '') : 'Not set'}
              />
              <OverviewCard
                title="Feedback"
                icon={<Sparkles className="h-5 w-5" style={{ color: 'var(--landing-primary)' }} />}
                summary="AI insights on your progress"
              />
            </div>
          </TabsContent>

          {/* Goals tab: schedule for selected date, CRUD with goal select */}
          <TabsContent value="goals" className="space-y-4">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden" style={{ borderColor: 'var(--landing-border)' }}>
              <CardHeader className="flex flex-row items-center justify-between" style={{ backgroundColor: 'var(--landing-accent)' }}>
                <CardTitle style={{ color: 'var(--landing-text)' }}>Schedule for {dateLabel}</CardTitle>
                <Button onClick={openNewSchedule} size="sm" className="rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  New schedule
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                {eventsOnDate.length === 0 ? (
                  <p className="text-sm py-6 text-center" style={{ color: 'var(--landing-text)', opacity: 0.8 }}>
                    No schedule for this day. Add a commitment linked to a goal.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {eventsOnDate.map((ev) => (
                      <li
                        key={ev.id}
                        className="flex items-center justify-between gap-2 p-3 rounded-xl border"
                        style={{ borderColor: 'var(--landing-border)', backgroundColor: 'var(--landing-bg)' }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate" style={{ color: 'var(--landing-text)' }}>
                            {ev.title}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--landing-text)', opacity: 0.7 }}>
                            {ev.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} –{' '}
                            {ev.endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            {ev.goalId && goals.find((g) => g.id === ev.goalId) && (
                              <> · {goals.find((g) => g.id === ev.goalId)?.title}</>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-lg"
                            onClick={() => {
                              setEditingEvent(ev);
                              setEventDialogOpen(true);
                            }}
                          >
                            <PenLine className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-lg text-red-600"
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks tab: CRUD To-Do for selected date */}
          <TabsContent value="tasks" className="space-y-4">
            <TasksTab
              selectedIso={selectedIso}
              todosOnDate={todosOnDate}
              addTodo={addTodo}
              toggleTodo={toggleTodo}
              deleteTodo={deleteTodo}
              toast={toast}
            />
          </TabsContent>

          {/* Gratitude tab: max 1 for selected date */}
          <TabsContent value="gratitude" className="space-y-4">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden" style={{ borderColor: 'var(--landing-border)' }}>
              <CardHeader className="flex flex-row items-center justify-between" style={{ backgroundColor: 'var(--landing-accent)' }}>
                <CardTitle style={{ color: 'var(--landing-text)' }}>Gratitude for {dateLabel}</CardTitle>
                <Button
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setGratitudeDialogOpen(true)}
                >
                  {gratitudeForDate ? 'Edit' : 'Add'}
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                {gratitudeForDate ? (
                  <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--landing-text)' }}>
                    {gratitudeForDate.content}
                  </p>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--landing-text)', opacity: 0.7 }}>
                    One gratitude per day. Set yours for this date.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Journals tab: max 1 for selected date */}
          <TabsContent value="journals" className="space-y-4">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden" style={{ borderColor: 'var(--landing-border)' }}>
              <CardHeader className="flex flex-row items-center justify-between" style={{ backgroundColor: 'var(--landing-accent)' }}>
                <CardTitle style={{ color: 'var(--landing-text)' }}>Journal for {dateLabel}</CardTitle>
                <Button size="sm" className="rounded-xl" onClick={() => setJournalDialogOpen(true)}>
                  {journalForDate ? 'Edit' : 'Add'}
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                {journalForDate ? (
                  <div>
                    {journalForDate.title && (
                      <p className="font-medium text-sm mb-1" style={{ color: 'var(--landing-text)' }}>
                        {journalForDate.title}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--landing-text)' }}>
                      {journalForDate.content}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--landing-text)', opacity: 0.7 }}>
                    One journal entry per day. Write for this date.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback tab */}
          <TabsContent value="feedback" className="space-y-4">
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden" style={{ borderColor: 'var(--landing-border)' }}>
              <CardContent className="p-8 text-center">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                  style={{ backgroundColor: 'var(--landing-accent)' }}
                >
                  <Sparkles className="h-8 w-8" style={{ color: 'var(--landing-primary)' }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--landing-text)' }}>
                  AI Feedback
                </h3>
                <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--landing-text)', opacity: 0.8 }}>
                  Get insights on your goals, check-ins, and patterns. Feedback will appear here once you have enough activity.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <EventDialog
          open={eventDialogOpen}
          onOpenChange={(open) => {
            setEventDialogOpen(open);
            if (!open) {
              setEditingEvent(undefined);
              setSlotClickTime(undefined);
            }
          }}
          onSave={handleSaveEvent}
          event={editingEvent}
          selectedDate={selectedDate}
          selectedTime={editingEvent ? undefined : slotClickTime}
          goals={goals}
        />

        <GratitudeDialog
          open={gratitudeDialogOpen}
          onOpenChange={setGratitudeDialogOpen}
          selectedIso={selectedIso}
          existing={gratitudeForDate}
          onSave={async (content) => {
            if (gratitudeForDate) await updateGratitude(gratitudeForDate.id, content);
            else await addGratitudeForDate(selectedIso, content);
            setGratitudeDialogOpen(false);
            toast({ title: gratitudeForDate ? 'Updated' : 'Saved', description: 'Gratitude saved.' });
          }}
          onDelete={gratitudeForDate ? async () => {
            await deleteGratitude(gratitudeForDate.id);
            setGratitudeDialogOpen(false);
            toast({ title: 'Removed', description: 'Gratitude removed.' });
          } : undefined}
        />

        <JournalDialog
          open={journalDialogOpen}
          onOpenChange={setJournalDialogOpen}
          selectedIso={selectedIso}
          existing={journalForDate}
          onSave={async (entry) => {
            if (journalForDate) await updateJournalEntry(journalForDate.id, entry);
            else await addJournalEntry({ ...entry, date: selectedIso });
            setJournalDialogOpen(false);
            toast({ title: journalForDate ? 'Updated' : 'Saved', description: 'Journal saved.' });
          }}
          onDelete={journalForDate ? async () => {
            await deleteJournalEntry(journalForDate.id);
            setJournalDialogOpen(false);
            toast({ title: 'Removed', description: 'Journal removed.' });
          } : undefined}
        />
      </div>
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
    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden" style={{ borderColor: 'var(--landing-border)' }}>
      <CardHeader className="pb-2 flex flex-row items-center gap-2" style={{ backgroundColor: 'var(--landing-accent)' }}>
        {icon}
        <CardTitle className="text-base" style={{ color: 'var(--landing-text)' }}>
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
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden" style={{ borderColor: 'var(--landing-border)' }}>
      <CardHeader style={{ backgroundColor: 'var(--landing-accent)' }}>
        <CardTitle style={{ color: 'var(--landing-text)' }}>To-Do for {selectedIso}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="New task..."
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
