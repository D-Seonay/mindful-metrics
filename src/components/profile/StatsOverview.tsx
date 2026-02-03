import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { PerformanceHistory, ReflexResult, TypingResult, TimePerceptionResult, AimTrainerResult } from "@/types/history";
import { Zap, Keyboard, Hourglass, MousePointerClick } from "lucide-react";
import { StatsDetailDialog } from "./StatsDetailDialog";

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
          <p className="text-xs text-muted-foreground mb-4">
            {history.reflex?.length || 0} tests effectués
          </p>
          <StatsDetailDialog<ReflexResult>
            title="Historique Réflexes"
            description="Vos derniers temps de réaction."
            data={history.reflex || []}
            columns={[
              { header: "Temps", accessor: (item) => <span className="font-mono">{item.time} ms</span> },
            ]}
          />
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
          <p className="text-xs text-muted-foreground mb-4">
             {history.typing?.length || 0} tests effectués
          </p>
          <StatsDetailDialog<TypingResult>
            title="Historique Frappe"
            description="Vos performances de dactylographie."
            data={history.typing || []}
            columns={[
              { header: "Vitesse", accessor: (item) => <span className="font-bold text-green-600">{item.wpm} WPM</span> },
              { header: "Précision", accessor: (item) => `${item.accuracy}%` },
            ]}
          />
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
          <p className="text-xs text-muted-foreground mb-4">
             {history.timePerception?.length || 0} tests effectués
          </p>
          <StatsDetailDialog<TimePerceptionResult>
             title="Historique Perception Temps"
             description="Votre capacité à estimer le temps."
             data={history.timePerception || []}
             columns={[
               { header: "Cible", accessor: (item) => `${item.time}s` },
               { header: "Différence", accessor: (item) => <span className={item.difference > 0 ? "text-red-500" : "text-blue-500"}>{item.difference > 0 ? "+" : ""}{item.difference.toFixed(3)}s</span> },
             ]}
          />
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
          <p className="text-xs text-muted-foreground mb-4">
             {history.aimTrainer?.length || 0} tests effectués
          </p>
          <StatsDetailDialog<AimTrainerResult>
            title="Historique Aim Trainer"
            description="Vos sessions d'entraînement à la visée."
            data={history.aimTrainer || []}
            columns={[
              { header: "Moyenne/Cible", accessor: (item) => `${item.averageTimePerTarget} ms` },
              { header: "Temps Total", accessor: (item) => `${(item.totalTime / 1000).toFixed(1)}s` },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
