import { useState, useEffect } from 'react';

/**
 * Online status only. App runs in database mode (Supabase);
 * no offline queue or IndexedDB sync.
 */
export const useOfflineStorage = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

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

  return {
    isOnline,
    isSyncing: false,
    pendingCount: 0,
    saveData: async () => {},
    sync: async () => ({ success: 0, failed: 0 }),
  };
};
