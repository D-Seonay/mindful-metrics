import { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSoundSystem } from '@/hooks/useSoundSystem';
import { cn } from '@/lib/utils';
import type { PerformanceHistory, PeripheralVisionResult } from '@/types/history';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type GameState = 'idle' | 'arming' | 'ready' | 'target_active' | 'finished';

const initialHistory: PerformanceHistory = {
  reflex: [],
  typing: [],
  timePerception: [],
  aimTrainer: [],
  colorSensitivity: [],
  peripheralVision: []
};

const TOTAL_TARGETS = 10;
const MIN_DELAY = 1000;
const MAX_DELAY = 3000;

interface TargetPosition {
  x: number;
  y: number;
}

export default function PeripheralVision() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentTarget, setCurrentTarget] = useState(0);
  const [targetPosition, setTargetPosition] = useState<TargetPosition | null>(null);
  
  // Stats
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [falseStarts, setFalseStarts] = useState(0);
  
  const [history, setHistory] = useLocalStorage<PerformanceHistory>('performance-history', initialHistory);
  const { playSound } = useSoundSystem();
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const calculateStats = useCallback(() => {
    const avgTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    
    const totalAttempts = TOTAL_TARGETS + falseStarts;
    const accuracy = totalAttempts > 0 ? (TOTAL_TARGETS / totalAttempts) * 100 : 0;
    
    return {
      averageTime: Math.round(avgTime),
      accuracy: Math.round(accuracy)
    };
  }, [reactionTimes, falseStarts]);

  const stats = calculateStats();

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const resetGame = useCallback(() => {
    cleanup();
    setGameState('idle');
    setCurrentTarget(0);
    setTargetPosition(null);
    setReactionTimes([]);
    setFalseStarts(0);
  }, [cleanup]);

  const finishGame = useCallback(() => {
    cleanup();
    setGameState('finished');
    playSound('hit'); // Optional: replace with a specific 'level complete' sound
  }, [cleanup, playSound]);

  useEffect(() => {
    if (gameState === 'finished') {
      const { averageTime, accuracy } = calculateStats();
      
      const newResult: PeripheralVisionResult = {
        id: crypto.randomUUID(),
        averageTime,
        accuracy,
        targetsHit: TOTAL_TARGETS,
        date: new Date().toISOString()
      };

      setHistory(prev => ({
        ...prev,
        peripheralVision: [newResult, ...(prev.peripheralVision || [])].slice(0, 10)
      }));
    }
  }, [gameState, calculateStats, setHistory]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Game Logic
  const handleCenterEnter = () => {
    if (gameState === 'idle' || gameState === 'ready') {
      setGameState('arming');
      playSound('type'); // subtle click sound
      
      const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
      timeoutRef.current = setTimeout(() => {
        spawnTarget();
      }, delay);
    }
  };

  const handleCenterLeave = () => {
    if (gameState === 'arming') {
      // User left center too early!
      cleanup();
      setGameState('ready'); // Go back to ready state, wait for them to re-enter
      setFalseStarts(prev => prev + 1);
      playSound('error');
    }
  };

  const spawnTarget = () => {
    if (!containerRef.current) return;
    
    const { clientWidth, clientHeight } = containerRef.current;
    
    // We want targets to spawn near the edges, avoiding the center.
    // Let's divide the screen into 4 edge zones and pick one randomly.
    const margin = 50; // pixels from edge
    const centerRadius = 150; // avoid spawning within this radius from center
    
    let x = 0;
    let y = 0;
    let validPosition = false;

    while (!validPosition) {
      x = margin + Math.random() * (clientWidth - 2 * margin);
      y = margin + Math.random() * (clientHeight - 2 * margin);
      
      const dx = x - clientWidth / 2;
      const dy = y - clientHeight / 2;
      const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
      
      if (distanceToCenter > centerRadius) {
        validPosition = true;
      }
    }

    setTargetPosition({ x, y });
    setGameState('target_active');
    startTimeRef.current = performance.now();
    playSound('shoot'); // subtle pop
  };

  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering other clicks
    if (gameState === 'target_active') {
      const endTime = performance.now();
      const reactionTime = endTime - startTimeRef.current;
      
      setReactionTimes(prev => [...prev, reactionTime]);
      setTargetPosition(null);
      playSound('hit');
      
      const nextTarget = currentTarget + 1;
      setCurrentTarget(nextTarget);
      
      if (nextTarget >= TOTAL_TARGETS) {
        finishGame();
      } else {
        setGameState('ready'); // Waiting for user to return to center
      }
    }
  };

  // Prevent selecting text or dragging
  const handlePreventDefault = (e: React.SyntheticEvent) => {
    e.preventDefault();
  };

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-8 flex flex-col min-h-[calc(100vh-8rem)]">
        
        {/* Header & HUD */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1 font-mono tracking-tight uppercase">Peripheral Vision</h1>
            <p className="text-sm text-muted-foreground font-mono tracking-widest uppercase">React to edge targets while holding center</p>
          </div>

          <div className="flex items-center gap-8 font-mono">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Target</span>
              <span className="text-2xl font-bold tabular-nums">
                {currentTarget}/{TOTAL_TARGETS}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Avg Time</span>
              <span className="text-2xl font-bold tabular-nums text-primary">
                {stats.averageTime}ms
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Accuracy</span>
              <span className="text-2xl font-bold tabular-nums">
                {stats.accuracy}%
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
        </div>

        {/* Game Area */}
        <div 
          ref={containerRef}
          className={cn(
            "flex-1 relative rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden cursor-crosshair transition-colors duration-500",
            gameState === 'finished' && "bg-secondary/10 border-border/50"
          )}
          onContextMenu={handlePreventDefault}
          onDragStart={handlePreventDefault}
        >
          {gameState === 'finished' ? (
            /* Results Screen */
            <div className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in duration-500">
              <div className="text-center p-12">
                <div className="grid grid-cols-2 gap-12 mb-12">
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Average Reaction</div>
                    <div className="text-6xl font-bold text-primary font-mono tabular-nums">{stats.averageTime}ms</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Accuracy</div>
                    <div className="text-6xl font-bold font-mono tabular-nums">{stats.accuracy}%</div>
                  </div>
                </div>
                <Button onClick={resetGame} size="lg" className="rounded-full px-8 font-mono uppercase tracking-widest">
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Instructions Overlay (only when idle) */}
              {gameState === 'idle' && (
                <div className="absolute inset-x-0 top-1/4 flex justify-center pointer-events-none">
                  <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase animate-pulse">
                    Hover center to arm
                  </p>
                </div>
              )}
              {gameState === 'ready' && (
                <div className="absolute inset-x-0 top-1/4 flex justify-center pointer-events-none">
                  <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">
                    Return to center
                  </p>
                </div>
              )}

              {/* Central Arming Zone */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 flex items-center justify-center z-10"
                onMouseEnter={handleCenterEnter}
                onMouseLeave={handleCenterLeave}
              >
                {/* Visual indicator of the center */}
                <div className={cn(
                  "w-4 h-4 rounded-full transition-all duration-300",
                  (gameState === 'idle' || gameState === 'ready') ? "bg-zinc-600 scale-100 animate-pulse" : 
                  gameState === 'arming' ? "bg-zinc-100 scale-50 shadow-[0_0_15px_rgba(255,255,255,0.5)]" : 
                  "bg-zinc-800 scale-50 opacity-20"
                )} />
                
                {/* Arming progress ring (visual fluff) */}
                {gameState === 'arming' && (
                  <div className="absolute inset-0 rounded-full border border-zinc-700 animate-[spin_3s_linear_infinite]" />
                )}
              </div>

              {/* Peripheral Target */}
              {gameState === 'target_active' && targetPosition && (
                <button
                  className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center group animate-in zoom-in-50 duration-150"
                  style={{ left: targetPosition.x, top: targetPosition.y }}
                  onMouseDown={handleTargetClick}
                >
                  <div className="w-2 h-2 rounded-full bg-primary group-active:scale-150 transition-transform" />
                  <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-50" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}