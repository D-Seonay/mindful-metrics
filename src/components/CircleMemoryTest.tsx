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
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center bg-zinc-950 text-zinc-100 font-mono">
        <div className="w-full h-[600px] rounded-none border border-zinc-800 bg-zinc-900/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center bg-zinc-950 text-zinc-100 font-mono min-h-screen py-12 px-4 selection:bg-zinc-100 selection:text-zinc-950">
      {/* HUD */}
      <div className="w-full flex justify-between items-end mb-16 px-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">System.Session</span>
          <span className="text-2xl font-black uppercase italic">
            {gameState === 'idle' ? 'Ready_To_Sync' : `Phase.0${round}_OF_0${DIFFICULTY_SETTINGS[difficulty].rounds}`}
          </span>
        </div>
        
        <AnimatePresence mode="wait">
          {gameState === 'memorize' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-end gap-1"
            >
              <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">Mem.Buffer.TTL</span>
              <span className={cn(
                "text-4xl font-black tabular-nums italic",
                timeLeft <= 3 ? "text-red-500 animate-pulse" : "text-zinc-100"
              )}>
                {timeLeft.toString().padStart(2, '0')}s
              </span>
            </motion.div>
          )}

          {(gameState === 'guess' || gameState === 'round_result') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-end gap-1"
            >
              <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">Match.Accuracy</span>
              <div className="flex items-center gap-4">
                {streak > 1 && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 px-3 py-1 bg-zinc-100 text-zinc-950 font-black italic text-[10px]"
                  >
                    <Zap className="h-3 w-3 fill-current" />
                    HOT.x{streak}
                  </motion.div>
                )}
                <span className="text-4xl font-black tabular-nums italic">
                  {gameState === 'round_result' ? `${currentRoundScore}%` : '??%'}
                </span>
              </div>
            </motion.div>
          )}

          {gameState === 'result' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-end gap-1"
            >
              <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">Final.Average</span>
              <span className="text-4xl font-black italic">
                {finalScore}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        layout
        className={cn(
          "w-full border border-zinc-800 bg-zinc-900/20 p-8 md:p-16 mb-16 transition-colors duration-1000 min-h-[600px] flex flex-col items-center justify-center relative",
          gameState === 'memorize' && "border-zinc-700 bg-zinc-900/40",
          streak > 2 && "ring-1 ring-zinc-700 ring-offset-8 ring-offset-zinc-950 shadow-[0_0_100px_rgba(255,255,255,0.02)]"
        )}
      >
        <AnimatePresence mode="wait">
          {gameState === 'idle' ? (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="text-center"
            >
              <div className="relative mb-12">
                <Brain className="h-24 w-24 text-zinc-800 mx-auto" strokeWidth={1} />
                <motion.div 
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 bg-zinc-100/5 blur-3xl rounded-full"
                />
              </div>

              <div className="flex flex-col gap-12 items-center">
                <div className="flex gap-4 p-2 bg-zinc-900 border border-zinc-800">
                  {(['easy', 'normal', 'elite'] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        "px-8 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-all",
                        difficulty === d 
                          ? "bg-zinc-100 text-zinc-950 font-black" 
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                
                <Button 
                  onClick={initGame} 
                  className="rounded-none px-16 h-20 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-black text-xl uppercase tracking-[0.3em] transition-all"
                >
                  START_LINK
                </Button>
              </div>

              <div className="mt-16 space-y-4 max-w-sm mx-auto">
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] leading-relaxed">
                  Buffer: {DIFFICULTY_SETTINGS[difficulty].rounds} Samples<br />
                  TTL: {DIFFICULTY_SETTINGS[difficulty].memorizeTime}s / Sample<br />
                  Metric: OKLCH.Distance
                </p>
                <div className="h-px w-8 bg-zinc-800 mx-auto" />
                <p className="text-[9px] text-zinc-600 italic">
                  Reproduce the target color from memory using the H-C-L parameters.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="active-game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
            
            {/* The Big Circle */}
            <div className="relative mb-16">
              <motion.div 
                layout
                className={cn(
                  "w-48 h-48 md:w-64 md:h-64 border-8 transition-colors duration-500",
                  gameState === 'memorize' ? "border-zinc-100/10" : "border-zinc-800"
                )}
                style={{ 
                  backgroundColor: gameState === 'memorize' || gameState === 'round_result' 
                    ? oklchToString(targetColor) 
                    : gameState === 'guess' 
                      ? oklchToString(userGuessColor) 
                      : 'transparent'
                }}
              >
                {streak > 2 && (
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 border-4 border-zinc-100 opacity-20 blur-md"
                  />
                )}
              </motion.div>

              <AnimatePresence>
                {gameState === 'round_result' && (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="absolute -right-8 -bottom-8 w-24 h-24 md:w-32 md:h-32 border-4 border-zinc-950 bg-zinc-900 shadow-2xl overflow-hidden"
                    style={{ backgroundColor: oklchToString(userGuessColor) }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/40">
                      <span className="text-[10px] font-black text-zinc-100 uppercase italic tracking-tighter">USER_INPUT</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Skip Memorization Button */}
            <AnimatePresence>
              {gameState === 'memorize' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center gap-6"
                >
                  <Button 
                    variant="outline" 
                    onClick={handleSkipMemorize}
                    className="rounded-none px-12 h-14 font-mono text-[10px] uppercase tracking-[0.3em] border-zinc-800 hover:bg-zinc-100 hover:text-zinc-950 transition-all group"
                  >
                    SKIP_BUFFER_MEM
                  </Button>
                  <div className="flex items-center gap-3 text-[9px] text-zinc-600 uppercase tracking-widest">
                    <span>Press</span>
                    <span className="px-2 py-1 border border-zinc-800 bg-zinc-900 text-zinc-400 font-bold">SPACE</span>
                    <span>To_Skip</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Guess Phase Controls */}
            <AnimatePresence>
              {gameState === 'guess' && (
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  className="w-full max-w-md space-y-12"
                >
                  <div className="space-y-4">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em]">Quick.Select.Hue</span>
                    <div className="flex justify-between gap-2">
                      {[0, 45, 120, 180, 240, 300].map(h => (
                        <button
                          key={h}
                          onClick={() => setUserGuessColor(prev => ({ ...prev, h }))}
                          className={cn(
                            "w-8 h-8 border-2 transition-all hover:scale-110",
                            Math.abs(userGuessColor.h - h) < 1 ? "border-zinc-100 scale-110" : "border-transparent"
                          )}
                          style={{ backgroundColor: `oklch(0.6 0.15 ${h})` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-10">
                    {[
                      { label: 'HUE_PARAM', value: userGuessColor.h, max: 360, step: 1, unit: '°', key: 'h', ref: hueSliderRef, gradient: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)', shortcut: '1' },
                      { label: 'CHROMA_VAL', value: userGuessColor.c, max: 0.4, step: 0.01, unit: '', key: 'c', ref: chromaSliderRef, gradient: `linear-gradient(to right, oklch(0.6 0 ${userGuessColor.h}), oklch(0.6 0.4 ${userGuessColor.h}))`, shortcut: '2' },
                      { label: 'LIGHT_SENSE', value: userGuessColor.l, max: 1, step: 0.01, unit: '', key: 'l', ref: lightSliderRef, gradient: `linear-gradient(to right, #000000, oklch(0.5 ${userGuessColor.c} ${userGuessColor.h}), #ffffff)`, shortcut: '3' }
                    ].map((s) => (
                      <div key={s.label} className="space-y-4 group">
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-3">
                            <span className="px-1.5 py-0.5 border border-zinc-800 bg-zinc-900 text-[8px] text-zinc-500 font-bold group-focus-within:border-zinc-500 group-focus-within:text-zinc-100 transition-colors">{s.shortcut}</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 group-focus-within:text-zinc-100 transition-colors">{s.label}</span>
                          </div>
                          <span className="text-sm font-black italic text-zinc-100">
                            {s.key === 'h' ? Math.round(s.value).toString().padStart(3, '0') : s.value.toFixed(2)}
                            {s.unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="relative flex-1 h-12 flex items-center">
                            <div className="absolute inset-0 h-[2px] top-1/2 -translate-y-1/2 bg-zinc-800" />
                            <div className="absolute inset-0 h-[2px] top-1/2 -translate-y-1/2 opacity-30" style={{ background: s.gradient }} />
                            <Slider 
                              ref={s.ref}
                              value={[s.value]} max={s.max} step={s.step} 
                              onValueChange={([val]) => setUserGuessColor(prev => ({ ...prev, [s.key as 'h' | 'c' | 'l']: val }))}
                              className="cursor-none relative z-10 focus-visible:ring-0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8">
                    <Button 
                      onClick={handleValidateRound} 
                      className="w-full rounded-none h-20 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-black uppercase tracking-[0.3em] transition-all group relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        COMMIT_REPRODUCTION <ArrowRight className="h-4 w-4" />
                      </span>
                      <motion.div 
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-white/20 skew-x-12"
                      />
                    </Button>
                    <div className="mt-4 flex justify-center items-center gap-3 text-[9px] text-zinc-600 uppercase tracking-widest">
                      <span>Press</span>
                      <span className="px-2 py-1 border border-zinc-800 bg-zinc-900 text-zinc-400 font-bold">ENTER</span>
                      <span>To_Confirm</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Round Result Phase */}
            <AnimatePresence>
              {gameState === 'round_result' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="text-center w-full max-w-sm"
                >
                  <div className="bg-zinc-900 border border-zinc-800 p-8 mb-12 relative overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${currentRoundScore}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute bottom-0 left-0 h-[2px] bg-zinc-100"
                    />
                    <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mb-4">Round.Accuracy.Report</p>
                    <p className="text-6xl font-black italic text-zinc-100 mb-2">{currentRoundScore}%</p>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Chromatic_Precision_Index</p>
                  </div>
                  
                  <Button 
                    onClick={handleNextRound} 
                    className="w-full rounded-none h-20 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-black uppercase tracking-[0.2em] transition-all group"
                  >
                    {round < DIFFICULTY_SETTINGS[difficulty].rounds ? "NEXT_PHASE" : "ACCESS_FINAL_DATA"} <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Final Result Phase */}
            <AnimatePresence>
              {gameState === 'result' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center w-full max-w-md"
                >
                  <Trophy className={cn("h-20 w-20 mx-auto mb-8", (finalScore || 0) > 85 ? "text-zinc-100" : "text-zinc-800")} strokeWidth={1} />
                  
                  <div className="space-y-2 mb-12">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-[0.4em]">Final.Performance.Report</span>
                    <h2 className="text-7xl font-black italic text-zinc-100 uppercase tracking-tighter">
                      {finalScore}%
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-4 mb-16">
                    {roundScores.map((s, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                        className="flex flex-col gap-3"
                      >
                        <div className="h-24 w-full bg-zinc-900 border border-zinc-800 relative overflow-hidden">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${s}%` }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 1, ease: "easeOut" }}
                            className="absolute bottom-0 left-0 right-0 bg-zinc-100/20"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-black italic text-zinc-500">{s}</span>
                          </div>
                        </div>
                        <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">PH.{i+1}</span>
                      </motion.div>
                    ))}
                  </div>

                  <Button 
                    onClick={initGame} 
                    className="w-full rounded-none h-20 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-black uppercase tracking-[0.3em] transition-all group"
                  >
                    <RotateCcw className="mr-3 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" /> REBOOT_SYSTEM
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>

    <div className="w-full flex justify-center items-center gap-12 text-[9px] font-mono text-muted-foreground/50 uppercase tracking-[0.3em]">
      <span className="flex items-center gap-2">{DIFFICULTY_SETTINGS[difficulty].rounds} Manches</span>
      <span className="flex items-center gap-2">OKLCH Perception</span>
      <span className="flex items-center gap-2">Difficulté {difficulty}</span>
    </div>
  </div>
);
};

export default CircleMemoryTest;
