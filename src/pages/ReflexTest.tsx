import { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { HistoryPanel } from '@/components/HistoryPanel';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import type { ReflexHistory, ReflexResult } from '@/types/history';

type GameState = 'idle' | 'waiting' | 'ready' | 'result' | 'too-early';

const initialHistory: ReflexHistory = {
  results: [],
  bestTime: null,
};

export default function ReflexTest() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [history, setHistory] = useLocalStorage<ReflexHistory>('reflex-history', initialHistory);
  
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
    
    // Random delay between 2-5 seconds
    const delay = 2000 + Math.random() * 3000;
    
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = performance.now();
    }, delay);
  }, [clearTimeout]);

  const handleClick = useCallback(() => {
    switch (gameState) {
      case 'idle':
      case 'result':
      case 'too-early':
        startWaiting();
        break;
      case 'waiting':
        clearTimeout();
        setGameState('too-early');
        break;
      case 'ready':
        const endTime = performance.now();
        const time = Math.round(endTime - startTimeRef.current);
        setReactionTime(time);
        setGameState('result');
        
        // Save to history
        const newResult: ReflexResult = {
          id: crypto.randomUUID(),
          time,
          date: new Date().toISOString(),
        };
        
        setHistory(prev => {
          const newResults = [newResult, ...prev.results].slice(0, 10);
          const newBest = prev.bestTime === null ? time : Math.min(prev.bestTime, time);
          return { results: newResults, bestTime: newBest };
        });
        break;
    }
  }, [gameState, startWaiting, clearTimeout, setHistory]);

  useEffect(() => {
    return () => clearTimeout();
  }, [clearTimeout]);

  const handleClearHistory = () => {
    setHistory(initialHistory);
  };

  const getStateStyles = () => {
    switch (gameState) {
      case 'idle':
        return 'bg-accent cursor-pointer';
      case 'waiting':
        return 'bg-warning cursor-not-allowed';
      case 'ready':
        return 'bg-success cursor-pointer';
      case 'result':
        return 'bg-accent cursor-pointer';
      case 'too-early':
        return 'bg-destructive cursor-pointer';
    }
  };

  const getStateText = () => {
    switch (gameState) {
      case 'idle':
        return { main: 'Cliquez pour commencer', sub: 'Testez vos réflexes' };
      case 'waiting':
        return { main: 'Attendez le vert...', sub: 'Ne cliquez pas encore' };
      case 'ready':
        return { main: 'Cliquez !', sub: '' };
      case 'result':
        return { main: `${reactionTime} ms`, sub: 'Cliquez pour réessayer' };
      case 'too-early':
        return { main: 'Trop tôt !', sub: 'Cliquez pour réessayer' };
    }
  };

  const stateText = getStateText();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Test de Réflexes</h1>
            <p className="text-muted-foreground">
              Cliquez dès que l'écran devient vert pour mesurer votre temps de réaction
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div
                onClick={handleClick}
                className={cn(
                  "reflex-container relative rounded-2xl h-[400px] lg:h-[500px] flex flex-col items-center justify-center select-none",
                  getStateStyles()
                )}
              >
                <span
                  className={cn(
                    "text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight",
                    gameState === 'result' && "result-display animate-pulse-subtle",
                    gameState === 'waiting' ? "text-warning-foreground" : "",
                    gameState === 'ready' ? "text-success-foreground" : "",
                    gameState === 'too-early' ? "text-destructive-foreground" : "",
                    (gameState === 'idle' || gameState === 'result') ? "text-accent-foreground" : ""
                  )}
                >
                  {stateText.main}
                </span>
                {stateText.sub && (
                  <span
                    className={cn(
                      "mt-4 text-lg font-medium opacity-80",
                      gameState === 'waiting' ? "text-warning-foreground" : "",
                      gameState === 'ready' ? "text-success-foreground" : "",
                      gameState === 'too-early' ? "text-destructive-foreground" : "",
                      (gameState === 'idle' || gameState === 'result') ? "text-accent-foreground" : ""
                    )}
                  >
                    {stateText.sub}
                  </span>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <HistoryPanel
                title="Historique"
                items={history.results.map(r => ({
                  id: r.id,
                  date: r.date,
                  value: r.time,
                }))}
                bestValue={history.bestTime}
                valueLabel="Temps"
                formatValue={(v) => `${v} ms`}
                onClear={handleClearHistory}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
