import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { oklchToString, OKLCHColor, calculateOKLCHDistance } from '@/lib/colorSensitivityUtils';
import { RotateCcw, Play, CheckCircle2, Trophy, ArrowRight, Brain, Zap } from 'lucide-react';
import { useSoundSystem } from '@/hooks/useSoundSystem';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PerformanceHistory, CircleMemoryResult } from '@/types/history';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

type GameState = 'idle' | 'memorize' | 'guess' | 'round_result' | 'result';
type Difficulty = 'easy' | 'normal' | 'elite';

const DIFFICULTY_SETTINGS = {
  easy: { memorizeTime: 15, rounds: 3, sensitivity: 1.5 },
  normal: { memorizeTime: 10, rounds: 5, sensitivity: 2.5 },
  elite: { memorizeTime: 5, rounds: 10, sensitivity: 4.0 }
};

const CircleMemoryTest: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [streak, setStreak] = useState(0);
  const [targetColor, setTargetColor] = useState<OKLCHColor>({ l: 0, c: 0, h: 0 });
  const [userGuessColor, setUserGuessColor] = useState<OKLCHColor>({ l: 0.5, c: 0.15, h: 180 });
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_SETTINGS.normal.memorizeTime);
  const [round, setRound] = useState(1);
  const [roundScores, setRoundScores] = useState<number[]>([]);
  const [currentRoundScore, setCurrentRoundScore] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const { playSound } = useSoundSystem();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hueSliderRef = useRef<HTMLButtonElement>(null);
  const chromaSliderRef = useRef<HTMLButtonElement>(null);
  const lightSliderRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const startRound = useCallback(() => {
    const newColor: OKLCHColor = {
      l: 0.5 + Math.random() * 0.3,
      c: 0.1 + Math.random() * 0.1,
      h: Math.random() * 360,
    };
    
    setTargetColor(newColor);
    setGameState('memorize');
    setTimeLeft(DIFFICULTY_SETTINGS[difficulty].memorizeTime);
    setUserGuessColor({ l: 0.6, c: 0.1, h: 180 });
    playSound('shoot');
  }, [playSound, difficulty]);

  const handleSkipMemorize = useCallback(() => {
    if (gameState !== 'memorize') return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setGameState('guess');
    playSound('type');
  }, [gameState, playSound]);

  const initGame = useCallback(() => {
    setRound(1);
    setRoundScores([]);
    setFinalScore(null);
    setStreak(0);
    startRound();
  }, [startRound]);

  const handleValidateRound = useCallback(() => {
    const distance = calculateOKLCHDistance(userGuessColor, targetColor);
    const sensitivity = DIFFICULTY_SETTINGS[difficulty].sensitivity;
    const score = Math.max(0, Math.round(100 - (distance * sensitivity)));
    
    setCurrentRoundScore(score);
    setRoundScores(prev => [...prev, score]);
    setGameState('round_result');
    
    if (score >= 95) {
      setStreak(prev => prev + 1);
      playSound('hit');
    } else if (score >= 80) {
      setStreak(0);
      playSound('hit');
    } else if (score < 40) {
      setStreak(0);
      playSound('error');
    } else {
      setStreak(0);
      playSound('type');
    }
  }, [userGuessColor, targetColor, difficulty, playSound]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && gameState === 'memorize') {
        e.preventDefault();
        handleSkipMemorize();
      }
      if (e.key === 'Enter' && gameState === 'guess') {
        e.preventDefault();
        handleValidateRound();
      }
      if (gameState === 'guess') {
        if (e.key === '1') {
          hueSliderRef.current?.focus();
        }
        if (e.key === '2') {
          chromaSliderRef.current?.focus();
        }
        if (e.key === '3') {
          lightSliderRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleSkipMemorize, handleValidateRound]);

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

  const handleNextRound = () => {
    if (round < DIFFICULTY_SETTINGS[difficulty].rounds) {
      setRound(prev => prev + 1);
      startRound();
    } else {
      const average = Math.round(roundScores.reduce((a, b) => a + b, 0) / DIFFICULTY_SETTINGS[difficulty].rounds);
      setFinalScore(average);
      setGameState('result');
      saveFinalResult(average);
    }
  };

  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-full h-[600px] rounded-[3rem] border border-border/50 bg-secondary/10 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* HUD */}
      <div className="w-full flex justify-between items-center mb-12">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Session</span>
          <span className="text-xl font-bold uppercase tracking-tight text-primary">
            {gameState === 'idle' ? 'Prêt ?' : `Manche ${round} / ${DIFFICULTY_SETTINGS[difficulty].rounds}`}
          </span>
        </div>
        
        <AnimatePresence mode="wait">
          {gameState === 'memorize' && (
            <motion.div 
              key="timer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-end"
            >
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Mémorisation</span>
              <span className={cn(
                "text-3xl font-bold tabular-nums",
                timeLeft <= 3 ? "text-destructive animate-pulse" : "text-primary"
              )}>
                {timeLeft}s
              </span>
            </motion.div>
          )}

          {(gameState === 'guess' || gameState === 'round_result') && (
            <motion.div 
              key="score"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-end"
            >
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Score Manche</span>
              <div className="flex items-center gap-3">
                {streak > 1 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                    <Zap className="h-3 w-3 fill-current" /> x{streak}
                  </div>
                )}
                <span className="text-3xl font-bold text-amber-500 tabular-nums">
                  {gameState === 'round_result' ? `${currentRoundScore}%` : '--'}
                </span>
              </div>
            </motion.div>
          )}

          {gameState === 'result' && (
            <motion.div 
              key="final"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-end"
            >
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Moyenne Finale</span>
              <span className="text-3xl font-bold text-primary tabular-nums">
                {finalScore}/100
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={cn(
        "w-full rounded-[3rem] border border-border/50 bg-background/30 backdrop-blur-md p-8 md:p-16 mb-12 transition-all duration-700 min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden",
        gameState === 'memorize' && "border-primary/40 shadow-[0_0_80px_rgba(var(--primary),0.08)]",
        gameState === 'guess' && "border-amber-500/30",
      )}>
        <AnimatePresence mode="wait">
          {gameState === 'idle' ? (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="text-center"
            >
              <Brain className="h-20 w-20 text-primary/40 mx-auto mb-8" strokeWidth={1.5} />
              
              <div className="flex flex-col gap-8 items-center">
                <div className="flex gap-2 p-1 bg-secondary/50 rounded-full border border-border">
                  {(['easy', 'normal', 'elite'] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        "px-6 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all",
                        difficulty === d 
                          ? "bg-primary text-primary-foreground font-bold shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {d === 'easy' ? 'Facile' : d === 'normal' ? 'Normal' : 'Élite'}
                    </button>
                  ))}
                </div>

                <Button onClick={initGame} size="lg" className="rounded-full px-12 h-16 font-mono text-lg uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform">
                  Démarrer le Test
                </Button>
              </div>

              <p className="mt-8 text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] max-w-xs mx-auto leading-loose">
                {DIFFICULTY_SETTINGS[difficulty].rounds} couleurs à mémoriser. Reproduisez-les le plus fidèlement possible.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
            
            {/* The Big Circle */}
            <div className="relative mb-16">
              <div 
                className={cn(
                  "w-48 h-48 md:w-64 md:h-64 rounded-full border-8 transition-all duration-500 shadow-2xl",
                  gameState === 'memorize' ? "scale-110 border-white/20" : "border-border/50"
                )}
                style={{ 
                  backgroundColor: gameState === 'memorize' || gameState === 'round_result' 
                    ? oklchToString(targetColor) 
                    : gameState === 'guess' 
                      ? oklchToString(userGuessColor) 
                      : 'transparent'
                }}
              />
              {gameState === 'round_result' && (
                <div 
                  className="absolute -right-4 -bottom-4 w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-background shadow-2xl animate-in slide-in-from-right-4 duration-500"
                  style={{ backgroundColor: oklchToString(userGuessColor) }}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-[inherit]">
                    <span className="text-[10px] font-mono text-white uppercase tracking-tighter">Votre Essai</span>
                  </div>
                </div>
              )}
            </div>

            {/* Skip Memorization Button */}
            {gameState === 'memorize' && (
              <div className="flex flex-col items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleSkipMemorize}
                  className="rounded-full px-8 h-12 font-mono text-[10px] uppercase tracking-[0.2em] border-primary/30 hover:bg-primary/10 transition-all duration-300 group"
                >
                  <Brain className="mr-2 h-3.5 w-3.5 text-primary/60 group-hover:text-primary" />
                  Passer la mémorisation
                </Button>
                <div className="flex items-center gap-2 text-[8px] font-mono text-muted-foreground uppercase tracking-widest opacity-50">
                  Appuyez sur <span className="px-1.5 py-0.5 rounded border border-border bg-secondary/30 text-foreground font-bold">Espace</span>
                </div>
              </div>
            )}

            {/* Guess Phase Controls */}
            {gameState === 'guess' && (
              <div className="w-full max-w-md space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-center gap-2">
                    {[0, 45, 120, 180, 240, 300].map(h => (
                      <button
                        key={h}
                        onClick={() => setUserGuessColor(prev => ({ ...prev, h }))}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all hover:scale-110 shadow-sm",
                          Math.abs(userGuessColor.h - h) < 1 ? "border-primary scale-110" : "border-transparent"
                        )}
                        style={{ backgroundColor: `oklch(0.6 0.15 ${h})` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-6">
                  {[
                    { label: 'Teinte', value: userGuessColor.h, max: 360, step: 1, unit: '°', key: 'h', ref: hueSliderRef, gradient: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' },
                    { label: 'Chroma', value: userGuessColor.c, max: 0.4, step: 0.01, unit: '', key: 'c', ref: chromaSliderRef, gradient: `linear-gradient(to right, oklch(0.6 0 ${userGuessColor.h}), oklch(0.6 0.4 ${userGuessColor.h}))` },
                    { label: 'Luminosité', value: userGuessColor.l, max: 1, step: 0.01, unit: '', key: 'l', ref: lightSliderRef, gradient: `linear-gradient(to right, #000000, oklch(0.5 ${userGuessColor.c} ${userGuessColor.h}), #ffffff)` }
                  ].map((s) => (
                    <div key={s.label} className="space-y-3">
                      <div className="flex justify-between items-center font-mono">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</span>
                        <span className="text-xs font-bold text-primary">
                          {s.key === 'h' ? Math.round(s.value) : s.value.toFixed(2)}
                          {s.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <div className="absolute inset-0 h-1 top-1/2 -translate-y-1/2 rounded-full opacity-20" style={{ background: s.gradient }} />
                          <Slider 
                            ref={s.ref}
                            value={[s.value]} max={s.max} step={s.step} 
                            onValueChange={([val]) => setUserGuessColor(prev => ({ ...prev, [s.key as 'h' | 'c' | 'l']: val }))}
                            className="cursor-pointer relative z-10"
                          />
                        </div>
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
              <div className="text-center w-full max-w-sm">
                <div className="bg-secondary/20 rounded-3xl p-6 mb-8 border border-border/50">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Résultat Manche {round}</p>
                  <p className="text-4xl font-black font-mono text-primary mb-1">{currentRoundScore}%</p>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">Précision chromatique</p>
                </div>
                
                <Button onClick={handleNextRound} className="w-full rounded-full h-14 font-mono uppercase tracking-widest shadow-lg">
                  {round < DIFFICULTY_SETTINGS[difficulty].rounds ? "Manche Suivante" : "Voir le Score Final"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Final Result Phase */}
            {gameState === 'result' && (
              <div className="text-center w-full max-w-md">
                <Trophy className={cn("h-16 w-16 mx-auto mb-6", (finalScore || 0) > 85 ? "text-yellow-500" : "text-muted-foreground/40")} />
                <h2 className="text-3xl font-black font-mono uppercase mb-2">Score Final</h2>
                <p className="text-6xl font-black font-mono text-primary mb-8">{finalScore}%</p>
                
                <div className="grid grid-cols-5 gap-2 mb-10">
                  {roundScores.map((s, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="h-12 w-full bg-secondary/30 rounded-lg relative overflow-hidden border border-border/50">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${s}%` }}
                          transition={{ delay: i * 0.1, duration: 1 }}
                          className="absolute bottom-0 left-0 right-0 bg-primary/40" 
                        />
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
          </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full flex justify-center items-center gap-12 text-[9px] font-mono text-muted-foreground/50 uppercase tracking-[0.3em]">
        <span className="flex items-center gap-2">{DIFFICULTY_SETTINGS[difficulty].rounds} Manches</span>
        <span className="flex items-center gap-2">OKLCH Perception</span>
        <span className="flex items-center gap-2">Difficulté {difficulty}</span>
      </div>
    </div>
  );
};

export default CircleMemoryTest;
