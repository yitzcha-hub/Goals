import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useStorageMode } from '@/contexts/StorageModeContext';

const DEMO_KEY_EVENTS = 'goals_app_demo_calendar_events';

export type EventStatus = 'planned' | 'completed' | 'missed';

export interface CalendarEventData {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  color: string;
  location?: string;
  goalId?: string;
  goalTitle?: string;
  status: EventStatus;
}

function persistDemoEvents(events: CalendarEventData[]) {
  try {
    localStorage.setItem(
      DEMO_KEY_EVENTS,
      JSON.stringify(events.map((e) => ({
        ...e,
        startTime: e.startTime.toISOString(),
        endTime: e.endTime.toISOString(),
      })))
    );
  } catch {}
}

function loadDemoEvents(): CalendarEventData[] {
  try {
    const raw = localStorage.getItem(DEMO_KEY_EVENTS);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return (Array.isArray(data) ? data : []).map((e: any) => ({
      ...e,
      startTime: new Date(e.startTime),
      endTime: new Date(e.endTime),
    }));
  } catch {
    return [];
  }
}

export function useEvents() {
  const { user } = useAuth();
  const { isDemoMode } = useStorageMode();
  const [events, setEvents] = useState<CalendarEventData[]>([]);
  const [loading, setLoading] = useState(true);

  const useLocalStorageOnly = !user && isDemoMode;

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('id, title, description, start_time, end_time, color, location, goal_id, status')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      const mapped = (data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        startTime: new Date(r.start_time),
        endTime: r.end_time ? new Date(r.end_time) : new Date(r.start_time),
        color: r.color || '#2c9d73',
        location: r.location,
        goalId: r.goal_id,
        goalTitle: undefined,
        status: r.status || 'planned',
      }));
      setEvents(mapped);
    } catch (e) {
      console.error('Error loading events:', e);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAll();
      return;
    }
    if (useLocalStorageOnly) {
      setEvents(loadDemoEvents());
    } else {
      setEvents([]);
    }
    setLoading(false);
  }, [user, useLocalStorageOnly]);

  const addEvent = async (event: Omit<CalendarEventData, 'id'>) => {
    const newEvent: CalendarEventData = {
      ...event,
      id: crypto.randomUUID(),
    };

    if (useLocalStorageOnly) {
      setEvents((prev) => {
        const next = [...prev, newEvent].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        persistDemoEvents(next);
        return next;
      });
      return newEvent.id;
    }
    if (!user) return undefined;

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        goal_id: event.goalId || null,
        title: event.title,
        description: event.description,
        start_time: event.startTime.toISOString(),
        end_time: event.endTime.toISOString(),
        color: event.color,
        location: event.location,
        status: event.status || 'planned',
      })
      .select('id')
      .single();

    if (error) throw error;
    setEvents((prev) =>
      [...prev, { ...newEvent, id: data.id }].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    );
    return data.id;
  };

  const updateEvent = async (id: string, updates: Partial<Omit<CalendarEventData, 'id'>>) => {
    if (useLocalStorageOnly) {
      setEvents((prev) => {
        const next = prev.map((e) =>
          e.id === id
            ? {
                ...e,
                ...updates,
                startTime: updates.startTime ?? e.startTime,
                endTime: updates.endTime ?? e.endTime,
              }
            : e
        );
        persistDemoEvents(next);
        return next;
      });
      return;
    }
    if (!user) return;

    const dbUpdates: Record<string, any> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime.toISOString();
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime.toISOString();
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.goalId !== undefined) dbUpdates.goal_id = updates.goalId;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    if (Object.keys(dbUpdates).length === 0) return;

    const { error } = await supabase.from('calendar_events').update(dbUpdates).eq('id', id).eq('user_id', user.id);
    if (error) throw error;
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e)).sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    );
  };

  const deleteEvent = async (id: string) => {
    if (useLocalStorageOnly) {
      setEvents((prev) => {
        const next = prev.filter((e) => e.id !== id);
        persistDemoEvents(next);
        return next;
      });
      return;
    }
    if (!user) return;

    await supabase.from('calendar_events').delete().eq('id', id).eq('user_id', user.id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const setEventStatus = async (id: string, status: EventStatus) => {
    return updateEvent(id, { status });
  };

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    setEventStatus,
    refresh: loadAll,
  };
}
