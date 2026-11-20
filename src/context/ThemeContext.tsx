/**
 * G Pay.nu - Theme Context
 * Manages reactive Light & Dark mode themes with persistent SQLite preference.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { LightColors, DarkColors, ThemeColors } from '@/theme/colors';
import { getSetting, setSetting } from '@/services/database';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [isReady, setIsReady] = useState(false);

  // Load saved theme preference on mount (defaulting to dark to match reference screenshots)
  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await getSetting('theme_mode', 'dark');
        if (saved === 'dark' || saved === 'light' || saved === 'system') {
          setThemeModeState(saved);
        }
      } catch (err) {
        console.warn('Failed to load theme preference:', err);
      } finally {
        setIsReady(true);
      }
    }
    loadTheme();
  }, []);

  const isDark =
    themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  const colors = isDark ? DarkColors : LightColors;

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await setSetting('theme_mode', mode);
    } catch (err) {
      console.warn('Failed to persist theme preference:', err);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next = isDark ? 'light' : 'dark';
    setThemeMode(next);
  }, [isDark, setThemeMode]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        colors,
        toggleTheme,
        setThemeMode,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    // Graceful fallback to light colors if used outside provider
    return {
      themeMode: 'light',
      isDark: false,
      colors: LightColors,
      toggleTheme: () => {},
      setThemeMode: async () => {},
    };
  }
  return context;
}
