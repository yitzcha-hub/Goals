import { useState, useEffect } from 'react';
import { saveOfflineData, getOfflineData, OfflineData } from '@/lib/indexedDB';
import { syncOfflineData } from '@/lib/syncManager';

export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const updatePendingCount = async () => {
      const data = await getOfflineData();
      setPendingCount(data.filter(item => !item.synced).length);
    };
    updatePendingCount();
  }, [isOnline]);

  const saveData = async (type: OfflineData['type'], data: any) => {
    const offlineData: OfflineData = {
      id: data.id || crypto.randomUUID(),
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };
    await saveOfflineData(offlineData);
  };

  const sync = async () => {
    if (!isOnline) return { success: 0, failed: 0 };
    setIsSyncing(true);
    const result = await syncOfflineData();
    setIsSyncing(false);
    setPendingCount(result.failed);
    return result;
  };

  return { isOnline, isSyncing, pendingCount, saveData, sync };
};
