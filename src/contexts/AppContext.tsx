import React from 'react';

// STATE
export interface AppContextState {
  showLog: boolean;
  setShowLog: React.Dispatch<React.SetStateAction<boolean>> | null;
  logStyle: 'default' | 'compact';
  remoteVersion?: string | null;
  isOutdated: boolean;
};

export const APP_CONTEXT_INITIAL_STATE: AppContextState = {
  showLog: false,
  setShowLog: null,
  logStyle: 'default',
  remoteVersion: null,
  isOutdated: false,
};

export const AppContext = React.createContext(APP_CONTEXT_INITIAL_STATE);
