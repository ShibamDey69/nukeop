import React, { createContext, useContext, useState } from 'react';

export type ScreenName = 'Home' | 'Search' | 'Library' | 'NowPlaying' | 'LocalSongs' | 'Preferences';

interface NavigationState {
  currentScreen: ScreenName;
  params?: any;
}

interface NavigationContextType {
  currentScreen: ScreenName;
  params?: any;
  navigate: (screen: ScreenName, params?: any) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<NavigationState[]>([{ currentScreen: 'Home' }]);

  const current = history[history.length - 1];

  const navigate = (screen: ScreenName, params?: any) => {
    setHistory(prev => [...prev, { currentScreen: screen, params }]);
  };

  const goBack = () => {
    setHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  return (
    <NavigationContext.Provider value={{ 
      currentScreen: current.currentScreen, 
      params: current.params, 
      navigate, 
      goBack 
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useAppNavigation = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useAppNavigation must be used within NavigationProvider');
  return ctx;
};
