import React, { createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * When user is logged in: always use database (never localStorage for app data).
 * When user is NOT logged in and on /demo: use localStorage only (demo experience).
 */
interface StorageModeContextType {
  isDemoMode: boolean;
}

const StorageModeContext = createContext<StorageModeContextType | undefined>(undefined);

export const useStorageMode = () => {
  const context = useContext(StorageModeContext);
  if (context === undefined) {
    throw new Error('useStorageMode must be used within StorageModeProvider');
  }
  return context;
};

export const StorageModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isDemoMode = location.pathname === '/demo';

  return (
    <StorageModeContext.Provider value={{ isDemoMode }}>
      {children}
    </StorageModeContext.Provider>
  );
};
