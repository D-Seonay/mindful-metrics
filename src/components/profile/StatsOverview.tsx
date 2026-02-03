import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { PerformanceHistory } from "@/types/history";
import { Zap, Keyboard, Hourglass, MousePointerClick, Trophy } from "lucide-react";

const initialHistory: PerformanceHistory = {
  reflex: [],
  typing: [],
  timePerception: [],
  aimTrainer: [],
};

export function StatsOverview() {
  const [history] = useLocalStorage<PerformanceHistory>('performance-history', initialHistory);

  const getBestReflex = () => {
    if (!history.reflex || history.reflex.length === 0) return "-";
    const best = Math.min(...history.reflex.map(r => r.time));
    return `${best} ms`;
  };

  const getBestTyping = () => {
    if (!history.typing || history.typing.length === 0) return "-";
    const best = Math.max(...history.typing.map(r => r.wpm));
    return `${best} WPM`;
  };
  
  const getBestTimePerception = () => {
    if (!history.timePerception || history.timePerception.length === 0) return "-";
    // Best is closest to 0 difference
    const best = history.timePerception.reduce((prev, curr) => 
      Math.abs(curr.difference) < Math.abs(prev.difference) ? curr : prev
    );
    return `${Math.abs(best.difference).toFixed(3)} s (diff)`;
  };

  const getBestAim = () => {
     if (!history.aimTrainer || history.aimTrainer.length === 0) return "-";
     const best = Math.min(...history.aimTrainer.map(r => r.averageTimePerTarget));
     return `${best} ms/cible`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Réflexes (Record)
          </CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getBestReflex()}</div>
          <p className="text-xs text-muted-foreground">
            {history.reflex?.length || 0} tests effectués
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Vitesse de Frappe
          </CardTitle>
          <Keyboard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getBestTyping()}</div>
          <p className="text-xs text-muted-foreground">
             {history.typing?.length || 0} tests effectués
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Perception Temps
          </CardTitle>
          <Hourglass className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getBestTimePerception()}</div>
          <p className="text-xs text-muted-foreground">
             {history.timePerception?.length || 0} tests effectués
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Aim Trainer
          </CardTitle>
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getBestAim()}</div>
          <p className="text-xs text-muted-foreground">
             {history.aimTrainer?.length || 0} tests effectués
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
