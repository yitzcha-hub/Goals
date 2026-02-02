import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface ReminderPreferences {
  id?: string;
  user_id?: string;
  goal_deadline_enabled: boolean;
  goal_deadline_timing: number;
  habit_checkin_enabled: boolean;
  habit_checkin_time: string;
  family_activity_enabled: boolean;
  family_activity_timing: number;
  smart_reminders_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  email_address: string;
}

export interface Reminder {
  id?: string;
  user_id?: string;
  type: 'goal_deadline' | 'habit_checkin' | 'family_activity' | 'smart_reminder';
  entity_id: string;
  entity_type: 'goal' | 'habit' | 'family_goal' | 'family_activity';
  reminder_time: string;
  channels: string[];
  frequency?: string;
  message: string;
  is_sent?: boolean;
}

export const useReminders = () => {
  const [preferences, setPreferences] = useState<ReminderPreferences | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
    loadReminders();
  }, []);

  const loadPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('reminder_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setPreferences(data);
    } else if (!error) {
      const defaultPrefs: ReminderPreferences = {
        goal_deadline_enabled: true,
        goal_deadline_timing: 24,
        habit_checkin_enabled: true,
        habit_checkin_time: '09:00:00',
        family_activity_enabled: true,
        family_activity_timing: 2,
        smart_reminders_enabled: true,
        email_enabled: false,
        push_enabled: true,
        email_address: user.email || ''
      };
      setPreferences(defaultPrefs);
    }
    setLoading(false);
  };

  const loadReminders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_sent', false)
      .order('reminder_time', { ascending: true });

    if (data) setReminders(data);
  };

  const savePreferences = async (prefs: ReminderPreferences) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('reminder_preferences')
      .upsert({ ...prefs, user_id: user.id });

    if (!error) {
      setPreferences(prefs);
    }
  };

  const createReminder = async (reminder: Reminder) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('reminders')
      .insert({ ...reminder, user_id: user.id })
      .select()
      .single();

    if (data) {
      setReminders([...reminders, data]);
      
      // Get FCM token from preferences
      const { data: prefs } = await supabase
        .from('reminder_preferences')
        .select('fcm_token')
        .eq('user_id', user.id)
        .maybeSingle();
      
      // Schedule push notification if enabled
      if (prefs?.fcm_token && preferences?.push_enabled) {
        await supabase.functions.invoke('send-reminders', {
          body: {
            type: reminder.type,
            userId: user.id,
            message: reminder.message,
            channels: reminder.channels,
            email: preferences?.email_address,
            fcmToken: prefs.fcm_token,
            goalId: reminder.entity_type === 'goal' ? reminder.entity_id : null,
            habitId: reminder.entity_type === 'habit' ? reminder.entity_id : null
          }
        });
      }
    }
  };


  const deleteReminder = async (id: string) => {
    await supabase.from('reminders').delete().eq('id', id);
    setReminders(reminders.filter(r => r.id !== id));
  };

  return {
    preferences,
    reminders,
    loading,
    savePreferences,
    createReminder,
    deleteReminder,
    loadReminders
  };
};
