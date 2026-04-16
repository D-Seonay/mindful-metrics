"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Zap, Keyboard, Hourglass, MousePointerClick, User, Menu, Eye, Target, Brain, Circle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Dynamic imports for client-only components to prevent hydration mismatches
const StreakCounter = dynamic(() => import('./StreakCounter').then(mod => mod.StreakCounter), { ssr: false });
const AudioSettings = dynamic(() => import('./AudioSettings').then(mod => mod.AudioSettings), { ssr: false });
const ThemeToggle = dynamic(() => import('./ThemeToggle').then(mod => mod.ThemeToggle), { ssr: false });


interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  to: string;
  icon: any;
  label: string;
}

interface Category {
  label: string;
  items: NavItem[];
}

const categories: Category[] = [
  {
    label: "Cognitif",
    items: [
      { to: "/reflexes", icon: Zap, label: "Réflexes" },
      { to: "/time-perception", icon: Hourglass, label: "Time Perception" },
      { to: "/color-memory", icon: Brain, label: "Mémoire" },
    ]
  },
  {
    label: "Précision",
    items: [
      { to: "/aim-trainer", icon: MousePointerClick, label: "Aim Trainer" },
      { to: "/peripheral-vision", icon: Target, label: "Vision" },
    ]
  },
  {
    label: "Frappe",
    items: [
      { to: "/typing", icon: Keyboard, label: "Frappe" },
    ]
  },
  {
    label: "Couleurs",
    items: [
      { to: "/color-vision", icon: Eye, label: "Couleurs" },
      { to: "/circle-memory", icon: Circle, label: "Cercle" },

    ]
  }
];

const profileItem = { to: "/profile", icon: User, label: "Profil" };

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isLandingPage && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              {categories.map((cat) => (
                <div key={cat.label} className="flex items-center gap-1 group">
                  <div className="flex items-center gap-0.5 p-1 rounded-xl bg-secondary/20 border border-border/40">
                    {cat.items.map((item) => {
                      const isActive = pathname === item.to;
                      return (
                        <Link
                          key={item.to}
                          href={item.to}
                          className={cn(
                            "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                          )}
                          title={`${cat.label}: ${item.label}`}
                        >
                          <item.icon className="h-3.5 w-3.5" />
                          <span className="hidden lg:inline">{item.label}</span>
                        </Link>
                      );
                      })}
                      </div>
                      </div>
                      ))}
                      </div>
            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                  <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                  <div className="flex flex-col gap-6 mt-8 px-2 overflow-y-auto max-h-[calc(100vh-8rem)]">
                    {categories.map((cat) => (
                      <div key={cat.label} className="flex flex-col gap-2">
                        <h3 className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-[0.3em] px-4">{cat.label}</h3>
                        <div className="flex flex-col gap-1">
                          {cat.items.map((item) => {
                            const isActive = pathname === item.to;
                            return (
                              <Link
                                key={item.to}
                                href={item.to}
                                className={cn(
                                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                  isActive
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                )}
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <Link
                        href={profileItem.to}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                          pathname === profileItem.to
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        )}
                      >
                        <Avatar className="h-6 w-6 border border-border/50">
                          <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <span>Mon Profil</span>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <StreakCounter />
              <AudioSettings />
              <ThemeToggle />
              <Link href="/profile">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border border-zinc-800 hover:border-zinc-400 transition-colors cursor-pointer">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                  <AvatarFallback>MM</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </nav>
        </header>
      )}
      <main className={cn("flex-1", !isLandingPage && "pt-16")}>
        {children}
      </main>
    </div>
  );
}

