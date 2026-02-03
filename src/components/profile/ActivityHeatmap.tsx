import { useMemo } from 'react';
import { eachDayOfInterval, subDays, format, isValid, parseISO, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDailyStreak } from '@/hooks/useDailyStreak';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';

export function ActivityHeatmap() {
  const { history } = useDailyStreak();
  
  const calendarData = useMemo(() => {
    const today = new Date();
    // Start 365 days ago
    const startDate = subDays(today, 364); 
    
    // Generate all dates
    const dates = eachDayOfInterval({ start: startDate, end: today });

    // Group by weeks for the grid layout logic, or just simple list if using CSS Grid
    // GitHub uses a column-major layout (weeks are columns).
    // CSS Grid can handle this with `grid-flow-col` and `grid-rows-7`.
    return dates.map(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const count = history[dateKey] || 0;
      return {
        date,
        dateString: dateKey,
        count,
        level: getLevel(count)
      };
    });
  }, [history]);

  // Determine color intensity level (0-4)
  function getLevel(count: number) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 8) return 3;
    return 4;
  }

  // Get color class based on level
  function getColorClass(level: number) {
    switch (level) {
      case 0: return "bg-muted/40 hover:bg-muted/60";
      case 1: return "bg-primary/20 hover:bg-primary/30";
      case 2: return "bg-primary/40 hover:bg-primary/50";
      case 3: return "bg-primary/70 hover:bg-primary/80";
      case 4: return "bg-primary hover:bg-primary/90";
      default: return "bg-muted/40";
    }
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activité (Derniers 365 jours)
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Moins</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-muted/40" />
                    <div className="w-3 h-3 rounded-sm bg-primary/20" />
                    <div className="w-3 h-3 rounded-sm bg-primary/40" />
                    <div className="w-3 h-3 rounded-sm bg-primary/70" />
                    <div className="w-3 h-3 rounded-sm bg-primary" />
                </div>
                <span>Plus</span>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto pb-2">
           {/* GitHub-like Grid: 7 rows (days), ~52 cols (weeks). grid-flow-col fills columns first. */}
           <div className="grid grid-rows-7 grid-flow-col gap-[3px] min-w-[700px] h-[100px]">
             {calendarData.map((day) => (
                <TooltipProvider key={day.dateString}>
                    <Tooltip delayDuration={50}>
                        <TooltipTrigger asChild>
                            <div 
                                className={cn(
                                    "w-full h-full rounded-sm transition-colors",
                                    getColorClass(day.level)
                                )}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs font-medium">
                                {day.count} activité{day.count > 1 ? 's' : ''} le {format(day.date, 'dd MMM yyyy', { locale: fr })}
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
             ))}
           </div>
           
           {/* Day labels (optional, tricky to align perfectly without complex layout, skipping for MVP/Mosaic vibe) */}
        </div>
      </CardContent>
    </Card>
  );
}
