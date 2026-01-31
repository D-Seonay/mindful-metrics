import { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import type { PerformanceHistory, ReflexResult } from '@/types/history';

type GameState = 'idle' | 'waiting' | 'ready' | 'result' | 'finished';

const initialHistory: PerformanceHistory = {
  reflex: [],
  typing: [],
};

const TEST_COUNT = 5;

export default function ReflexTest() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [history, setHistory] = useLocalStorage<PerformanceHistory>('performance-history', initialHistory);
  const [testCount, setTestCount] = useState(0);
  const [testResults, setTestResults] = useState<number[]>([]);
  const [averageResult, setAverageResult] = useState(0);
  
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
    
    const delay = 2000 + Math.random() * 3000;
    
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = performance.now();
    }, delay);
  }, [clearTimeout]);
  
  const resetGame = useCallback(() => {
    setGameState('idle');
    setReactionTime(0);
    setTestCount(0);
    setTestResults([]);
    setAverageResult(0);
  }, []);

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
        setGameState('idle'); // Reset to idle so user can click to start this attempt again
        break;
      case 'ready':
        const endTime = performance.now();
        const time = Math.round(endTime - startTimeRef.current);
        setReactionTime(time);
        setTestResults(prev => [...prev, time]);
        setTestCount(prev => prev + 1);
        setGameState('result');
        break;
      case 'finished':
        resetGame();
        break;
    }
  }, [gameState, startWaiting, clearTimeout, testCount, resetGame]);

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
    if (testCount === TEST_COUNT) {
      const validResults = testResults.filter(r => r > 0);
      if (validResults.length > 0) {
        const average = Math.round(validResults.reduce((a, b) => a + b, 0) / validResults.length);
        setAverageResult(average);
        saveHistory(average);
      }
      setGameState('finished');
    }
  }, [testCount, testResults, saveHistory]);

  useEffect(() => {
    return () => clearTimeout();
  }, [clearTimeout]);

  const getStateStyles = () => {
    if (gameState === 'finished') return 'bg-primary cursor-pointer';
    
    switch (gameState) {
      case 'idle':
        return 'bg-accent cursor-pointer';
      case 'waiting':
        return 'bg-warning cursor-not-allowed';
      case 'ready':
        return 'bg-success cursor-pointer';
      case 'result':
        return 'bg-accent cursor-pointer';
    }
  };

  const getStateText = () => {
     if (gameState === 'finished') {
      return { main: `${averageResult} ms`, sub: 'Cliquez pour recommencer' };
    }
    switch (gameState) {
      case 'idle':
        return { main: 'Cliquez pour commencer', sub: testCount === 0 ? `Faites ${TEST_COUNT} tests pour obtenir une moyenne` : `Test ${testCount + 1}/${TEST_COUNT}`};
      case 'waiting':
        return { main: 'Attendez le vert...', sub: `Test ${testCount + 1}/${TEST_COUNT}` };
      case 'ready':
        return { main: 'Cliquez !', sub: `Test ${testCount + 1}/${TEST_COUNT}` };
      case 'result':
        return { main: `${reactionTime} ms`, sub: 'Cliquez pour continuer' };
    }
  };

  const stateText = getStateText();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Test de Réflexes (Moyenne de 5)</h1>
            <p className="text-muted-foreground">
              Cliquez dès que l'écran devient vert pour mesurer votre temps de réaction.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
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
                    (gameState === 'result' || gameState === 'finished') && "result-display animate-pulse-subtle",
                    gameState === 'waiting' ? "text-warning-foreground" : "",
                    gameState === 'ready' ? "text-success-foreground" : "",
                    reactionTime === -1 ? "text-destructive-foreground" : "",
                    (gameState === 'idle' || gameState === 'result') ? "text-accent-foreground" : "text-primary-foreground"
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
                      reactionTime === -1 ? "text-destructive-foreground" : "",
                      (gameState === 'idle' || gameState === 'result') ? "text-accent-foreground" : "text-primary-foreground"
                    )}
                  >
                    {stateText.sub}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
