import { useState, useCallback, useRef, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAimGame, GameMode, MovementType } from '@/hooks/useAimGame';
import { useSoundSystem } from '@/hooks/useSoundSystem';
import type { PerformanceHistory, AimTrainerResult } from '@/types/history';
import { Clock, Crosshair } from 'lucide-react';
import { SubmitScoreModal } from '@/components/SubmitScoreModal';

const initialHistory: PerformanceHistory = {
  reflex: [],
  typing: [],
  timePerception: [],
  aimTrainer: [],
};

export default function AimTrainer() {
  const [history, setHistory] = useLocalStorage<PerformanceHistory>('performance-history', initialHistory);
  const [clickEffects, setClickEffects] = useState<{x: number, y: number, id: number}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSoundSystem();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [displayElapsedTime, setDisplayElapsedTime] = useState(0); // State for displaying elapsed time
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null); // Ref for timer interval ID

  // Local state for menu configuration
  const [movement, setMovement] = useState<MovementType>('STATIC');
  const [autoDismiss, setAutoDismiss] = useState<string>("0");

  const {
    gameState,
    targets,
    stats,
    config,
    startGame,
    stopGame,
    resetGame,
    clickTarget,
    registerClick,
    setGameArea
  } = useAimGame();

  // Initialize game area size
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

  // Effect to manage the display timer
  useEffect(() => {
    if (gameState === 'PLAYING' && stats.startTime > 0) {
      // Clear any existing interval to prevent double timers
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      const interval = setInterval(() => {
        setDisplayElapsedTime((performance.now() - stats.startTime) / 1000);
      }, 10); // Update every 10ms for high precision
      timerIntervalRef.current = interval;
    } else {
      // Clear interval when not playing or before game starts
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setDisplayElapsedTime(0); // Reset display time
    }

    return () => {
      // Cleanup on unmount
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [gameState, stats.startTime]); // Depend on gameState and stats.startTime

  // Save history when game finishes
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
    
    // Play sounds for Miss
    playSound('shoot');
    playSound('miss');

    // Calculate relative coordinates
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Register click for stats
    registerClick();

    // Visual effect
    const newEffect = { x, y, id: Date.now() };
    setClickEffects(prev => [...prev, newEffect]);
    setTimeout(() => {
      setClickEffects(prev => prev.filter(ef => ef.id !== newEffect.id));
    }, 500);
  };

  const handleTargetPointerDown = (e: React.PointerEvent<HTMLDivElement>, targetId: number) => {
    e.stopPropagation(); // Stop bubbling to container (prevents "Miss" logic)
    
    // Play sounds for Hit
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

  const handleStartTimeAttack = () => {
      startGame({ 
          mode: 'TIME_ATTACK', 
          movement: movement, 
          autoDismissTime: Number(autoDismiss), 
          duration: 30 
      });
  };

  const handleStartPrecision = () => {
      startGame({ 
          mode: 'PRECISION', 
          movement: 'STATIC', // Enforced static for precision for now, or could use same state
          targetCount: 20 
      });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const secondsFormatted = Math.floor(remainingSeconds);
    const millisecondsFormatted = Math.floor((remainingSeconds - secondsFormatted) * 100)
      .toString()
      .padStart(2, '0');
    
    return `${minutes.toString().padStart(2, '0')}:${secondsFormatted.toString().padStart(2, '0')}.${millisecondsFormatted}`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Aim Trainer</h1>
          <div className="flex items-center gap-4">
             {gameState === 'PLAYING' && (
                <div className="flex gap-4 text-xl font-mono mr-4">
                   {config.mode === 'TIME_ATTACK' ? (
                      <span>Time: {formatTime(Math.max(0, config.duration - displayElapsedTime))}</span>
                   ) : (
                      <span>Time: {formatTime(displayElapsedTime)}</span>
                   )}
                   <span>Score: {stats.score}</span>
                </div>
             )}
          </div>
        </div>

        <div className="flex-1 relative">
           {gameState === 'IDLE' && (
             <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl text-center">Choisir un mode de jeu</CardTitle>
                    <CardDescription className="text-center">Améliorez vos réflexes et votre précision</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="TIME_ATTACK" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="TIME_ATTACK" className="flex gap-2">
                           <Clock className="w-4 h-4" /> Time Attack
                        </TabsTrigger>
                        <TabsTrigger value="PRECISION" className="flex gap-2">
                           <Crosshair className="w-4 h-4" /> Precision Run
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="TIME_ATTACK" className="space-y-4">
                         <div className="text-center mb-6 text-muted-foreground">
                            Touchez le maximum de cibles en 30 secondes.
                         </div>
                         <div className="grid grid-cols-2 gap-4 mb-6">
                             <div className="space-y-2">
                                <Label>Mouvement</Label>
                                <Select onValueChange={(v) => setMovement(v as MovementType)} defaultValue="STATIC">
                                   <SelectTrigger><SelectValue placeholder="Statique" /></SelectTrigger>
                                   <SelectContent>
                                      <SelectItem value="STATIC">Statique</SelectItem>
                                      <SelectItem value="LINEAR">Linéaire</SelectItem>
                                      <SelectItem value="BOUNCE">Rebond</SelectItem>
                                   </SelectContent>
                                </Select>
                             </div>
                             <div className="space-y-2">
                                <Label>Disparition Auto</Label>
                                <Select onValueChange={setAutoDismiss} defaultValue="0">
                                   <SelectTrigger><SelectValue placeholder="Jamais" /></SelectTrigger>
                                   <SelectContent>
                                      <SelectItem value="0">Jamais</SelectItem>
                                      <SelectItem value="2">2 secondes</SelectItem>
                                      <SelectItem value="1">1 seconde</SelectItem>
                                      <SelectItem value="0.5">0.5 seconde</SelectItem>
                                   </SelectContent>
                                </Select>
                             </div>
                         </div>
                         <div className="flex justify-center pt-4">
                            <Button className="w-full md:w-1/2" onClick={handleStartTimeAttack}>
                               Démarrer Time Attack
                            </Button>
                         </div>
                      </TabsContent>

                      <TabsContent value="PRECISION" className="space-y-4">
                         <div className="text-center mb-6 text-muted-foreground">
                            Éliminez 20 cibles le plus vite possible.
                         </div>
                         <div className="flex justify-center">
                            <Button className="w-full md:w-1/2" onClick={handleStartPrecision}>
                               Démarrer Precision Run
                            </Button>
                         </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
             </div>
           )}

           {gameState === 'FINISHED' && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 backdrop-blur-md">
                 <div className="text-center space-y-6 animate-in zoom-in-50 duration-300">
                    <h2 className="text-5xl font-black text-primary">Terminé !</h2>
                    <div className="grid grid-cols-3 gap-8 text-center">
                       <div>
                          <div className="text-sm text-muted-foreground uppercase tracking-wider">Score</div>
                          <div className="text-4xl font-bold">{stats.score}</div>
                       </div>
                       <div>
                          <div className="text-sm text-muted-foreground uppercase tracking-wider">Précision</div>
                          <div className="text-4xl font-bold">{stats.totalClicks > 0 ? Math.round((stats.score / stats.totalClicks) * 100) : 0}%</div>
                       </div>
                       <div>
                          <div className="text-sm text-muted-foreground uppercase tracking-wider">Temps</div>
                          <div className="text-4xl font-bold">{((stats.endTime - stats.startTime) / 1000).toFixed(2)}s</div>
                       </div>
                    </div>
                    <Button size="lg" onClick={resetGame} className="mt-8">
                       Rejouer
                    </Button>
                 </div>
              </div>
           )}

           <div 
             ref={containerRef}
             className="w-full h-full bg-secondary/20 rounded-xl overflow-hidden relative cursor-crosshair border border-border/50 shadow-inner touch-none"
             onPointerDown={handleContainerPointerDown}
           >
              {targets.map(target => (
                 <div
                   key={target.id}
                   className={cn(
                     "absolute rounded-full shadow-lg transition-transform active:scale-95",
                     "bg-gradient-to-br from-primary to-primary/80 border-2 border-primary-foreground/20"
                   )}
                   style={{
                      left: target.x,
                      top: target.y,
                      width: target.radius * 2,
                      height: target.radius * 2,
                      transform: 'translate(-50%, -50%)',
                   }}
                   onPointerDown={(e) => handleTargetPointerDown(e, target.id)}
                 />
              ))}

              {clickEffects.map(effect => (
                <div
                  key={effect.id}
                  className="absolute rounded-full border-2 border-primary/50 pointer-events-none animate-ripple"
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
