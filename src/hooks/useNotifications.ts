import { useState, useEffect } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    try {
      setPermission(typeof Notification !== 'undefined' ? Notification.permission : 'default');
    } catch {
      setPermission('default');
    }
    loadUnreadCount();
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = onMessageListener((payload) => {
        toast.info(payload?.notification?.title || 'New notification', {
          description: payload?.notification?.body,
        });
        setUnreadCount((prev) => prev + 1);
      });
    } catch (e) {
      console.warn('Notifications: foreground listener unavailable', e);
    }
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const loadUnreadCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { count } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_sent', false)
        .lte('reminder_time', new Date().toISOString());

      setUnreadCount(count ?? 0);
    } catch {
      setUnreadCount(0);
    }
  };

  const requestPermission = async (): Promise<string | null> => {
    const token = await requestNotificationPermission();
    if (token) {
      setFcmToken(token);
      setPermission('granted');
      await saveFCMToken(token);
      toast.success('Notifications enabled!');
      return token;
    }
    toast.error('Permission denied');
    return null;
  };

  const saveFCMToken = async (token: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('reminder_preferences')
      .upsert(
        {
          user_id: user.id,
          fcm_token: token,
          push_enabled: true,
          goal_deadline_enabled: true,
          goal_deadline_timing: 24,
          habit_checkin_enabled: true,
          habit_checkin_time: '09:00:00',
          family_activity_enabled: true,
          family_activity_timing: 2,
          smart_reminders_enabled: true,
          email_enabled: false,
          email_address: user.email || '',
        },
        { onConflict: 'user_id' }
      );
  };

  return {
    permission,
    fcmToken,
    unreadCount,
    requestPermission,
    loadUnreadCount
  };
}
