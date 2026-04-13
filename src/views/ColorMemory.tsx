import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSoundSystem } from "@/hooks/useSoundSystem";
import { cn } from "@/lib/utils";
import { PerformanceHistory, ColorMemoryResult } from "@/types/history";
import { RotateCcw, Play, Brain, Sparkles, Trophy, Zap } from "lucide-react";
import { generateOKLCHPalette, oklchToString, OKLCHColor } from "@/lib/colorSensitivityUtils";

// Types
type GameState = "IDLE" | "SHOWING" | "PLAYING" | "FINISHED";

// Constants
const INITIAL_SPEED = 800;
const MIN_SPEED = 200;

const ColorMemory: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>("IDLE");
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [palette, setPalette] = useState<OKLCHColor[]>([]);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showKeyHints, setShowKeyHints] = useState(true);
  const { toast } = useToast();
  const { playSound } = useSoundSystem();

  const gridSize = score >= 10 ? 3 : 2;
  const numColors = gridSize * gridSize;

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
    const nextColor = Math.floor(Math.random() * COLORS.length);
    setSequence((prev) => [...prev, nextColor]);
  }, []);

  const playSequence = useCallback(async () => {
    setGameState("SHOWING");
    setUserSequence([]);
    
    // Small delay before starting
    await new Promise((resolve) => setTimeout(resolve, 500));

    for (let i = 0; i < sequence.length; i++) {
      const colorId = sequence[i];
      setActiveColor(colorId);
      playSound("type"); // Using type sound for color flashes
      await new Promise((resolve) => setTimeout(resolve, speed));
      setActiveColor(null);
      await new Promise((resolve) => setTimeout(resolve, speed / 4));
    }

    setGameState("PLAYING");
  }, [sequence, speed, playSound]);

  const startGame = () => {
    setScore(0);
    setSequence([]);
    setUserSequence([]);
    setGameState("SHOWING");
    
    // Start with one color
    const firstColor = Math.floor(Math.random() * COLORS.length);
    setSequence([firstColor]);
  };

  useEffect(() => {
    if (sequence.length > 0 && gameState === "SHOWING" && activeColor === null) {
        playSequence();
    }
  }, [sequence, gameState, playSequence, activeColor]);

  const handleColorClick = (id: number) => {
    if (gameState !== "PLAYING") return;

    const nextUserSequence = [...userSequence, id];
    setUserSequence(nextUserSequence);
    setActiveColor(id);
    setTimeout(() => setActiveColor(null), 200);

    const currentStep = nextUserSequence.length - 1;

    if (id === sequence[currentStep]) {
      playSound("hit");
      
      if (nextUserSequence.length === sequence.length) {
        // Round complete
        setScore((prev) => prev + 1);
        setGameState("SHOWING");
        // Speed up slightly
        setSpeed((prev) => Math.max(MIN_SPEED, prev - 20));
        setTimeout(addToSequence, 800);
      }
    } else {
      // Game Over
      playSound("error");
      setGameState("FINISHED");
      saveResult();
    }
  };

  const saveResult = () => {
    const newResult: ColorMemoryResult = {
      id: Date.now().toString(),
      score: score,
      accuracy: 100, // In this version, game ends on first mistake
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
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSpeed(INITIAL_SPEED)} className="h-8 text-[10px] font-medium uppercase tracking-wider">
              RESET SPEED
            </Button>
          </div>
        </div>

        {/* HUD Stats */}
        <div className="flex justify-start gap-8 md:gap-12 mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Level</span>
            <span className="text-xl md:text-2xl font-bold tabular-nums text-primary">
              {score}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Sequence</span>
            <span className="text-xl md:text-2xl font-bold tabular-nums">
              {userSequence.length}/{sequence.length}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">High Score</span>
            <span className="text-xl md:text-2xl font-bold tabular-nums text-muted-foreground">
              {highScore}
            </span>
          </div>
          <div className="ml-auto flex items-end">
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
          {gameState === "IDLE" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl animate-in fade-in duration-500">
              <div className="max-w-md text-center px-6">
                <Brain className="h-16 w-16 text-primary mx-auto mb-6 opacity-50" />
                <h2 className="text-2xl font-bold tracking-tight uppercase mb-4">Color Memory</h2>
                <p className="text-sm text-muted-foreground uppercase tracking-widest leading-relaxed mb-8">
                  Watch the sequence of colors and repeat it. The sequence grows longer each level.
                </p>
                <Button onClick={startGame} size="lg" className="rounded-full px-12 h-16 text-lg uppercase tracking-[0.2em] shadow-2xl">
                  <Play className="mr-2 h-5 w-5" /> START TEST
                </Button>
              </div>
            </div>
          )}

          {gameState === "FINISHED" && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/95 backdrop-blur-md rounded-2xl animate-in fade-in zoom-in duration-500">
              <div className="text-center p-8 md:p-12 w-full max-w-2xl">
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
            </div>
          )}

          <div className={cn(
            "w-full h-full rounded-2xl border transition-all duration-500 flex flex-col items-center justify-center p-4 md:p-8",
            gameState === "SHOWING" || gameState === "PLAYING" ? "bg-background border-primary/20 shadow-inner" : "bg-secondary border-border"
          )}>
            
            {/* Status Message */}
            <div className="mb-8 h-8 text-center">
              {gameState === "SHOWING" && (
                <div className="flex items-center gap-2 text-primary text-xs uppercase tracking-[0.3em] animate-pulse">
                  <Sparkles className="h-4 w-4" /> WATCHING SEQUENCE...
                </div>
              )}
              {gameState === "PLAYING" && (
                <div className="text-muted-foreground text-xs uppercase tracking-[0.3em]">
                   YOUR TURN
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-md aspect-square">
              {COLORS.map((color) => (
                <button
                  key={color.id}
                  disabled={gameState !== "PLAYING"}
                  onClick={() => handleColorClick(color.id)}
                  className={cn(
                    "relative aspect-square rounded-2xl transition-all duration-200",
                    "border-4 border-transparent shadow-xl active:scale-95 disabled:cursor-default",
                    activeColor === color.id 
                      ? "opacity-100 scale-105 border-white shadow-[0_0_30px_rgba(255,255,255,0.4)] z-10" 
                      : "opacity-40 grayscale-[0.2]"
                  )}
                  style={{ 
                    backgroundColor: color.color,
                    boxShadow: activeColor === color.id ? `0 0 40px ${color.color}` : 'none'
                  }}
                >
                  <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default ColorMemory;
