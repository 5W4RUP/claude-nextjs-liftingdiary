'use client';

import { useTheme } from './theme-provider';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Palette } from 'lucide-react';
import { useState } from 'react';

export function ThemeToggle() {
  const { theme, mode, toggleMode, setTheme } = useTheme();
  const [showPalette, setShowPalette] = useState(false);

  const themes = [
    { id: 'light', label: 'Light', color: 'bg-white' },
    { id: 'light-blue', label: 'Light Blue', color: 'bg-blue-100' },
    { id: 'light-green', label: 'Light Green', color: 'bg-green-100' },
    { id: 'light-purple', label: 'Light Purple', color: 'bg-purple-100' },
    { id: 'dark', label: 'Dark', color: 'bg-slate-900' },
    { id: 'dark-blue', label: 'Dark Blue', color: 'bg-blue-900' },
    { id: 'dark-green', label: 'Dark Green', color: 'bg-green-900' },
    { id: 'dark-purple', label: 'Dark Purple', color: 'bg-purple-900' },
  ];

  const currentModeThemes = themes.filter(t =>
    (mode === 'light' && !t.id.startsWith('dark')) ||
    (mode === 'dark' && t.id.startsWith('dark'))
  );

  return (
    <div className="flex gap-2 items-center">
      {/* Mode Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleMode}
        aria-label="Toggle dark mode"
        title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {mode === 'light' ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>

      {/* Theme Palette Popover */}
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowPalette(!showPalette)}
          aria-label="Choose theme"
          title="Choose theme color"
        >
          <Palette className="h-4 w-4" />
        </Button>

        {showPalette && (
          <div className="absolute right-0 mt-2 p-3 bg-background border border-border rounded-lg shadow-lg z-50 w-48">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              {mode === 'light' ? 'Light Themes' : 'Dark Themes'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {currentModeThemes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id as any);
                    setShowPalette(false);
                  }}
                  className={`
                    p-2 rounded-lg text-xs font-medium transition-all
                    ${theme === t.id
                      ? 'ring-2 ring-primary border-primary'
                      : 'border border-border hover:border-primary'
                    }
                  `}
                  title={t.label}
                >
                  <div className={`${t.color} h-6 rounded mb-1`} />
                  <span className="text-xs">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
