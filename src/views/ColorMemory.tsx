import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSoundSystem } from "@/hooks/useSoundSystem";
import { cn } from "@/lib/utils";
import { 
  oklchToString, 
  OKLCHColor, 
  generateOKLCHPalette 
} from "@/lib/colorSensitivityUtils";
import { PerformanceHistory, ColorMemoryResult } from "@/types/history";
import { RotateCcw, Play, Brain, Sparkles, Trophy, Zap } from "lucide-react";

// Types
type GameState = "IDLE" | "SHOWING" | "PLAYING" | "FINISHED";

const INITIAL_SPEED = 800;
const MIN_SPEED = 200;

const HARMONIC_NOTES = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  349.23, // F4
  392.00, // G4
  440.00, // A4
  493.88, // B4
  523.25, // C5
  587.33, // D5
];

const ColorMemory: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [palette, setPalette] = useState<OKLCHColor[]>([]);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showKeyHints, setShowKeyHints] = useState(true);
  
  const { toast } = useToast();
  const { playSound, playNote } = useSoundSystem();

  const gridSize = score >= 10 ? 3 : 2;
  const numColors = score >= 10 ? 9 : 4;

  const [history, setHistory] = useLocalStorage<PerformanceHistory>("performance-history", {
    reflex: [],
    typing: [],
    timePerception: [],
    aimTrainer: [],
    colorSensitivity: [],
    colorMemory: [],
    circleMemory: [],
    peripheralVision: [],
  });

  // Track personal best
  useEffect(() => {
    if (history.colorMemory && history.colorMemory.length > 0) {
      const best = Math.max(...history.colorMemory.map((r) => r.score));
      setHighScore(best);
    }
  }, [history.colorMemory]);

  const addToSequence = useCallback(() => {
    setSequence((prev) => {
      const nextColor = Math.floor(Math.random() * (score >= 10 ? 9 : 4));
      return [...prev, nextColor];
    });
  }, [score]);

  const playSequence = useCallback(async () => {
    setGameState("SHOWING");
    setUserSequence([]);
    
    await new Promise((resolve) => setTimeout(resolve, 600));

    for (let i = 0; i < sequence.length; i++) {
      const colorId = sequence[i];
      setActiveColor(colorId);
      playNote(HARMONIC_NOTES[colorId % HARMONIC_NOTES.length]);
      await new Promise((resolve) => setTimeout(resolve, speed));
      setActiveColor(null);
      await new Promise((resolve) => setTimeout(resolve, speed / 4));
    }

    setGameState("PLAYING");
  }, [sequence, speed, playNote]);

  const startGame = () => {
    const initialPalette = generateOKLCHPalette(4);
    setPalette(initialPalette);
    setScore(0);
    setSequence([]);
    setUserSequence([]);
    setGameState("SHOWING");
    
    const firstColor = Math.floor(Math.random() * 4);
    setSequence([firstColor]);
  };

  useEffect(() => {
    if (palette.length > 0 && sequence.length > 0 && gameState === "SHOWING" && activeColor === null) {
        playSequence();
    }
  }, [palette.length, sequence, gameState, playSequence, activeColor]);

  const handleColorClick = useCallback((id: number) => {
    if (gameState !== "PLAYING") return;

    const nextUserSequence = [...userSequence, id];
    setUserSequence(nextUserSequence);
    setActiveColor(id);
    playNote(HARMONIC_NOTES[id % HARMONIC_NOTES.length]);
    setTimeout(() => setActiveColor(null), 200);

    const currentStep = nextUserSequence.length - 1;

    if (id === sequence[currentStep]) {
      if (nextUserSequence.length === sequence.length) {
        const nextScore = score + 1;
        setScore(nextScore);
        setGameState("SHOWING");
        setSpeed((prev) => Math.max(MIN_SPEED, prev - 20));
        
        if (nextScore === 10) {
          const newPalette = generateOKLCHPalette(9);
          setPalette(newPalette);
          setTimeout(addToSequence, 1200);
        } else {
          setTimeout(addToSequence, 800);
        }
      }
    } else {
      playSound("error");
      setGameState("FINISHED");
      saveResult();
    }
  }, [gameState, userSequence, sequence, score, playNote, playSound, addToSequence]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "PLAYING") return;
      
      const key = e.key;
      const num = parseInt(key);
      
      if (!isNaN(num) && num >= 1 && num <= numColors) {
        handleColorClick(num - 1);
      } else if (key.startsWith('NumPad') && key.length === 7) {
        const padNum = parseInt(key[6]);
        if (!isNaN(padNum) && padNum >= 1 && padNum <= numColors) {
          handleColorClick(padNum - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleColorClick, numColors]);

  const saveResult = () => {
    const newResult: ColorMemoryResult = {
      id: Date.now().toString(),
      score: score,
      accuracy: 100,
      date: new Date().toISOString(),
    };

    setHistory((prev) => ({
      ...prev,
      colorMemory: [newResult, ...(prev.colorMemory || [])].slice(0, 10),
    }));

    if (score > highScore) {
      setHighScore(score);
      toast({
        title: "NEW PERSONAL BEST!",
        description: `You reached level ${score}!`,
      });
    }
  };

  const progress = (userSequence.length / sequence.length) * 100;

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col h-[calc(100vh-4rem)]">
      
      {/* Compact Settings Bar */}
      <div className={cn(
        "flex flex-wrap items-center justify-between gap-4 mb-8 md:mb-12 p-3 rounded-xl bg-secondary border border-border transition-all duration-300",
        (gameState === "SHOWING" || gameState === "PLAYING") ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100"
      )}>
        <div className="flex items-center gap-4 flex-1 max-w-xs">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest whitespace-nowrap">Base Speed</span>
          <Slider 
            value={[speed]} 
            min={300} 
            max={1200} 
            step={50} 
            onValueChange={(val) => setSpeed(val[0])}
            className="flex-1"
          />
          <span className="text-[10px] font-medium text-muted-foreground w-12">{speed}ms</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Hints</span>
            <Button 
              variant={showKeyHints ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setShowKeyHints(!showKeyHints)}
              className="h-7 text-[10px]"
            >
              {showKeyHints ? "ON" : "OFF"}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSpeed(INITIAL_SPEED)} className="h-8 text-[10px] font-medium uppercase tracking-wider">
            RESET SPEED
          </Button>
        </div>
      </div>

      {/* HUD Stats */}
      <div className="flex justify-start gap-8 md:gap-12 mb-8 items-end">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Level</span>
          <span className="text-xl md:text-2xl font-bold tabular-nums text-primary">
            {score}
          </span>
        </div>
        <div className="flex flex-col flex-1 max-w-[200px]">
          <div className="flex justify-between mb-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Sequence</span>
            <span className="text-[10px] font-bold tabular-nums">
              {userSequence.length}/{sequence.length}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">High Score</span>
          <span className="text-xl md:text-2xl font-bold tabular-nums text-muted-foreground">
            {highScore}
          </span>
        </div>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={startGame}
            className="h-8 px-2 md:px-3 text-[10px] md:text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3 mr-1 md:mr-2" />
            RESTART
          </Button>
        </div>
      </div>

      <div className="flex-1 relative min-h-0">
        <AnimatePresence>
          {gameState === "IDLE" && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl"
            >
              <div className="max-w-md text-center px-6">
                <Brain className="h-16 w-16 text-primary mx-auto mb-6 opacity-50" />
                <h2 className="text-2xl font-bold tracking-tight uppercase mb-4">Color Memory</h2>
                <p className="text-sm text-muted-foreground uppercase tracking-widest leading-relaxed mb-8">
                  Watch the sequence of colors and repeat it. The grid expands at level 10.
                </p>
                <Button onClick={startGame} size="lg" className="rounded-full px-12 h-16 text-lg uppercase tracking-[0.2em] shadow-2xl">
                  <Play className="mr-2 h-5 w-5" /> START TEST
                </Button>
              </div>
            </motion.div>
          )}

          {gameState === "FINISHED" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-background/95 backdrop-blur-md rounded-2xl p-8"
            >
              <div className="text-center w-full max-w-2xl">
                <Trophy className="h-16 w-16 text-primary mx-auto mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
                  <div className="space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Level Reached</div>
                    <div className="text-5xl md:text-7xl font-bold text-primary tabular-nums">{score}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Personal Best</div>
                    <div className="text-3xl md:text-5xl font-bold tabular-nums text-muted-foreground">{highScore}</div>
                  </div>
                </div>
                <Button onClick={startGame} size="lg" className="rounded-full px-8 uppercase tracking-widest">
                  TRY AGAIN
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={cn(
          "w-full h-full rounded-2xl border transition-all duration-500 flex flex-col items-center justify-center p-4 md:p-8",
          gameState === "SHOWING" || gameState === "PLAYING" ? "bg-background border-primary/20 shadow-inner" : "bg-secondary border-border"
        )}>
          
          {/* Status Message */}
          <div className="mb-8 h-8 text-center">
            <AnimatePresence mode="wait">
              {gameState === "SHOWING" && (
                <motion.div 
                  key="watching"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-primary text-xs uppercase tracking-[0.3em] animate-pulse"
                >
                  <Sparkles className="h-4 w-4" /> WATCHING SEQUENCE...
                </motion.div>
              )}
              {gameState === "PLAYING" && (
                <motion.div 
                  key="playing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-muted-foreground text-xs uppercase tracking-[0.3em]"
                >
                   YOUR TURN
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div 
            layout
            className={cn(
              "grid gap-4 md:gap-8 w-full max-w-md aspect-square",
              gridSize === 2 ? "grid-cols-2" : "grid-cols-3"
            )}
          >
            {palette.map((color, index) => (
              <motion.button
                key={index}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                disabled={gameState !== "PLAYING"}
                onClick={() => handleColorClick(index)}
                className={cn(
                  "relative aspect-square rounded-2xl transition-all duration-200",
                  "border-4 border-transparent shadow-xl active:scale-95 disabled:cursor-default",
                  activeColor === index 
                    ? "opacity-100 scale-105 border-white z-10" 
                    : "opacity-40 grayscale-[0.2]"
                )}
                style={{ 
                  backgroundColor: oklchToString(color),
                  boxShadow: activeColor === index ? `0 0 40px ${oklchToString(color)}` : 'none'
                }}
              >
                {showKeyHints && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold text-white/50 mix-blend-difference">
                    {index + 1}
                  </span>
                )}
                <span className="sr-only">Color {index + 1}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ColorMemory;
