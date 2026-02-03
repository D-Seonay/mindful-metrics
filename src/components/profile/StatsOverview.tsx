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

  // --- Reflex Helpers ---
  const reflexStats = () => {
    if (!history.reflex?.length) return { best: "-", avg: "-" };
    const best = Math.min(...history.reflex.map(r => r.time));
    const avg = Math.round(history.reflex.reduce((a, b) => a + b.time, 0) / history.reflex.length);
    return { best: `${best} ms`, avg: `${avg} ms` };
  };

  // --- Typing Helpers ---
  const typingStats = () => {
    if (!history.typing?.length) return { best: "-", avgWpm: "-", avgAcc: "-" };
    const best = Math.max(...history.typing.map(r => r.wpm));
    const avgWpm = Math.round(history.typing.reduce((a, b) => a + b.wpm, 0) / history.typing.length);
    const avgAcc = Math.round(history.typing.reduce((a, b) => a + b.accuracy, 0) / history.typing.length);
    return { best: `${best} WPM`, avgWpm: `${avgWpm} WPM`, avgAcc: `${avgAcc}%` };
  };

  // --- Time Perception Helpers ---
  const timeStats = () => {
    if (!history.timePerception?.length) return { best: "-", avgDiff: "-" };
    const best = history.timePerception.reduce((prev, curr) => 
      Math.abs(curr.difference) < Math.abs(prev.difference) ? curr : prev
    );
    const avgDiff = history.timePerception.reduce((a, b) => a + b.difference, 0) / history.timePerception.length;
    return { 
      best: `${Math.abs(best.difference).toFixed(3)}s`, 
      avgDiff: `${avgDiff.toFixed(3)}s` 
    };
  };

  // --- Aim Trainer Helpers ---
  const aimStats = () => {
    if (!history.aimTrainer?.length) return { best: "-", avg: "-" };
    const best = Math.min(...history.aimTrainer.map(r => r.averageTimePerTarget));
    const avg = history.aimTrainer.reduce((a, b) => a + b.averageTimePerTarget, 0) / history.aimTrainer.length;
    return { 
      best: `${best.toFixed(0)} ms/cible`, 
      avg: `${avg.toFixed(0)} ms/cible` 
    };
  };

  const rStats = reflexStats();
  const tStats = typingStats();
  const tpStats = timeStats();
  const aStats = aimStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Reflexes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Réflexes (Record)</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{rStats.best}</div>
          <p className="text-xs text-muted-foreground mb-4">
            {history.reflex?.length || 0} tests effectués
          </p>
          <StatsDetailDialog<ReflexResult>
            title="Historique Réflexes"
            description="Vos derniers temps de réaction."
            data={history.reflex || []}
            stats={[
              { label: "Meilleur Temps", value: rStats.best },
              { label: "Temps Moyen", value: rStats.avg },
            ]}
            columns={[
              { header: "Temps", accessor: (item) => <span className="font-mono">{item.time} ms</span> },
            ]}
          />
        </CardContent>
      </Card>
      
      {/* Typing */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vitesse de Frappe</CardTitle>
          <Keyboard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tStats.best}</div>
          <p className="text-xs text-muted-foreground mb-4">
             {history.typing?.length || 0} tests effectués
          </p>
          <StatsDetailDialog<TypingResult>
            title="Historique Frappe"
            description="Vos performances de dactylographie."
            data={history.typing || []}
            stats={[
              { label: "Meilleur Score", value: tStats.best },
              { label: "Vitesse Moyenne", value: tStats.avgWpm },
              { label: "Précision Moyenne", value: tStats.avgAcc },
            ]}
            columns={[
              { header: "Vitesse", accessor: (item) => <span className="font-bold text-green-600">{item.wpm} WPM</span> },
              { header: "Précision", accessor: (item) => `${item.accuracy}%` },
            ]}
          />
        </CardContent>
      </Card>

      {/* Time Perception */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Perception Temps</CardTitle>
          <Hourglass className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tpStats.best}</div>
          <p className="text-xs text-muted-foreground mb-4">
             {history.timePerception?.length || 0} tests effectués
          </p>
          <StatsDetailDialog<TimePerceptionResult>
             title="Historique Perception Temps"
             description="Votre capacité à estimer le temps."
             data={history.timePerception || []}
             stats={[
               { label: "Meilleure Diff", value: tpStats.best },
               { label: "Différence Moyenne", value: tpStats.avgDiff },
             ]}
             columns={[
               { header: "Cible", accessor: (item) => `${item.time}s` },
               { header: "Différence", accessor: (item) => <span className={item.difference > 0 ? "text-red-500" : "text-blue-500"}>{item.difference > 0 ? "+" : ""}{item.difference.toFixed(3)}s</span> },
             ]}
          />
        </CardContent>
      </Card>

      {/* Aim Trainer */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aim Trainer</CardTitle>
          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{aStats.best}</div>
          <p className="text-xs text-muted-foreground mb-4">
             {history.aimTrainer?.length || 0} tests effectués
          </p>
          <StatsDetailDialog<AimTrainerResult>
            title="Historique Aim Trainer"
            description="Vos sessions d'entraînement à la visée."
            data={history.aimTrainer || []}
            stats={[
              { label: "Record (Moy/Cible)", value: aStats.best },
              { label: "Moyenne Globale", value: aStats.avg },
            ]}
            columns={[
              { header: "Moyenne/Cible", accessor: (item) => `${item.averageTimePerTarget.toFixed(0)} ms` },
              { header: "Temps Total", accessor: (item) => `${(item.totalTime / 1000).toFixed(1)}s` },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
