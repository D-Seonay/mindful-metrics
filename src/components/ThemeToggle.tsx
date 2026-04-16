"use client";

import { Moon, Sun, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg" disabled>
          <Sun className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg" disabled>
          <Palette className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const toggleMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMode}
        className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle light/dark mode</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg">
            <Palette className="h-4 w-4" />
            <span className="sr-only">Select color theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme('light')}>
            Default
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('blue')}>
            Blue
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('green')}>
            Green
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('orange')}>
            Orange
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('purple')}>
            Purple
          </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
}
