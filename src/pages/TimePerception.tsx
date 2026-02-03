import { useState, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { cn } from '@/lib/utils';
import { Dot } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { PerformanceHistory, TimePerceptionResult } from '@/types/history';
import { Button } from '@/components/ui/button';

type GameState = 'idle' | 'running' | 'result';

const initialHistory: PerformanceHistory = {
  reflex: [],
  typing: [],
  timePerception: [],
  aimTrainer: []
};

export default function TimePerceptionTest() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [result, setResult] = useState<number>(0);
  const [history, setHistory] = useLocalStorage<PerformanceHistory>('performance-history', initialHistory);

  const handleClick = useCallback(() => {
    if (gameState === 'idle') {
      setStartTime(performance.now());
      setGameState('running');
    } else if (gameState === 'running') {
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000;
      setResult(duration);
      setGameState('result');
      
      const newResult: TimePerceptionResult = {
        id: crypto.randomUUID(),
        time: duration,
        difference: duration - 10,
        date: new Date().toISOString(),
      };

      setHistory(prev => ({
        ...prev,
        timePerception: [newResult, ...(prev.timePerception || [])].slice(0, 10),
      }));

    } else { // gameState === 'result'
      setGameState('idle');
      setResult(0);
    }
  }, [gameState, startTime, setHistory]);

  const difference = result - 10;

  const getResultMessage = () => {
    const diff = Math.abs(difference);
    if (diff <= 0.1) return "Incroyable!";
    if (diff <= 0.5) return "Excellent!";
    if (result < 9.5) return "Un peu trop vite";
    if (result > 10.5) return "Un peu trop lent";
    return "Bien essayé!";
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
          {gameState === 'result' ? (
             <div className="text-center animate-fade-in">
               <h2 className="text-8xl font-bold tracking-tighter">{result.toFixed(2)}s</h2>
               <p className="text-3xl text-muted-foreground font-light">
                 ({difference > 0 ? '+' : ''}{difference.toFixed(2)}s)
               </p>
               <p className="text-2xl mt-6 font-medium">{getResultMessage()}</p>
             </div>
          ) : (
            <div className="flex justify-center items-center">
              <button 
                onClick={handleClick}
                className={cn(
                  "relative w-48 h-48 rounded-full transition-all duration-500 ease-in-out",
                  "flex items-center justify-center",
                  "bg-sage-300",
                  "text-2xl font-semibold text-sage-800",
                  gameState === 'running' ? 'animate-breathing' : 'hover:bg-sage-400',
                )}
              >
                {gameState === 'idle' && 'Start'}
                {gameState === 'running' && <Dot className="w-16 h-16" />}
              </button>
            </div>
          )}
        </div>

        <div className="absolute bottom-20 text-center">
          {gameState === 'idle' && (
            <div className="animate-fade-in">
              <h1 className="text-xl font-semibold mb-1">Perception du Temps</h1>
              <p className="text-muted-foreground">Cliquez, puis arrêtez à exactement 10 secondes.</p>
            </div>
          )}
          {gameState === 'result' && (
            <Button onClick={handleClick} variant="ghost" className="animate-fade-in">Réessayer</Button>
          )}
        </div>

      </div>
    </Layout>
  );
}
