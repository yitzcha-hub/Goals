import { getOfflineData, saveOfflineData } from './indexedDB';
import { supabase } from './supabase';

export const syncOfflineData = async (): Promise<{ success: number; failed: number }> => {
  const offlineData = await getOfflineData();
  const unsyncedData = offlineData.filter(item => !item.synced);
  
  let success = 0;
  let failed = 0;
  
  for (const item of unsyncedData) {
    try {
      const tableName = item.type === 'goal' ? 'goals' : 
                       item.type === 'habit' ? 'habits' :
                       item.type === 'task' ? 'tasks' : 'journal_entries';
      
      const { error } = await supabase
        .from(tableName)
        .upsert(item.data);
      
      if (!error) {
        await saveOfflineData({ ...item, synced: true });
        success++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
    }
  }
  
  return { success, failed };
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const scheduleNotification = (title: string, body: string, timestamp: number) => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, {
        body,
        icon: '/placeholder.svg',
        badge: '/placeholder.svg',
        tag: `goal-reminder-${timestamp}`,
        requireInteraction: false,
        timestamp
      });
    });
  }
};
