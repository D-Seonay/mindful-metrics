import { useState, useCallback, useRef, useEffect } from 'react';

export type GameMode = 'TIME_ATTACK' | 'PRECISION';
export type MovementType = 'STATIC' | 'LINEAR' | 'BOUNCE';

export interface GameConfig {
  mode: GameMode;
  duration: number; // For Time Attack (seconds)
  targetCount: number; // For Precision (number of targets)
  movement: MovementType;
  autoDismissTime: number; // Seconds (0 = infinite)
  targetSize: number;
}

export interface Target {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  createdAt: number;
  lifespan: number; // ms
}

export interface GameStats {
  score: number; // Targets hit
  totalClicks: number;
  startTime: number;
  endTime: number;
}

type GameState = 'IDLE' | 'PLAYING' | 'FINISHED';

const DEFAULT_CONFIG: GameConfig = {
  mode: 'TIME_ATTACK',
  duration: 30,
  targetCount: 20,
  movement: 'STATIC',
  autoDismissTime: 0,
  targetSize: 30,
};

export function useAimGame() {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [targets, setTargets] = useState<Target[]>([]);
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [stats, setStats] = useState<GameStats>({ score: 0, totalClicks: 0, startTime: 0, endTime: 0 });
  const [elapsedTime, setElapsedTime] = useState(0);

  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const gameAreaRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  const spawnTarget = useCallback(() => {
    const { width, height } = gameAreaRef.current;
    if (width === 0 || height === 0) return;

    const radius = config.targetSize;
    const padding = radius * 2;
    
    const x = Math.random() * (width - padding) + radius;
    const y = Math.random() * (height - padding) + radius;
    
    let vx = 0;
    let vy = 0;

    if (config.movement !== 'STATIC') {
      const speed = 100 + Math.random() * 100; // pixels per second
      const angle = Math.random() * Math.PI * 2;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    }

    const newTarget: Target = {
      id: Date.now() + Math.random(),
      x,
      y,
      vx,
      vy,
      radius,
      createdAt: performance.now(),
      lifespan: config.autoDismissTime * 1000,
    };

    setTargets(prev => [...prev, newTarget]);
  }, [config]);

  const startGame = useCallback((newConfig: Partial<GameConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
    setTargets([]);
    setStats({ score: 0, totalClicks: 0, startTime: 0, endTime: 0 }); // startTime initialized to 0
    setElapsedTime(0);
    setGameState('PLAYING');
    
    // Reset loop vars
    previousTimeRef.current = undefined; // Reset previousTimeRef to ensure accurate deltaTime on first frame
  }, []);

  const stopGame = useCallback(() => {
    setGameState('FINISHED');
    setStats(prev => ({ ...prev, endTime: performance.now() }));
    cancelAnimationFrame(requestRef.current!);
  }, []);

  const resetGame = useCallback(() => {
    setGameState('IDLE');
    setTargets([]);
    setStats({ score: 0, totalClicks: 0, startTime: 0, endTime: 0 });
    setElapsedTime(0);
  }, []);

  const clickTarget = useCallback((targetId: number) => {
    if (gameState !== 'PLAYING') return;

    setStats(prev => {
      const newStats = { ...prev, score: prev.score + 1, totalClicks: prev.totalClicks + 1 };
      if (newStats.startTime === 0) { // Start timer on first click
        newStats.startTime = performance.now();
      }
      // Win condition for Precision
      if (config.mode === 'PRECISION' && newStats.score >= config.targetCount) {
        stopGame();
      }
      return newStats;
    });

    setTargets(prev => prev.filter(t => t.id !== targetId));
  }, [gameState, config.mode, config.targetCount, stopGame]); // Removed stats.score from dependencies as it's updated within setStats

  const registerClick = useCallback(() => {
     if (gameState === 'PLAYING') {
         setStats(prev => {
            const newStats = { ...prev, totalClicks: prev.totalClicks + 1 };
            if (newStats.startTime === 0) { // Start timer on first click if it's a miss
                newStats.startTime = performance.now();
            }
            return newStats;
         });
     }
  }, [gameState]);

  const updateGame = useCallback((time: number) => {
    if (gameState !== 'PLAYING') return;

    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }
    const deltaTime = (time - previousTimeRef.current) / 1000; // seconds
    previousTimeRef.current = time;

    // Only update elapsed time if game has started (first target clicked)
    if (stats.startTime > 0) {
      setElapsedTime(prev => prev + deltaTime);
    }
    
    const now = performance.now();
    const currentDuration = (now - stats.startTime) / 1000;

    // Time Attack Limit
    if (config.mode === 'TIME_ATTACK' && stats.startTime > 0 && currentDuration >= config.duration) {
      stopGame();
      return;
    }

    setTargets(prevTargets => {
      const nextTargets = prevTargets.map(t => {
        // Lifespan check
        if (t.lifespan > 0 && now - t.createdAt > t.lifespan) {
          return null;
        }

        // Movement
        if (config.movement === 'STATIC') return t;

        const { x, y, vx, vy, radius } = t;
        const { width, height } = gameAreaRef.current;

        x += vx * deltaTime;
        y += vy * deltaTime;

        // Bounce Logic
        if (config.movement === 'BOUNCE') {
          if (x - radius <= 0) {
            x = radius;
            vx = -vx;
          } else if (x + radius >= width) {
            x = width - radius;
            vx = -vx;
          }

          if (y - radius <= 0) {
            y = radius;
            vy = -vy;
          } else if (y + radius >= height) {
            y = height - radius;
            vy = -vy;
          }
        } 
        // Linear Logic (Wrap around? Or disappear? Or Bounce off walls?)
        // Let's just bounce for Linear too if it hits edge, or strictly stick to "MovementType"
        // If movement is just LINEAR, maybe it goes off screen?
        // For gameplay, bouncing is usually better than losing targets offscreen.
        // Let's make LINEAR behave like bouncing for now to keep them on screen, 
        // or rename 'LINEAR' to 'DRIFT' which might go off screen. 
        // The prompt asked for "Linear, Random, or Bouncing". 
        // Let's implement Linear as "Move in a straight line, bounce on edge". 
        // "Random" could be "Change direction randomly".

        if (config.movement === 'LINEAR' || config.movement === 'BOUNCE') {
             // Basic boundary check to keep them in bounds
             if (x - radius <= 0 || x + radius >= width) vx = -vx;
             if (y - radius <= 0 || y + radius >= height) vy = -vy;
             
             // Clamp
             x = Math.max(radius, Math.min(x, width - radius));
             y = Math.max(radius, Math.min(y, height - radius));
        }

        return { ...t, x, y, vx, vy };
      }).filter(Boolean) as Target[];

      // Spawn Logic
      // Ensure there is always at least one target? 
      // Or spawn up to a limit?
      // For Time Attack: Keep X targets on screen (e.g., 3).
      // For Precision: Spawn 1 by 1?
      
      const maxTargetsOnScreen = config.mode === 'TIME_ATTACK' ? 3 : 1;
      
      if (nextTargets.length < maxTargetsOnScreen) {
        // We need to trigger a spawn. 
        // Since we are inside a setState, we can't easily call the spawnTarget function which uses refs/state.
        // We will handle spawning in a separate effect or return a flag?
        // Actually, we can just return the array and let a separate `useEffect` detect count < max.
      }

      return nextTargets;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, [gameState, config, stopGame, stats.startTime]);

  // Effect to manage the loop
  useEffect(() => {
    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(updateGame);
    } else {
      cancelAnimationFrame(requestRef.current!);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [gameState, updateGame]);

  // Effect to maintain target count
  useEffect(() => {
    if (gameState === 'PLAYING') {
       const maxTargets = config.mode === 'TIME_ATTACK' ? 5 : 1; // More targets for time attack frenzy
       if (targets.length < maxTargets) {
           spawnTarget();
       }
    }
  }, [targets.length, gameState, config.mode, spawnTarget]);

  return {
    gameState,
    targets,
    stats,
    elapsedTime,
    config,
    startGame,
    stopGame,
    resetGame,
    clickTarget,
    registerClick,
    setGameArea: (width: number, height: number) => { gameAreaRef.current = { width, height }; }
  };
}
