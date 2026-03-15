import { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { useSoundSystem } from '@/hooks/useSoundSystem';
import { cn } from '@/lib/utils';
import type { PerformanceHistory, ReflexResult } from '@/types/history';
import { RotateCcw, Zap, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

type GameState = 'idle' | 'waiting' | 'ready' | 'result' | 'finished';

const initialHistory: PerformanceHistory = {
  reflex: [],
  typing: [],
  timePerception: [],
  aimTrainer: [],
  colorSensitivity: [],
  peripheralVision: []
};

const TEST_COUNT = 5;

export default function ReflexTest() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [history, setHistory] = useLocalStorage<PerformanceHistory>('performance-history', initialHistory);
  const [testCount, setTestCount] = useState(0);
  const [testResults, setTestResults] = useState<number[]>([]);
  const [averageResult, setAverageResult] = useState(0);
  
  const { playSound } = useSoundSystem();
  
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startWaiting = useCallback(() => {
    setGameState('waiting');
    clearTimeout();
    playSound('shoot');

    const delay = 2000 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = performance.now();
    }, delay);
  }, [clearTimeout, playSound]);
  
  const resetGame = useCallback(() => {
    clearTimeout();
    setGameState('idle');
    setReactionTime(0);
    setTestCount(0);
    setTestResults([]);
    setAverageResult(0);
    playSound('shoot');
  }, [playSound, clearTimeout]);

  const handleClick = useCallback(() => {
    switch (gameState) {
      case 'idle':
      case 'result':
        if (testCount < TEST_COUNT) {
          startWaiting();
        } else if (gameState === 'result' && testCount === TEST_COUNT) {
          resetGame();
        }
        break;
      case 'waiting':
        clearTimeout();
        setGameState('idle'); 
        playSound('miss');
        break;
      case 'ready': {
        const endTime = performance.now();
        const time = Math.round(endTime - startTimeRef.current);
        setReactionTime(time);
        setTestResults(prev => [...prev, time]);
        setTestCount(prev => prev + 1);
        setGameState('result');
        playSound('hit');
        break;
      }
      case 'finished':
        resetGame();
        break;
    }
  }, [gameState, startWaiting, clearTimeout, testCount, resetGame, playSound]);

  useKeyboardControls(handleClick);

  const saveHistory = useCallback((average: number) => {
    const newResult: ReflexResult = {
      id: crypto.randomUUID(),
      time: average,
      date: new Date().toISOString(),
    };
    setHistory(prev => {
      const newReflexHistory = [newResult, ...(prev.reflex || [])].slice(0, 10);
      return {
        ...prev,
        reflex: newReflexHistory,
      };
    });
  }, [setHistory]);

  useEffect(() => {
    if (testCount === TEST_COUNT && gameState === 'result') {
      const validResults = testResults.filter(r => r > 0);
      if (validResults.length > 0) {
        const average = Math.round(validResults.reduce((a, b) => a + b, 0) / validResults.length);
        setAverageResult(average);
        saveHistory(average);
      }
      setGameState('finished');
    }
  }, [testCount, testResults, saveHistory, gameState]);

  useEffect(() => {
    return () => clearTimeout();
  }, [clearTimeout]);

  const currentAverage = testResults.length > 0 
    ? Math.round(testResults.reduce((a, b) => a + b, 0) / testResults.length) 
    : 0;

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* HUD Stats */}
        <div className="flex justify-start gap-12 mb-8 font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Attempt</span>
            <span className="text-2xl font-bold tabular-nums">
              {testCount}/{TEST_COUNT}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Reaction</span>
            <span className="text-2xl font-bold tabular-nums text-primary">
              {reactionTime > 0 ? `${reactionTime}ms` : '--'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Session Avg</span>
            <span className="text-2xl font-bold tabular-nums">
              {currentAverage > 0 ? `${currentAverage}ms` : '--'}
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
          {gameState === 'finished' ? (
            /* Results screen */
            <div className="p-12 rounded-2xl bg-secondary/10 border border-border/50 text-center animate-in fade-in zoom-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-2xl mx-auto">
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Final Average</div>
                  <div className="text-6xl font-bold text-primary font-mono tabular-nums">{averageResult}ms</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Best Reaction</div>
                  <div className="text-4xl font-bold font-mono tabular-nums">{Math.min(...testResults)}ms</div>
                </div>
              </div>
              <div className="mt-12 flex flex-col items-center gap-4">
                <Button onClick={resetGame} size="lg" className="rounded-full px-8 font-mono uppercase tracking-widest">
                  TRY AGAIN
                </Button>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                  Press <kbd className="px-2 py-1 rounded bg-secondary font-mono text-xs">Space</kbd> or <kbd className="px-2 py-1 rounded bg-secondary font-mono text-xs">Enter</kbd>
                </p>
              </div>
            </div>
          ) : (
            /* Game Area */
            <div
              onPointerDown={(e) => { e.preventDefault(); handleClick(); }}
              className={cn(
                "relative h-[400px] lg:h-[500px] rounded-2xl border border-border/50 transition-all duration-500 flex flex-col items-center justify-center cursor-pointer overflow-hidden",
                gameState === 'idle' && "bg-secondary/10",
                gameState === 'waiting' && "bg-zinc-950",
                gameState === 'ready' && "bg-emerald-500/20 border-emerald-500/50",
                gameState === 'result' && "bg-secondary/20"
              )}
            >
              {/* State Indicators */}
              <div className="relative z-10 flex flex-col items-center">
                {gameState === 'idle' && (
                  <>
                    <Zap className="h-12 w-12 text-muted-foreground/50 mb-6 animate-pulse" />
                    <p className="text-sm font-mono tracking-[0.2em] uppercase text-muted-foreground">Click to start session</p>
                  </>
                )}

                {gameState === 'waiting' && (
                  <>
                    <div className="w-24 h-24 rounded-full border-4 border-zinc-800 flex items-center justify-center">
                      <div className="w-4 h-4 bg-amber-500 rounded-full animate-ping" />
                    </div>
                    <p className="mt-8 text-sm font-mono tracking-[0.2em] uppercase text-amber-500">Wait for green...</p>
                  </>
                )}

                {gameState === 'ready' && (
                  <>
                    <div className="w-32 h-32 rounded-full bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)] animate-in zoom-in duration-75 flex items-center justify-center">
                      <Zap className="h-12 w-12 text-emerald-950 fill-emerald-950" />
                    </div>
                    <p className="mt-8 text-2xl font-bold font-mono tracking-[0.3em] uppercase text-emerald-500 animate-pulse">CLICK NOW!</p>
                  </>
                )}

                {gameState === 'result' && (
                  <>
                    <div className="text-7xl font-bold font-mono text-primary tabular-nums mb-4">{reactionTime}ms</div>
                    <p className="text-sm font-mono tracking-[0.2em] uppercase text-muted-foreground">Click to continue</p>
                  </>
                )}
              </div>

              {/* Background Glows */}
              {gameState === 'waiting' && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)]" />
              )}
              {gameState === 'ready' && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)]" />
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
