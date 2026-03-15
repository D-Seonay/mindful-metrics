import React, { useState, useEffect, useRef, useCallback } from "react";
import { Layout } from "@/components/Layout";
import {
  generateRandomHSL,
  getLightnessDelta,
  adjustLightness,
  hslToString,
  HSLColor,
} from "../lib/colorSensitivityUtils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { PerformanceHistory, ColorSensitivityResult } from "@/types/history";
import { RotateCcw, Eye, Shield, Zap } from "lucide-react";

const INITIAL_TIME = 20;

const GRID_DIMENSIONS = [
  { scoreThreshold: 0, rows: 2, cols: 3 },
  { scoreThreshold: 5, rows: 3, cols: 3 },
  { scoreThreshold: 10, rows: 4, cols: 4 },
  { scoreThreshold: 20, rows: 5, cols: 5 },
];

const getGridDimensions = (score: number) => {
  for (let i = GRID_DIMENSIONS.length - 1; i >= 0; i--) {
    if (score >= GRID_DIMENSIONS[i].scoreThreshold) {
      return { rows: GRID_DIMENSIONS[i].rows, cols: GRID_DIMENSIONS[i].cols };
    }
  }
  return { rows: 2, cols: 3 };
};

type Difficulty = "facile" | "normal" | "difficile";

const ColorSensitivityTest: React.FC = () => {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [baseColor, setBaseColor] = useState<HSLColor | null>(null);
  const [oddColor, setOddColor] = useState<HSLColor | null>(null);
  const [oddIndex, setOddIndex] = useState<number>(-1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameResult, setGameResult] = useState(0);
  const [boardShake, setBoardShake] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [wrongClickIndex, setWrongClickIndex] = useState<number | null>(null);

  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [lives, setLives] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const [history, setHistory] = useLocalStorage<PerformanceHistory>(
    "performance-history",
    {
      reflex: [],
      typing: [],
      timePerception: [],
      aimTrainer: [],
      colorSensitivity: [],
      peripheralVision: [],
    },
  );

  useEffect(() => {
    if (isGameOver && gameResult > 0) {
      const newResult: ColorSensitivityResult = {
        id: Date.now().toString(),
        score: gameResult,
        difficulty: difficulty,
        date: new Date().toISOString(),
      };
      setHistory((prevHistory) => ({
        ...prevHistory,
        colorSensitivity: [newResult, ...(prevHistory.colorSensitivity || [])].slice(0, 10),
      }));
    }
  }, [isGameOver, gameResult, difficulty, setHistory]);

  const generateLevel = useCallback(() => {
    const { rows, cols } = getGridDimensions(score);
    const newBaseColor = generateRandomHSL();
    setBaseColor(newBaseColor);
    const lightnessDelta = getLightnessDelta(score);
    const lighter = Math.random() > 0.5;
    const newOddColor = adjustLightness(
      newBaseColor,
      lighter ? lightnessDelta : -lightnessDelta,
    );
    setOddColor(newOddColor);
    setOddIndex(Math.floor(Math.random() * rows * cols));
  }, [score]);

  const startGame = useCallback(() => {
    setLevel(1);
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setIsGameOver(false);
    setIsGameStarted(true);
    setGameResult(0);
    if (difficulty === "facile") {
      setLives(3);
    } else {
      setLives(0);
    }
    generateLevel();
  }, [difficulty, generateLevel]);

  const resetGame = useCallback(() => {
    setIsGameStarted(false);
    setIsGameOver(false);
    setLevel(0);
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setLives(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  useEffect(() => {
    if (isGameStarted && !isGameOver && difficulty !== "facile") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            setIsGameOver(true);
            setGameResult(score);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameStarted, isGameOver, score, difficulty]);

  useEffect(() => {
    if (isGameStarted && !isGameOver) {
      generateLevel();
    }
  }, [score, isGameStarted, isGameOver, generateLevel]);

  const handleSquareClick = useCallback(
    (index: number) => {
      if (isGameOver || !isGameStarted) return;

      if (index === oddIndex) {
        setLevel((prevLevel) => prevLevel + 1);
        setScore((prevScore) => prevScore + 1);
        if (difficulty !== "facile") {
          setTimeLeft((prevTime) => prevTime + (score < 10 ? 2 : 1));
        }
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 300);
      } else {
        if (difficulty === "difficile") {
          setIsGameOver(true);
          setGameResult(score);
        } else if (difficulty === "facile") {
          setLives((prevLives) => {
            const nextLives = prevLives - 1;
            if (nextLives <= 0) {
              setIsGameOver(true);
              setGameResult(score);
              return 0;
            }
            return nextLives;
          });
        } else {
          setTimeLeft((prevTime) => Math.max(0, prevTime - 3));
        }
        setBoardShake(true);
        setTimeout(() => setBoardShake(false), 500);
        setWrongClickIndex(index);
        setTimeout(() => setWrongClickIndex(null), 500);
      }
    },
    [oddIndex, isGameOver, isGameStarted, score, difficulty],
  );

  const renderGrid = () => {
    if (!baseColor || !oddColor) return null;
    const { rows, cols } = getGridDimensions(score);
    const totalSquares = rows * cols;
    const squares = [];
    for (let i = 0; i < totalSquares; i++) {
      const color = i === oddIndex ? oddColor : baseColor;
      squares.push(
        <button
          key={i}
          className={cn(
            "aspect-square rounded-xl transition-all duration-100 hover:scale-[0.98]",
            "border-4 border-transparent shadow-sm",
            i === wrongClickIndex && "border-destructive animate-shake",
          )}
          style={{ backgroundColor: hslToString(color) }}
          onClick={() => handleSquareClick(i)}
        />,
      );
    }
    return (
      <div
        className={cn(
          "grid w-full gap-3 transition-all duration-300 ease-out max-w-md mx-auto",
          isPulsing && "scale-[1.02]",
        )}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {squares}
      </div>
    );
  };

  const bestScore = history.colorSensitivity?.length > 0 
    ? Math.max(...history.colorSensitivity.map(r => r.score))
    : 0;

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-12 flex flex-col h-[calc(100vh-4rem)]">
        {/* Compact Settings Bar */}
        <div className={cn(
          "flex items-center justify-center gap-4 mb-12 p-2 rounded-xl bg-secondary/20 border border-border/50 transition-opacity duration-300",
          isGameStarted ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-2 border-r border-border/50">Difficulty</span>
          <div className="flex gap-1">
            {(["facile", "normal", "difficile"] as Difficulty[]).map(opt => (
              <Button 
                key={opt} 
                variant={difficulty === opt ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setDifficulty(opt)}
                className="h-8 px-3 text-xs font-mono uppercase"
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>

        {/* HUD Stats */}
        <div className="flex justify-start gap-12 mb-8 font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Level</span>
            <span className="text-2xl font-bold tabular-nums">
              {level}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
              {difficulty === "facile" ? "Lives" : "Time"}
            </span>
            <span className={cn(
              "text-2xl font-bold tabular-nums",
              (difficulty !== "facile" && timeLeft <= 5) ? "text-destructive animate-pulse" : "text-primary"
            )}>
              {difficulty === "facile" ? lives : `${timeLeft}s`}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Best</span>
            <span className="text-2xl font-bold tabular-nums">
              {bestScore}
            </span>
          </div>
          <div className="ml-auto flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetGame}
              className="h-8 px-3 text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-2" />
              RESTART
            </Button>
          </div>
        </div>

        <div className="flex-1 relative">
          {!isGameStarted && !isGameOver && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/10 rounded-2xl">
              <Button onClick={startGame} size="lg" className="rounded-full px-12 h-16 font-mono text-lg uppercase tracking-[0.2em] shadow-2xl">
                START TEST
              </Button>
              <p className="mt-6 text-xs font-mono text-muted-foreground uppercase tracking-widest">Find the slightly different shade</p>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/95 backdrop-blur-md rounded-2xl animate-in fade-in duration-500">
              <div className="text-center w-full max-w-3xl p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-12">
                  <div className="space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Level Reached</div>
                    <div className="text-6xl font-bold text-primary font-mono">{gameResult}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Difficulty</div>
                    <div className="text-4xl font-bold font-mono uppercase">{difficulty}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">Personal Best</div>
                    <div className="text-4xl font-bold font-mono tabular-nums">{bestScore}</div>
                  </div>
                </div>
                <Button onClick={startGame} size="lg" className="rounded-full px-8 font-mono uppercase tracking-widest">
                  TRY AGAIN
                </Button>
              </div>
            </div>
          )}

          <div className={cn(
            "w-full h-full rounded-2xl border transition-all duration-500 flex items-center justify-center p-8",
            isGameStarted ? "bg-zinc-950 border-primary/20 shadow-inner" : "bg-secondary/10 border-border/50"
          )}>
            {renderGrid()}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ColorSensitivityTest;
