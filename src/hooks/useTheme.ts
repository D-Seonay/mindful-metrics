import { useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'blue' | 'green' | 'orange' | 'purple';
type Mode = 'light' | 'dark';

export function useTheme() {
  const [theme, _setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('color-theme') as Theme) || 'light';
    }
    return 'light';
  });

  const [mode, _setMode] = useState<Mode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme-mode') as Mode;
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Set dark/light mode
    root.classList.remove('light', 'dark');
    root.classList.add(mode);

    // Set color theme
    root.setAttribute('data-theme', theme);
    
    localStorage.setItem('color-theme', theme);
    localStorage.setItem('theme-mode', mode);
  }, [theme, mode]);
  
  const setTheme = useCallback((newTheme: Theme) => {
    _setTheme(newTheme);
  }, []);

  const setMode = useCallback((newMode: Mode) => {
    _setMode(newMode);
  }, []);

  const toggleMode = () => {
    _setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, setTheme, mode, setMode, toggleMode };
}
