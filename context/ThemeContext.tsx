
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme, ThemeColors, ThemeMode } from '../types';

const LIGHT_COLORS: ThemeColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  primary: '#0f172a',
  secondary: '#64748b',
  border: '#e2e8f0',
};

const DARK_COLORS: ThemeColors = {
  background: '#0f172a', // Slate 900
  surface: '#1e293b',    // Slate 800
  primary: '#f8fafc',    // Slate 50
  secondary: '#94a3b8',  // Slate 400
  border: '#334155',     // Slate 700
};

interface ThemeContextType {
  theme: AppTheme;
  setThemeMode: (mode: ThemeMode) => void;
  setRadius: (radius: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [radius, setRadius] = useState(16);

  // Determine active colors based on mode
  const getActiveColors = (): ThemeColors => {
    if (mode === 'dark') {
      return DARK_COLORS;
    } else if (mode === 'system') {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isSystemDark ? DARK_COLORS : LIGHT_COLORS;
    }
    return LIGHT_COLORS;
  };

  // Update CSS Variables on root
  useEffect(() => {
    const colors = getActiveColors();
    const root = document.documentElement;

    root.style.setProperty('--color-bg-app', colors.background);
    root.style.setProperty('--color-bg-subtle', mode === 'dark' ? '#334155' : '#f1f5f9'); // Slightly diff for dark mode hover
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-text-strong', colors.primary);
    root.style.setProperty('--color-text-main', colors.primary); // Mapping both for simplicity in this system
    root.style.setProperty('--color-text-muted', colors.secondary);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--radius', `${radius}px`);

  }, [mode, radius]);

  const value = {
    theme: {
      mode,
      colors: getActiveColors(),
      radius,
      density: 'standard' as const,
    },
    setThemeMode: setMode,
    setRadius
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
