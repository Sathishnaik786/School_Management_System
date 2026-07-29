import React, { createContext, useContext, useEffect } from 'react';
import { ConnectivityService } from '../core/network/connectivity';
import { SyncManager } from '../core/network/sync-manager';

const NetworkContext = createContext({
  isOnline: true,
});

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Initial network connectivity assumption
    ConnectivityService.setNetworkStatus(true);
    SyncManager.processOfflineQueue().catch(() => {});
  }, []);

  return <NetworkContext.Provider value={{ isOnline: true }}>{children}</NetworkContext.Provider>;
};

export const useNetworkContext = () => useContext(NetworkContext);
