import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';
import { Zap, Keyboard, BarChart, Hourglass, MousePointerClick, User } from 'lucide-react';

import { StreakCounter } from './StreakCounter';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <NavLink
              to="/reflexes"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )
              }
            >
              <Zap className="h-4 w-4" />
              <span>Réflexes</span>
            </NavLink>
            <NavLink
              to="/typing"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )
              }
            >
              <Keyboard className="h-4 w-4" />
              <span>Vitesse de Frappe</span>
            </NavLink>
            <NavLink
              to="/time-perception"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )
              }
            >
              <Hourglass className="h-4 w-4" />
              <span>Time Perception</span>
            </NavLink>
            <NavLink
              to="/aim-trainer"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )
              }
            >
              <MousePointerClick className="h-4 w-4" />
              <span>Aim Trainer</span>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )
              }
            >
              <User className="h-4 w-4" />
              <span>Profil</span>
            </NavLink>
          </div>
          <div className="flex items-center gap-2">
            <StreakCounter />
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <main className="flex-1 pt-16">
        {children}
      </main>
    </div>
  );
}
