import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { hslToString, HSLColor } from '@/lib/colorSensitivityUtils';
import { RotateCcw, Play, CheckCircle2, Trophy, ArrowRight, Brain } from 'lucide-react';
import { useSoundSystem } from '@/hooks/useSoundSystem';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PerformanceHistory, CircleMemoryResult } from '@/types/history';
import { useToast } from '@/hooks/use-toast';

type GameState = 'idle' | 'memorize' | 'guess' | 'round_result' | 'result';

const MEMORIZE_DURATION = 10;
const TOTAL_ROUNDS = 5;

const CircleMemoryTest: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [targetColor, setTargetColor] = useState<HSLColor>({ h: 0, s: 0, l: 0 });
  const [userGuessColor, setUserGuessColor] = useState<HSLColor>({ h: 180, s: 50, l: 50 });
  const [timeLeft, setTimeLeft] = useState(MEMORIZE_DURATION);
  const [round, setRound] = useState(1);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [currentRoundScore, setCurrentRoundScore] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  
  const { playSound } = useSoundSystem();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [history, setHistory] = useLocalStorage<PerformanceHistory>('performance-history', {
    reflex: [],
    typing: [],
    timePerception: [],
    aimTrainer: [],
    colorSensitivity: [],
    colorMemory: [],
    circleMemory: [],
    peripheralVision: [],
  });

  const startRound = useCallback(() => {
    const newColor: HSLColor = {
      h: Math.floor(Math.random() * 360),
      s: Math.floor(Math.random() * 40) + 40,
      l: Math.floor(Math.random() * 30) + 35,
    };
    
    setTargetColor(newColor);
    setGameState('memorize');
    setTimeLeft(MEMORIZE_DURATION);
    setUserGuessColor({ h: 180, s: 50, l: 50 });
    playSound('shoot');
  }, [playSound]);

  const initGame = useCallback(() => {
    setRound(1);
    setRoundScores([]);
    setFinalScore(null);
    startRound();
  }, [startRound]);

  useEffect(() => {
    if (gameState === 'memorize' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (gameState === 'memorize' && timeLeft === 0) {
      setGameState('guess');
      playSound('type');
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, timeLeft, playSound]);

  const calculateScore = () => {
    const hDiff = Math.min(
      Math.abs(userGuessColor.h - targetColor.h),
      360 - Math.abs(userGuessColor.h - targetColor.h)
    );
    const sDiff = Math.abs(userGuessColor.s - targetColor.s);
    const lDiff = Math.abs(userGuessColor.l - targetColor.l);

    const normalizedH = hDiff / 1.8;
    const normalizedS = sDiff;
    const normalizedL = lDiff;

    const avgDistance = (normalizedH + normalizedS + normalizedL) / 3;
    return Math.max(0, Math.round(100 - avgDistance));
  };

  const saveFinalResult = (average: number) => {
    const newResult: CircleMemoryResult = {
      id: Date.now().toString(),
      score: average,
      date: new Date().toISOString(),
    };

    setHistory((prev) => ({
      ...prev,
      circleMemory: [newResult, ...(prev.circleMemory || [])].slice(0, 10),
    }));

    if (average > 90) {
      toast({
        title: "EXCEPTIONNEL !",
        description: `Moyenne finale : ${average}/100`,
      });
    }
  };

  const handleValidateRound = () => {
    const score = calculateScore();
    setCurrentRoundScore(score);
    setRoundScores(prev => [...prev, score]);
    setGameState('round_result');
    
    if (score > 80) playSound('hit');
    else if (score < 40) playSound('error');
    else playSound('type');
  };

  const handleNextRound = () => {
    if (round < TOTAL_ROUNDS) {
      setRound(prev => prev + 1);
      startRound();
    } else {
      const average = Math.round(roundScores.reduce((a, b) => a + b, 0) / TOTAL_ROUNDS);
      setFinalScore(average);
      setGameState('result');
      saveFinalResult(average);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* HUD */}
      <div className="w-full flex justify-between items-center mb-12 font-mono">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Session</span>
          <span className="text-xl font-bold uppercase tracking-tight text-primary">
            {gameState === 'idle' ? 'Prêt ?' : `Manche ${round} / ${TOTAL_ROUNDS}`}
          </span>
        </div>
        
        {gameState === 'memorize' && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Mémorisation</span>
            <span className={cn(
              "text-3xl font-bold tabular-nums",
              timeLeft <= 3 ? "text-destructive animate-pulse" : "text-primary"
            )}>
              {timeLeft}s
            </span>
          </div>
        )}

        {(gameState === 'guess' || gameState === 'round_result') && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Score Manche</span>
            <span className="text-3xl font-bold text-amber-500 tabular-nums">
              {gameState === 'round_result' ? `${currentRoundScore}%` : '--'}
            </span>
          </div>
        )}

        {gameState === 'result' && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Moyenne Finale</span>
            <span className="text-3xl font-bold text-primary tabular-nums">
              {finalScore}/100
            </span>
          </div>
        )}
      </div>

      <div className={cn(
        "w-full rounded-[3rem] border border-border/50 bg-background/30 backdrop-blur-md p-8 md:p-16 mb-12 transition-all duration-700 min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden",
        gameState === 'memorize' && "border-primary/40 shadow-[0_0_80px_rgba(var(--primary),0.08)]",
        gameState === 'guess' && "border-amber-500/30",
      )}>
        
        {gameState === 'idle' ? (
          <div className="text-center animate-in fade-in zoom-in duration-700">
            <Brain className="h-20 w-20 text-primary/40 mx-auto mb-8" strokeWidth={1.5} />
            <Button onClick={initGame} size="lg" className="rounded-full px-12 h-16 font-mono text-lg uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform">
              Démarrer le Test
            </Button>
            <p className="mt-8 text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] max-w-xs mx-auto leading-loose">
              5 couleurs à mémoriser. Reproduisez-les le plus fidèlement possible.
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            
            {/* The Big Circle */}
            <div className="relative mb-16">
              <div 
                className={cn(
                  "w-48 h-48 md:w-64 md:h-64 rounded-full border-8 transition-all duration-500 shadow-2xl",
                  gameState === 'memorize' ? "scale-110 border-white/20" : "border-border/50"
                )}
                style={{ 
                  backgroundColor: gameState === 'memorize' || gameState === 'round_result' 
                    ? hslToString(targetColor) 
                    : gameState === 'guess' 
                      ? hslToString(userGuessColor) 
                      : 'transparent'
                }}
              />
              {gameState === 'round_result' && (
                <div 
                  className="absolute -right-4 -bottom-4 w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-background shadow-2xl animate-in slide-in-from-right-4 duration-500"
                  style={{ backgroundColor: hslToString(userGuessColor) }}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-[inherit]">
                    <span className="text-[10px] font-mono text-white uppercase tracking-tighter">Votre Essai</span>
                  </div>
                </div>
              )}
            </div>

            {/* Guess Phase Controls */}
            {gameState === 'guess' && (
              <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="space-y-3">
                  <div className="flex justify-center gap-2">
                    {[0, 45, 120, 180, 240, 300].map(h => (
                      <button
                        key={h}
                        onClick={() => setUserGuessColor(prev => ({ ...prev, h }))}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shadow-sm",
                          userGuessColor.h === h ? "border-primary scale-110" : "border-transparent"
                        )}
                        style={{ backgroundColor: `hsl(${h}, 80%, 50%)` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-6">
                  {[
                    { label: 'Teinte', value: userGuessColor.h, max: 360, unit: '°', key: 'h', gradient: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' },
                    { label: 'Saturation', value: userGuessColor.s, max: 100, unit: '%', key: 's', gradient: `linear-gradient(to right, #808080, ${hslToString({ ...userGuessColor, s: 100 })})` },
                    { label: 'Luminosité', value: userGuessColor.l, max: 100, unit: '%', key: 'l', gradient: `linear-gradient(to right, #000000, ${hslToString({ ...userGuessColor, l: 50 })}, #ffffff)` }
                  ].map((s) => (
                    <div key={s.label} className="space-y-3">
                      <div className="flex justify-between items-center font-mono">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</span>
                        <span className="text-xs font-bold text-primary">{s.value}{s.unit}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="outline" size="icon" className="h-7 w-7 rounded-full"
                          onClick={() => setUserGuessColor(prev => ({ ...prev, [s.key]: Math.max(0, (prev[s.key as 'h'|'s'|'l']) - 1) }))}
                        > - </Button>
                        <div className="relative flex-1">
                          <div className="absolute inset-0 h-1 top-1/2 -translate-y-1/2 rounded-full opacity-20" style={{ background: s.gradient }} />
                          <Slider 
                            value={[s.value]} max={s.max} step={1} 
                            onValueChange={([val]) => setUserGuessColor(prev => ({ ...prev, [s.key as 'h' | 's' | 'l']: val }))}
                            className="cursor-pointer relative z-10"
                          />
                        </div>
                        <Button 
                          variant="outline" size="icon" className="h-7 w-7 rounded-full"
                          onClick={() => setUserGuessColor(prev => ({ ...prev, [s.key]: Math.min(s.max, (prev[s.key as 'h'|'s'|'l']) + 1) }))}
                        > + </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleValidateRound} 
                  className="w-full rounded-full h-14 font-mono uppercase tracking-[0.2em] shadow-xl bg-primary text-primary-foreground"
                >
                  Valider la Manche
                </Button>
              </div>
            )}

            {/* Round Result Phase */}
            {gameState === 'round_result' && (
              <div className="text-center animate-in zoom-in duration-500 w-full max-w-sm">
                <div className="bg-secondary/20 rounded-3xl p-6 mb-8 border border-border/50">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Résultat Manche {round}</p>
                  <p className="text-4xl font-black font-mono text-primary mb-1">{currentRoundScore}%</p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">Précision chromatique</p>
                </div>
                
                <Button onClick={handleNextRound} className="w-full rounded-full h-14 font-mono uppercase tracking-widest shadow-lg">
                  {round < TOTAL_ROUNDS ? "Manche Suivante" : "Voir le Score Final"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Final Result Phase */}
            {gameState === 'result' && (
              <div className="text-center animate-in zoom-in duration-700 w-full max-w-md">
                <Trophy className={cn("h-16 w-16 mx-auto mb-6", finalScore! > 85 ? "text-yellow-500" : "text-muted-foreground/40")} />
                <h2 className="text-3xl font-black font-mono uppercase mb-2">Score Final</h2>
                <p className="text-6xl font-black font-mono text-primary mb-8">{finalScore}%</p>
                
                <div className="grid grid-cols-5 gap-2 mb-10">
                  {roundScores.map((s, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="h-12 w-full bg-secondary/30 rounded-lg relative overflow-hidden border border-border/50">
                        <div className="absolute bottom-0 left-0 right-0 bg-primary/40 transition-all duration-1000" style={{ height: `${s}%` }} />
                      </div>
                      <span className="text-[8px] font-mono text-muted-foreground uppercase">M{i+1}</span>
                    </div>
                  ))}
                </div>

                <Button onClick={initGame} variant="outline" className="rounded-full px-12 h-14 font-mono uppercase tracking-widest hover:bg-secondary">
                  <RotateCcw className="h-4 w-4 mr-2" /> Recommencer
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full flex justify-center items-center gap-12 text-[9px] font-mono text-muted-foreground/50 uppercase tracking-[0.3em]">
        <span className="flex items-center gap-2">5 Manches</span>
        <span className="flex items-center gap-2">Calcul de Moyenne</span>
        <span className="flex items-center gap-2">Score / 100</span>
      </div>
    </div>
  );
};

export default CircleMemoryTest;
