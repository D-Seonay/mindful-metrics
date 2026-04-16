import { Flame } from 'lucide-react';
import { useDailyStreak } from '@/hooks/useDailyStreak';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function StreakCounter() {
  const { streak } = useDailyStreak();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || streak === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full bg-orange-100/10 text-orange-500 border border-orange-500/20 mr-1 sm:mr-2 cursor-help select-none">
            <Flame className={cn("h-4 w-4 fill-orange-500", streak > 0 && "animate-pulse")} />
            <span className="text-sm font-bold font-mono">{streak}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Série actuelle : {streak} jour{streak > 1 ? 's' : ''} !</p>
          <p className="text-xs text-muted-foreground">Revenez demain pour continuer.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
