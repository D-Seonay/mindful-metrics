import { useState, useCallback, useRef, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAimGame, GameMode, MovementType } from '@/hooks/useAimGame';
import { useSoundSystem } from '@/hooks/useSoundSystem';
import type { PerformanceHistory, AimTrainerResult } from '@/types/history';
import { RotateCcw, Crosshair, Clock, Move } from 'lucide-react';

const initialHistory: PerformanceHistory = {
  reflex: [],
  typing: [],
  timePerception: [],
  aimTrainer: [],
  colorSensitivity: [],
  peripheralVision: []
};

export default function AimTrainer() {
  const [history, setHistory] = useLocalStorage<PerformanceHistory>('performance-history', initialHistory);
  const [clickEffects, setClickEffects] = useState<{x: number, y: number, id: number}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSoundSystem();
  const [displayElapsedTime, setDisplayElapsedTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Local state for configuration
  const [mode, setMode] = useState<GameMode>('TIME_ATTACK');
  const [movement, setMovement] = useState<MovementType>('STATIC');
  const [autoDismiss, setAutoDismiss] = useState<string>("0");

  const {
    gameState,
    targets,
    stats,
    config,
    startGame,
    resetGame,
    clickTarget,
    registerClick,
    setGameArea
  } = useAimGame();

  useEffect(() => {
    if (containerRef.current) {
      setGameArea(containerRef.current.clientWidth, containerRef.current.clientHeight);
    }
    const handleResize = () => {
        if (containerRef.current) {
            setGameArea(containerRef.current.clientWidth, containerRef.current.clientHeight);
        }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setGameArea]);

  useEffect(() => {
    if (gameState === 'PLAYING' && stats.startTime > 0) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      const interval = setInterval(() => {
        setDisplayElapsedTime((performance.now() - stats.startTime) / 1000);
      }, 10);
      timerIntervalRef.current = interval;
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setDisplayElapsedTime(0);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameState, stats.startTime]);

  useEffect(() => {
    if (gameState === 'FINISHED') {
      const duration = stats.endTime - stats.startTime;
      const averageTime = stats.score > 0 ? duration / stats.score : 0;
      const accuracy = stats.totalClicks > 0 ? Math.round((stats.score / stats.totalClicks) * 100) : 0;

      const newResult: AimTrainerResult = {
        id: crypto.randomUUID(),
        mode: config.mode,
        score: stats.score,
        totalTime: duration,
        averageTimePerTarget: averageTime,
        accuracy: accuracy,
        date: new Date().toISOString(),
      };

      setHistory(prev => ({
        ...prev,
        aimTrainer: [newResult, ...(prev.aimTrainer || [])].slice(0, 20),
      }));
    }
  }, [gameState, stats, config.mode, setHistory]);

  const handleContainerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== 'PLAYING') return;
    playSound('shoot');
    playSound('miss');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    registerClick();
    const newEffect = { x, y, id: Date.now() };
    setClickEffects(prev => [...prev, newEffect]);
    setTimeout(() => {
      setClickEffects(prev => prev.filter(ef => ef.id !== newEffect.id));
    }, 500);
  };

  const handleTargetPointerDown = (e: React.PointerEvent<HTMLDivElement>, targetId: number) => {
    e.stopPropagation();
    playSound('shoot');
    playSound('hit');
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
       const x = e.clientX - rect.left;
       const y = e.clientY - rect.top;
       const newEffect = { x, y, id: Date.now() };
        setClickEffects(prev => [...prev, newEffect]);
        setTimeout(() => {
            setClickEffects(prev => prev.filter(ef => ef.id !== newEffect.id));
        }, 500);
    }
    clickTarget(targetId);
  };

  const handleStart = () => {
    if (mode === 'TIME_ATTACK') {
      startGame({ 
          mode: 'TIME_ATTACK', 
          movement: movement, 
          autoDismissTime: Number(autoDismiss), 
          duration: 30 
      });
    } else {
      startGame({ 
          mode: 'PRECISION', 
          movement: movement,
          targetCount: 20 
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentAccuracy = stats.totalClicks > 0 ? Math.round((stats.score / stats.totalClicks) * 100) : 0;

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-12 flex flex-col h-[calc(100vh-4rem)]">
        {/* Compact Settings Bar */}
        <div className={cn(
          "flex flex-wrap items-center justify-between gap-4 mb-12 p-2 rounded-xl bg-secondary/20 border border-border/50 transition-opacity duration-300",
          gameState === 'PLAYING' ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <div className="flex items-center gap-4">
            <ToggleGroup type="single" value={mode} onValueChange={(v: GameMode) => v && setMode(v)} className="bg-transparent">
              <ToggleGroupItem value="TIME_ATTACK" className="h-8 px-3 text-xs font-mono data-[state=on]:bg-secondary">
                <Clock className="h-3 w-3 mr-2" /> TIME
              </ToggleGroupItem>
              <ToggleGroupItem value="PRECISION" className="h-8 px-3 text-xs font-mono data-[state=on]:bg-secondary">
                <Crosshair className="h-3 w-3 mr-2" /> PRECISION
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="h-4 w-[1px] bg-border/50 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-1">Movement</span>
              <Select onValueChange={(v) => setMovement(v as MovementType)} value={movement}>
                <SelectTrigger className="h-8 w-[100px] text-xs font-mono bg-transparent border-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STATIC">Static</SelectItem>
                  <SelectItem value="LINEAR">Linear</SelectItem>
                  <SelectItem value="BOUNCE">Bounce</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="h-4 w-[1px] bg-border/50 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-1">Dismiss</span>
              <Select onValueChange={setAutoDismiss} value={autoDismiss}>
                <SelectTrigger className="h-8 w-[100px] text-xs font-mono bg-transparent border-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Never</SelectItem>
                  <SelectItem value="2">2s</SelectItem>
                  <SelectItem value="1">1s</SelectItem>
                  <SelectItem value="0.5">0.5s</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* HUD Stats */}
        <div className="flex justify-start gap-12 mb-8 font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Time</span>
            <span className="text-2xl font-bold tabular-nums text-primary">
              {config.mode === 'TIME_ATTACK' 
                ? formatTime(Math.max(0, config.duration - displayElapsedTime))
                : formatTime(displayElapsedTime)
              }
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Score</span>
            <span className="text-2xl font-bold tabular-nums">
              {stats.score}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Accuracy</span>
            <span className="text-2xl font-bold tabular-nums">
              {currentAccuracy}%
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

        <div className="flex-1 relative">
          {gameState === 'IDLE' && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/20 rounded-2xl">
              <Button onClick={handleStart} size="lg" className="rounded-full px-12 h-16 font-mono text-lg uppercase tracking-[0.2em] shadow-2xl">
                START TEST
              </Button>
            </div>
          )}

          {gameState === 'FINISHED' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/95 backdrop-blur-md rounded-2xl animate-in fade-in duration-500">
              <div className="text-center w-full max-w-3xl p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-12">
                  <div className="space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Score</div>
                    <div className="text-6xl font-bold text-primary font-mono">{stats.score}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Accuracy</div>
                    <div className="text-4xl font-bold font-mono">{currentAccuracy}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Total Time</div>
                    <div className="text-4xl font-bold font-mono tabular-nums">{((stats.endTime - stats.startTime) / 1000).toFixed(2)}s</div>
                  </div>
                </div>
                <Button onClick={resetGame} size="lg" className="rounded-full px-8 font-mono uppercase tracking-widest">
                  TRY AGAIN
                </Button>
              </div>
            </div>
          )}

          <div 
            ref={containerRef}
            className={cn(
              "w-full h-full rounded-2xl border transition-all duration-500 relative cursor-crosshair overflow-hidden touch-none",
              gameState === 'PLAYING' ? "bg-zinc-950 border-primary/30 shadow-inner" : "bg-secondary/10 border-border/50"
            )}
            onPointerDown={handleContainerPointerDown}
          >
            {targets.map(target => (
              <div
                key={target.id}
                className={cn(
                  "absolute rounded-full transition-transform active:scale-90 duration-75",
                  "bg-primary/20 border-2 border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                )}
                style={{
                  left: target.x,
                  top: target.y,
                  width: target.radius * 2,
                  height: target.radius * 2,
                  transform: 'translate(-50%, -50%)',
                }}
                onPointerDown={(e) => handleTargetPointerDown(e, target.id)}
              >
                <div className="absolute inset-0 m-auto w-1.5 h-1.5 bg-primary rounded-full" />
              </div>
            ))}

            {clickEffects.map(effect => (
              <div
                key={effect.id}
                className="absolute rounded-full border border-primary/40 pointer-events-none animate-ripple"
                style={{
                  left: effect.x,
                  top: effect.y,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
