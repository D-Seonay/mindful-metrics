import { useState, useCallback, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { PerformanceHistory, AimTrainerResult } from '@/types/history';

type GameState = 'idle' | 'running' | 'finished';
type Target = { x: number; y: number; id: number };
type ClickEffect = { x: number; y: number; id: number };

const TARGET_RADIUS = 30;
const TOTAL_TARGETS = 30;

const initialHistory: PerformanceHistory = {
  reflex: [],
  typing: [],
  timePerception: [],
  aimTrainer: [],
};

export default function AimTrainer() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [targetsClicked, setTargetsClicked] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [currentTarget, setCurrentTarget] = useState<Target | null>(null);
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
  const [history, setHistory] = useLocalStorage<PerformanceHistory>('performance-history', initialHistory);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number>(0);

  const createRandomTarget = useCallback(() => {
    if (!gameAreaRef.current) return;
    const { width, height } = gameAreaRef.current.getBoundingClientRect();
    const x = Math.random() * (width - TARGET_RADIUS * 2) + TARGET_RADIUS;
    const y = Math.random() * (height - TARGET_RADIUS * 2) + TARGET_RADIUS;
    setCurrentTarget({ x, y, id: Date.now() });
  }, []);

  const startGame = useCallback(() => {
    setTargetsClicked(0);
    setTotalTime(0);
    setGameState('running');
    createRandomTarget();
    timerRef.current = performance.now();
  }, [createRandomTarget]);

  const handleTargetClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'running' || !currentTarget) return;

    const newTargetsClicked = targetsClicked + 1;

    // Add ripple effect
    const newEffect: ClickEffect = { x: e.clientX, y: e.clientY, id: Date.now() };
    setClickEffects(prev => [...prev, newEffect]);
    setTimeout(() => {
      setClickEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
    }, 500);

    if (newTargetsClicked >= TOTAL_TARGETS) {
      const endTime = performance.now();
      const timeTaken = endTime - timerRef.current;
      setTotalTime(timeTaken);
      setGameState('finished');
      setCurrentTarget(null);

      const newResult: AimTrainerResult = {
        id: crypto.randomUUID(),
        totalTime: timeTaken,
        averageTimePerTarget: timeTaken / TOTAL_TARGETS,
        date: new Date().toISOString(),
      };

      setHistory(prev => ({
        ...prev,
        aimTrainer: [newResult, ...(prev.aimTrainer || [])].slice(0, 10),
      }));

    } else {
      createRandomTarget();
    }
    setTargetsClicked(newTargetsClicked);
  };
  
  const resetGame = () => {
    setGameState('idle');
    setTargetsClicked(0);
    setTotalTime(0);
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Aim Trainer</h1>
        <p className="text-muted-foreground mb-4">Click 30 targets as fast as you can.</p>

        <div 
          ref={gameAreaRef}
          className="relative w-full h-[60vh] bg-secondary/30 rounded-lg overflow-hidden cursor-crosshair"
          onClick={gameState === 'running' && !currentTarget ? createRandomTarget : undefined}
        >
          {gameState === 'running' && currentTarget && (
            <div
              className="absolute rounded-full bg-primary"
              style={{
                left: currentTarget.x,
                top: currentTarget.y,
                width: TARGET_RADIUS * 2,
                height: TARGET_RADIUS * 2,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={handleTargetClick}
            />
          )}

          {clickEffects.map(effect => (
            <div
              key={effect.id}
              className="absolute rounded-full border-2 border-primary animate-ripple"
              style={{
                left: effect.x,
                top: effect.y,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          {gameState === 'idle' && (
            <div className="flex items-center justify-center h-full">
              <Button onClick={startGame}>Start</Button>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in">
              <h2 className="text-4xl font-bold">Finished!</h2>
              <p className="text-2xl mt-2">Total Time: {(totalTime / 1000).toFixed(2)}s</p>
              <p className="text-lg text-muted-foreground">Avg per target: {(totalTime / TOTAL_TARGETS).toFixed(0)}ms</p>
              <Button onClick={resetGame} className="mt-6">Restart</Button>
            </div>
          )}
        </div>
        
        {gameState === 'running' && (
          <div className="mt-4 text-2xl font-semibold">
            {targetsClicked} / {TOTAL_TARGETS}
          </div>
        )}
      </div>
    </Layout>
  );
}
