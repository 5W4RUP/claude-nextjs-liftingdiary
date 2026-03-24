'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'light-blue' | 'light-green' | 'light-purple'
           | 'dark-blue' | 'dark-green' | 'dark-purple';
type Mode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  mode: Mode;
  toggleMode: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_COLORS: Record<Theme, { primary: string; secondary: string }> = {
  'light': { primary: '#3b82f6', secondary: '#6b7280' },
  'light-blue': { primary: '#3b82f6', secondary: '#6b7280' },
  'light-green': { primary: '#10b981', secondary: '#6b7280' },
  'light-purple': { primary: '#a855f7', secondary: '#6b7280' },
  'dark': { primary: '#60a5fa', secondary: '#d1d5db' },
  'dark-blue': { primary: '#60a5fa', secondary: '#d1d5db' },
  'dark-green': { primary: '#34d399', secondary: '#d1d5db' },
  'dark-purple': { primary: '#d8b4fe', secondary: '#d1d5db' },
};

function ThemeProviderContent({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mode, setModeState] = useState<Mode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage and system preference
    const saved = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const initialTheme = saved || (prefersDark ? 'dark' : 'light');
    const initialMode = initialTheme.startsWith('dark') ? 'dark' : 'light';

    setThemeState(initialTheme);
    setModeState(initialMode);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    const isLightMode = !newTheme.startsWith('dark');

    // Apply dark class
    if (!isLightMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Apply theme colors
    const colors = THEME_COLORS[newTheme];
    html.style.setProperty('--primary', colors.primary);
    html.style.setProperty('--secondary', colors.secondary);

    // Store preference
    localStorage.setItem('theme', newTheme);
  };

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    const currentAccent = theme.replace(/^(light|dark)-?/, '');
    const newTheme = (newMode === 'dark'
      ? `dark${currentAccent ? `-${currentAccent}` : ''}`
      : `light${currentAccent ? `-${currentAccent}` : ''}`) as Theme;

    setModeState(newMode);
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    const newMode = newTheme.startsWith('dark') ? 'dark' : 'light';
    setThemeState(newTheme);
    setModeState(newMode);
    applyTheme(newTheme);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleMode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeProviderContent>{children}</ThemeProviderContent>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
