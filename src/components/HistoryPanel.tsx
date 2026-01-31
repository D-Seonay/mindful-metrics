import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trophy, Clock, Target, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HistoryItem {
  id: string;
  date: string;
  value: number;
  secondaryValue?: number;
}

interface HistoryPanelProps {
  title: string;
  items: HistoryItem[];
  bestValue: number | null;
  valueLabel: string;
  secondaryLabel?: string;
  formatValue: (value: number) => string;
  formatSecondary?: (value: number) => string;
  onClear: () => void;
  className?: string;
}

export function HistoryPanel({
  title,
  items,
  bestValue,
  valueLabel,
  secondaryLabel,
  formatValue,
  formatSecondary,
  onClear,
  className,
}: HistoryPanelProps) {
  if (items.length === 0) {
    return (
      <div className={cn("p-6 rounded-xl bg-secondary/30", className)}>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">{title}</h3>
        <p className="text-sm text-muted-foreground/70">Aucun résultat pour le moment</p>
      </div>
    );
  }

  return (
    <div className={cn("p-6 rounded-xl bg-secondary/30", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 px-2 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {bestValue !== null && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-success/10 border border-success/20">
          <Trophy className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-success">
            Meilleur : {formatValue(bestValue)}
          </span>
        </div>
      )}

      <div className="space-y-2">
        {items.slice(0, 10).map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-colors",
              index === 0 ? "bg-secondary/50" : "bg-secondary/20"
            )}
          >
            <div className="flex items-center gap-3">
              <Clock className="h-3.5 w-3.5 text-muted-foreground/50" />
              <span className="text-xs text-muted-foreground">
                {format(new Date(item.date), 'dd MMM HH:mm', { locale: fr })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">
                {formatValue(item.value)}
              </span>
              {item.secondaryValue !== undefined && formatSecondary && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  {formatSecondary(item.secondaryValue)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
