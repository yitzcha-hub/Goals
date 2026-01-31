// IndexedDB utilities for offline storage
const DB_NAME = 'depo-goal-tracker';
const DB_VERSION = 1;

export interface OfflineData {
  id: string;
  type: 'goal' | 'habit' | 'task' | 'journal' | 'photo';
  data: any;
  timestamp: number;
  synced: boolean;
}

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('offline-data')) {
        const store = db.createObjectStore('offline-data', { keyPath: 'id' });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('synced', 'synced', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'id' });
      }
    };
  });
};

export const saveOfflineData = async (data: OfflineData): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction('offline-data', 'readwrite');
  const store = tx.objectStore('offline-data');
  store.put(data);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getOfflineData = async (): Promise<OfflineData[]> => {
  const db = await openDB();
  const tx = db.transaction('offline-data', 'readonly');
  const store = tx.objectStore('offline-data');
  const request = store.getAll();
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const savePhoto = async (id: string, blob: Blob): Promise<void> => {
  const db = await openDB();
  const tx = db.transaction('photos', 'readwrite');
  const store = tx.objectStore('photos');
  store.put({ id, blob, timestamp: Date.now() });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const getPhoto = async (id: string): Promise<Blob | null> => {
  const db = await openDB();
  const tx = db.transaction('photos', 'readonly');
  const store = tx.objectStore('photos');
  const request = store.get(id);
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result?.blob || null);
    request.onerror = () => reject(request.error);
  });
};
