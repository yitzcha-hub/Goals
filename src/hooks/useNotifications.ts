import { useState, useEffect } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setPermission(Notification.permission);
    loadUnreadCount();
  }, []);

  useEffect(() => {
    const listener = onMessageListener();
    listener.then((payload: any) => {
      toast.info(payload.notification?.title || 'New notification', {
        description: payload.notification?.body
      });
      setUnreadCount(prev => prev + 1);
    });
  }, []);

  const loadUnreadCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { count } = await supabase
      .from('reminders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .lte('reminder_time', new Date().toISOString());

    setUnreadCount(count || 0);
  };

  const requestPermission = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setFcmToken(token);
      setPermission('granted');
      await saveFCMToken(token);
      toast.success('Notifications enabled!');
    } else {
      toast.error('Permission denied');
    }
  };

  const saveFCMToken = async (token: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('reminder_preferences')
      .upsert({
        user_id: user.id,
        fcm_token: token,
        push_enabled: true
      });
  };

  return {
    permission,
    fcmToken,
    unreadCount,
    requestPermission,
    loadUnreadCount
  };
}
