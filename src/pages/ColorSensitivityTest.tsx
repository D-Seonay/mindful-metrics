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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { PerformanceHistory, ColorSensitivityResult } from "@/types/history";

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
  const [wrongClickIndex, setWrongClickIndex] = useState<number | null>(null); // New state for wrong click feedback

  const [difficulty, setDifficulty] = useState<Difficulty>("normal"); // New state for difficulty
  const [lives, setLives] = useState(0); // New state for lives in Easy mode

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const [performanceHistory, setPerformanceHistory] = useLocalStorage<PerformanceHistory>(
    "performanceHistory",
    {
      reflex: [],
      typing: [],
      timePerception: [],
      aimTrainer: [],
      colorSensitivity: [], // Initialize new field
    },
  );

  // Effect to save game results
  useEffect(() => {
    if (isGameOver && gameResult > 0) {
      const newResult: ColorSensitivityResult = {
        id: Date.now().toString(), // Simple unique ID
        score: gameResult,
        difficulty: difficulty,
        date: new Date().toISOString(),
      };
      setPerformanceHistory((prevHistory) => ({
        ...prevHistory,
        colorSensitivity: [...(prevHistory.colorSensitivity || []), newResult], // Ensure colorSensitivity exists
      }));
    }
  }, [isGameOver, gameResult, difficulty, setPerformanceHistory]);

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
      setLives(3); // 3 lives for Easy mode
    } else {
      setLives(0); // No lives for Normal/Hard mode (time-based or instant game over)
    }

    generateLevel();
  }, [difficulty, generateLevel]);

  const resetGame = useCallback(() => {
    setIsGameStarted(false);
    setIsGameOver(false);
    setLevel(0);
    setScore(0);
    setTimeLeft(INITIAL_TIME);
    setLives(0); // Reset lives as well
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
  }, [isGameStarted, isGameOver, score, difficulty, toast]); // Add difficulty to dependency array

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
        setTimeLeft((prevTime) => prevTime + (score < 10 ? 2 : 1));

        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 300);

        toast({
          title: "Correct !",
          duration: 500,
        });
      } else {
        // Wrong click
        if (difficulty === "difficile") {
          setIsGameOver(true);
          setGameResult(score);
          toast({
            title: "Partie Terminée !",
            description: "Mode Difficile : une erreur et c'est perdu !",
            variant: "destructive",
          });
        } else if (difficulty === "facile") {
          setLives((prevLives) => prevLives - 1);
          if (lives - 1 <= 0) {
            setIsGameOver(true);
            setGameResult(score);
            toast({
              title: "Partie Terminée !",
              description: `Vous avez atteint le niveau ${score}.`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Incorrect !",
              description: `Il vous reste ${lives - 1} vies.`,
              variant: "destructive",
              duration: 500,
            });
          }
        } else {
          // Normal mode (time-based penalty)
          setTimeLeft((prevTime) => Math.max(0, prevTime - 3));
          toast({
            title: "Incorrect !",
            description: "-3 secondes",
            variant: "destructive",
            duration: 500,
          });
        }

        setBoardShake(true);
        setTimeout(() => setBoardShake(false), 500);

        setWrongClickIndex(index); // Set the index of the incorrectly clicked square
        setTimeout(() => setWrongClickIndex(null), 500); // Clear the wrong click feedback after animation
      }
    },
    [oddIndex, isGameOver, isGameStarted, score, difficulty, lives, toast], // Removed wrongClickIndex from dependencies
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
                      "aspect-square rounded-xl transition-transform duration-100 hover:scale-[0.98]",
                      "border-4 border-transparent", // Default transparent border
                      i === wrongClickIndex && "border-red-500", // Apply red border if this is the wrong clicked square
                    )}
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
            <div className="text-center space-y-4">
              <p className="mb-4 text-lg">Cliquez sur le carré qui a une nuance différente.</p>
              <div className="flex flex-col items-center space-y-2">
                <p className="font-semibold">Choisissez la difficulté :</p>
                <RadioGroup
                  defaultValue={difficulty}
                  onValueChange={(value: Difficulty) => setDifficulty(value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="facile" id="r1" />
                    <Label htmlFor="r1">Facile (3 vies)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="r2" />
                    <Label htmlFor="r2">Normal (temps)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="difficile" id="r3" />
                    <Label htmlFor="r3">Difficile (1 erreur)</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button onClick={startGame} size="lg" className="mt-4">
                Commencer le jeu
              </Button>
            </div>
          )}

          {(isGameStarted && !isGameOver) && (
            <>
              <div className="flex w-full justify-between px-4 text-xl font-semibold">
                <span>Niveau: {level}</span>
                {difficulty === "facile" ? (
                  <span>Vies: {lives}</span>
                ) : (
                  <span>Temps: {timeLeft}s</span>
                )}
              </div>
              <div
                className={cn(
                  "relative flex items-center justify-center rounded-xl border-4 border-transparent p-2 w-full max-w-[400px] aspect-square mx-auto",
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
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
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
