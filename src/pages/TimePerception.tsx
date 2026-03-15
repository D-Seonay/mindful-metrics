import { useState, useCallback, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { cn } from '@/lib/utils';
import { RotateCcw, Timer, Circle } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSoundSystem } from '@/hooks/useSoundSystem';
import type { PerformanceHistory, TimePerceptionResult } from '@/types/history';
import { Button } from '@/components/ui/button';

type GameState = 'idle' | 'running' | 'result';

const initialHistory: PerformanceHistory = {
  reflex: [],
  typing: [],
  timePerception: [],
  aimTrainer: [],
  colorSensitivity: [],
  peripheralVision: []
};

const targetOptions = [5, 10, 15, 30];

export default function TimePerceptionTest() {
  const [targetDuration, setTargetDuration] = useState(10);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [result, setResult] = useState<number>(0);
  const [history, setHistory] = useLocalStorage<PerformanceHistory>('performance-history', initialHistory);
  const { playSound } = useSoundSystem();

  const resetGame = useCallback(() => {
    setGameState('idle');
    setResult(0);
    setStartTime(0);
  }, []);

  const handleClick = useCallback(() => {
    if (gameState === 'idle') {
      setStartTime(performance.now());
      setGameState('running');
      playSound('shoot');
    } else if (gameState === 'running') {
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      setResult(duration);
      setGameState('result');
      playSound('hit');

      const newResult: TimePerceptionResult = {
        id: crypto.randomUUID(),
        time: targetDuration,
        difference: duration - targetDuration,
        date: new Date().toISOString(),
      };

      setHistory(prev => ({
        ...prev,
        timePerception: [newResult, ...(prev.timePerception || [])].slice(0, 10),
      }));
    } else {
      resetGame();
      playSound('shoot');
    }
  }, [gameState, startTime, targetDuration, setHistory, playSound, resetGame]);

  const difference = result - targetDuration;

  const getResultMessage = () => {
    const diff = Math.abs(difference);
    if (diff <= 0.1) return "PRECISION ABSOLUE";
    if (diff <= 0.5) return "EXCELLENT";
    if (result < targetDuration) return "TROP RAPIDE";
    return "TROP LENT";
  };

  const bestDiff = history.timePerception?.length > 0 
    ? Math.min(...history.timePerception.map(r => Math.abs(r.difference)))
    : null;

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* Compact Settings Bar */}
        <div className={cn(
          "flex items-center justify-center gap-4 mb-12 p-2 rounded-xl bg-secondary/20 border border-border/50 transition-opacity duration-300",
          gameState === 'running' ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-2 border-r border-border/50">Target</span>
          <div className="flex gap-1">
            {targetOptions.map(option => (
              <Button 
                key={option} 
                variant={targetDuration === option ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setTargetDuration(option)}
                className="h-8 px-3 text-xs font-mono"
              >
                {option}s
              </Button>
            ))}
          </div>
        </div>

        {/* HUD Stats */}
        <div className="flex justify-start gap-12 mb-8 font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Target</span>
            <span className="text-2xl font-bold tabular-nums">
              {targetDuration}s
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Best Accuracy</span>
            <span className="text-2xl font-bold tabular-nums text-primary">
              {bestDiff !== null ? `${bestDiff.toFixed(3)}s` : '--'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Last Diff</span>
            <span className="text-2xl font-bold tabular-nums">
              {history.timePerception?.[0] ? `${Math.abs(history.timePerception[0].difference).toFixed(3)}s` : '--'}
            </span>
          </div>
          <div className="ml-auto flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetGame}
              className="h-8 px-3 text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-2" />
              RESTART
            </Button>
          </div>
        </div>

        <div className="relative">
          {gameState === 'result' ? (
            /* Results screen */
            <div className="p-12 rounded-2xl bg-secondary/10 border border-border/50 text-center animate-in fade-in zoom-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-3xl mx-auto">
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Captured Time</div>
                  <div className="text-6xl font-bold text-primary font-mono tabular-nums">{result.toFixed(3)}s</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Difference</div>
                  <div className={cn(
                    "text-4xl font-bold font-mono tabular-nums",
                    Math.abs(difference) <= 0.2 ? "text-emerald-500" : "text-destructive"
                  )}>
                    {difference > 0 ? '+' : ''}{difference.toFixed(3)}s
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Rating</div>
                  <div className="text-2xl font-bold font-mono">{getResultMessage()}</div>
                </div>
              </div>
              <div className="mt-12 flex flex-col items-center gap-4">
                <Button onClick={resetGame} size="lg" className="rounded-full px-8 font-mono uppercase tracking-widest">
                  TRY AGAIN
                </Button>
              </div>
            </div>
          ) : (
            /* Game Area */
            <div
              className={cn(
                "relative h-[400px] lg:h-[500px] rounded-2xl border border-border/50 transition-all duration-500 flex flex-col items-center justify-center overflow-hidden",
                gameState === 'idle' && "bg-secondary/10",
                gameState === 'running' && "bg-zinc-950 border-primary/30"
              )}
            >
              <button
                onClick={handleClick}
                className={cn(
                  "relative z-10 w-48 h-48 rounded-full transition-all duration-500 flex items-center justify-center group outline-none",
                  gameState === 'idle' ? "bg-secondary/50 hover:bg-secondary border border-border/50" : "bg-primary/10 border-2 border-primary animate-pulse"
                )}
              >
                {gameState === 'idle' ? (
                  <span className="text-sm font-mono tracking-[0.2em] uppercase font-bold">START</span>
                ) : (
                  <div className="w-4 h-4 bg-primary rounded-full group-active:scale-150 transition-transform" />
                )}
                
                {gameState === 'running' && (
                  <div className="absolute inset-[-8px] rounded-full border border-primary/20 animate-ping" />
                )}
              </button>

              <div className="mt-12 text-center pointer-events-none">
                <p className="text-xs font-mono text-muted-foreground tracking-[0.3em] uppercase">
                  {gameState === 'idle' ? `Stop at exactly ${targetDuration} seconds` : "Capture now!"}
                </p>
              </div>

              {/* Background HUD elements */}
              {gameState === 'running' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <Timer className="w-64 h-64 text-primary animate-[spin_60s_linear_infinite]" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
