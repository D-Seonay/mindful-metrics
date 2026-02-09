import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  generateRandomHSL,
  getLightnessDelta,
  adjustLightness,
  hslToString,
  HSLColor,
} from "../lib/colorSensitivityUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const INITIAL_TIME = 20; // seconds

const GRID_DIMENSIONS = [
  { scoreThreshold: 0, rows: 2, cols: 3 }, // 3x2 = 6 squares
  { scoreThreshold: 5, rows: 3, cols: 3 }, // 3x3 = 9 squares
  { scoreThreshold: 10, rows: 4, cols: 4 }, // 4x4 = 16 squares
  { scoreThreshold: 20, rows: 5, cols: 5 }, // 5x5 = 25 squares
];

const getGridDimensions = (score: number) => {
  for (let i = GRID_DIMENSIONS.length - 1; i >= 0; i--) {
    if (score >= GRID_DIMENSIONS[i].scoreThreshold) {
      return { rows: GRID_DIMENSIONS[i].rows, cols: GRID_DIMENSIONS[i].cols };
    }
  }
  return { rows: 2, cols: 3 }; // Default
};

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
  const [isPulsing, setIsPulsing] = useState(false); // New state for pulse animation

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const generateLevel = useCallback(() => {
    const { rows, cols } = getGridDimensions(score);

    // Generate base color
    const newBaseColor = generateRandomHSL();
    setBaseColor(newBaseColor);

    // Calculate lightness delta based on score
    const lightnessDelta = getLightnessDelta(score);

    // Adjust lightness for the odd color
    const lighter = Math.random() > 0.5;
    const newOddColor = adjustLightness(
      newBaseColor,
      lighter ? lightnessDelta : -lightnessDelta,
    );
    setOddColor(newOddColor);

    // Pick a random index for the odd square
    setOddIndex(Math.floor(Math.random() * rows * cols));
  }, [score]);

  const startGame = useCallback(() => {
    setLevel(1); // Start at level 1
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setIsGameOver(false);
    setIsGameStarted(true);
    setGameResult(0);
    generateLevel();
  }, [generateLevel]);

  const resetGame = useCallback(() => {
    setIsGameStarted(false);
    setIsGameOver(false);
    setLevel(0);
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (isGameStarted && !isGameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            setIsGameOver(true);
            setGameResult(score);
            toast({
              title: "Partie Terminée !",
              description: `Vous avez atteint le niveau ${score}.`,
            });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isGameStarted, isGameOver, score, toast]);

  // Generate new level when score changes (after a correct click)
  useEffect(() => {
    if (isGameStarted && !isGameOver) {
      generateLevel();
    }
  }, [score, isGameStarted, isGameOver, generateLevel]);

  const handleSquareClick = useCallback(
    (index: number) => {
      if (isGameOver || !isGameStarted) return;

      if (index === oddIndex) {
        // Correct click
        setLevel((prevLevel) => prevLevel + 1);
        setScore((prevScore) => prevScore + 1);
        setTimeLeft((prevTime) => prevTime + (score < 10 ? 2 : 1)); // +2s for early levels, +1s for higher

        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 300); // Remove pulse class after animation

        toast({
          title: "Correct !",
          duration: 500,
        });
      } else {
        // Wrong click
        setTimeLeft((prevTime) => Math.max(0, prevTime - 3)); // -3 seconds penalty
        setBoardShake(true);
        setTimeout(() => setBoardShake(false), 500); // Remove shake class after animation
        toast({
          title: "Incorrect !",
          description: "-3 secondes",
          variant: "destructive",
          duration: 500,
        });
      }
    },
    [oddIndex, isGameOver, isGameStarted, score, toast],
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
          className="aspect-square rounded-xl transition-transform duration-100 hover:scale-[0.98]"
          style={{ backgroundColor: hslToString(color) }}
          onClick={() => handleSquareClick(i)}
          aria-label={`Carré de couleur ${i + 1}`}
        />,
      );
    }

    return (
      <div
        className={cn(
          "grid w-full gap-3 transition-all duration-100 ease-out",
          boardShake && "animate-shake",
          isPulsing && "animate-pulse-green",
        )}
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          width: '100%',
        }}
      >
        {squares}
      </div>
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Test de Sensibilité aux Couleurs</CardTitle>
          <p className="text-muted-foreground">Trouvez la nuance de couleur légèrement différente</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 p-4">
          {!isGameStarted && !isGameOver && (
            <div className="text-center">
              <p className="mb-4 text-lg">Cliquez sur le carré qui a une nuance différente.</p>
              <Button onClick={startGame} size="lg">
                Commencer le jeu
              </Button>
            </div>
          )}

          {(isGameStarted && !isGameOver) && (
            <>
              <div className="flex w-full justify-between px-4 text-xl font-semibold">
                <span>Niveau: {level}</span>
                <span>Temps: {timeLeft}s</span>
              </div>
              <div
                className={cn(
                  "relative flex items-center justify-center rounded-xl border-4 border-transparent p-2 w-full max-w-[400px] aspect-square mx-auto", // Added sizing classes here
                  boardShake && "border-red-500", // Visual feedback for wrong click
                )}
              >
                {renderGrid()}
              </div>
            </>
          )}

          {isGameOver && (
            <div className="text-center">
              <h3 className="mb-2 text-2xl font-bold">Partie Terminée !</h3>
              <p className="mb-4 text-xl">Vous avez atteint le niveau : {gameResult}</p>
              <Button onClick={startGame} size="lg">
                Réessayer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <style>
        {`
        @keyframes shake {
          0% { transform: translateX(0); }
          10% { transform: translateX(-5px); }
          20% { transform: translateX(5px); }
          30% { transform: translateX(-5px); }
          40% { transform: translateX(5px); }
          50% { transform: translateX(-5px); }
          60% { transform: translateX(5px); }
          70% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
          90% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } /* Tailwind green-500 */
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .animate-pulse-green {
          animation: pulse-green 0.5s ease-out;
        }
        `}
      </style>
    </div>
  );
};

export default ColorSensitivityTest;
