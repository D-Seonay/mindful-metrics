import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { PerformanceHistory, ReflexResult, TypingResult, TimePerceptionResult, AimTrainerResult, ColorSensitivityResult, PeripheralVisionResult, ColorMemoryResult, CircleMemoryResult } from "@/types/history";
import { Zap, Keyboard, Hourglass, MousePointerClick, Eye, Target, Brain, Circle } from "lucide-react";
import { StatsDetailDialog } from "./StatsDetailDialog";
import { ActivityHeatmap } from "./ActivityHeatmap";

const initialHistory: PerformanceHistory = {
  reflex: [],
  typing: [],
  timePerception: [],
  aimTrainer: [],
  colorSensitivity: [],
  colorMemory: [],
  circleMemory: [],
  peripheralVision: []
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
  
    // --- Color Sensitivity Helpers ---
    const colorSensitivityStats = () => {
      if (!history.colorSensitivity?.length) return { best: "-", avg: "-" };
      const best = Math.max(...history.colorSensitivity.map(r => r.score));
      const avg = Math.round(history.colorSensitivity.reduce((a, b) => a + b.score, 0) / history.colorSensitivity.length);
      return {
        best: `${best} niveaux`,
        avg: `${avg} niveaux`,
      };
    };

    // --- Color Memory Helpers ---
    const colorMemoryStats = () => {
      if (!history.colorMemory?.length) return { best: "-", avg: "-" };
      const best = Math.max(...history.colorMemory.map(r => r.score));
      const avg = Math.round(history.colorMemory.reduce((a, b) => a + b.score, 0) / history.colorMemory.length);
      return {
        best: `${best} niveaux`,
        avg: `${avg} niveaux`,
      };
    };

    // --- Circle Memory Helpers ---
    const circleMemoryStats = () => {
      if (!history.circleMemory?.length) return { best: "-", avg: "-" };
      const best = Math.max(...history.circleMemory.map(r => r.score));
      const avg = Math.round(history.circleMemory.reduce((a, b) => a + b.score, 0) / history.circleMemory.length);
      return {
        best: `${best}%`,
        avg: `${avg}%`,
      };
    };

    // --- Peripheral Vision Helpers ---
    const peripheralVisionStats = () => {
      if (!history.peripheralVision?.length) return { best: "-", avg: "-", acc: "-" };
      const best = Math.min(...history.peripheralVision.map(r => r.averageTime));
      const avg = Math.round(history.peripheralVision.reduce((a, b) => a + b.averageTime, 0) / history.peripheralVision.length);
      const acc = Math.round(history.peripheralVision.reduce((a, b) => a + b.accuracy, 0) / history.peripheralVision.length);
      return {
        best: `${best} ms`,
        avg: `${avg} ms`,
        acc: `${acc}%`
      };
    };
  
    const rStats = reflexStats();
    const tStats = typingStats();
    const tpStats = timeStats();
    const aStats = aimStats();
    const csStats = colorSensitivityStats();
    const cmStats = colorMemoryStats();
    const circleStats = circleMemoryStats();
    const pvStats = peripheralVisionStats();
  
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Activity Heatmap */}
        <ActivityHeatmap />
  
        {/* Reflexes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réflexes (Record)</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{rStats.best}</div>
            <p className="text-xs text-muted-foreground mb-2 md:mb-4">
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
            <div className="text-xl md:text-2xl font-bold">{tStats.best}</div>
            <p className="text-xs text-muted-foreground mb-2 md:mb-4">
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
            <div className="text-xl md:text-2xl font-bold">{tpStats.best}</div>
            <p className="text-xs text-muted-foreground mb-2 md:mb-4">
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
            <div className="text-xl md:text-2xl font-bold">{aStats.best}</div>
            <p className="text-xs text-muted-foreground mb-2 md:mb-4">
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
  
        {/* Color Sensitivity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sensibilité Couleurs</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{csStats.best}</div>
            <p className="text-xs text-muted-foreground mb-2 md:mb-4">
               {history.colorSensitivity?.length || 0} tests effectués
            </p>
            <StatsDetailDialog<ColorSensitivityResult>
              title="Historique Sensibilité Couleurs"
              description="Votre capacité à différencier les nuances."
              data={history.colorSensitivity || []}
              stats={[
                { label: "Meilleur Niveau", value: csStats.best },
                { label: "Niveau Moyen", value: csStats.avg },
              ]}
              columns={[
                { header: "Niveau", accessor: (item) => <span className="font-bold">{item.score}</span> },
                { header: "Difficulté", accessor: (item) => item.difficulty },
                { header: "Date", accessor: (item) => new Date(item.date).toLocaleDateString() },
              ]}
            />
          </CardContent>
        </Card>

        {/* Color Memory */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mémoire des Couleurs</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{cmStats.best}</div>
            <p className="text-xs text-muted-foreground mb-2 md:mb-4">
               {history.colorMemory?.length || 0} tests effectués
            </p>
            <StatsDetailDialog<ColorMemoryResult>
              title="Historique Mémoire des Couleurs"
              description="Votre capacité à mémoriser des séquences."
              data={history.colorMemory || []}
              stats={[
                { label: "Meilleur Niveau", value: cmStats.best },
                { label: "Niveau Moyen", value: cmStats.avg },
              ]}
              columns={[
                { header: "Niveau", accessor: (item) => <span className="font-bold">{item.score}</span> },
                { header: "Date", accessor: (item) => new Date(item.date).toLocaleDateString() },
              ]}
            />
          </CardContent>
        </Card>

        {/* Circle Memory */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Circle Memory</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{circleStats.best}</div>
            <p className="text-xs text-muted-foreground mb-2 md:mb-4">
               {history.circleMemory?.length || 0} tests effectués
            </p>
            <StatsDetailDialog<CircleMemoryResult>
              title="Historique Circle Memory"
              description="Mémorisation spatiale et chromatique."
              data={history.circleMemory || []}
              stats={[
                { label: "Meilleur Score", value: circleStats.best },
                { label: "Score Moyen", value: circleStats.avg },
              ]}
              columns={[
                { header: "Score", accessor: (item) => <span className="font-bold">{item.score}%</span> },
                { header: "Date", accessor: (item) => new Date(item.date).toLocaleDateString() },
              ]}
            />
          </CardContent>
        </Card>

        {/* Peripheral Vision */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vision Périphérique</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{pvStats.best}</div>
            <p className="text-xs text-muted-foreground mb-2 md:mb-4">
               {history.peripheralVision?.length || 0} tests effectués
            </p>
            <StatsDetailDialog<PeripheralVisionResult>
              title="Historique Vision Périphérique"
              description="Vos temps de réaction en vision périphérique."
              data={history.peripheralVision || []}
              stats={[
                { label: "Record (Moy)", value: pvStats.best },
                { label: "Moyenne Globale", value: pvStats.avg },
                { label: "Précision", value: pvStats.acc },
              ]}
              columns={[
                { header: "Moyenne", accessor: (item) => `${item.averageTime} ms` },
                { header: "Précision", accessor: (item) => `${item.accuracy}%` },
                { header: "Date", accessor: (item) => new Date(item.date).toLocaleDateString() },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    );
  }
