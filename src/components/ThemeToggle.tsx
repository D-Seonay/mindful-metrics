import { Moon, Sun, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, toggleMode, mode } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMode}
        className="h-9 w-9 rounded-lg"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle light/dark mode</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
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
