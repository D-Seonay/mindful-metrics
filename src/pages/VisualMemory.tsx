import { useState, useCallback, useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { PerformanceHistory, VisualMemoryResult } from '@/types/history';

type GameState = 'idle' | 'memorizing' | 'recalling' | 'gameOver';

const initialHistory: PerformanceHistory = {
  reflex: [],
  typing: [],
  timePerception: [],
  aimTrainer: [],
  visualMemory: [],
};

const INITIAL_GRID_SIZE = 3;
const INITIAL_TILES_TO_REMEMBER = 3;
const MEMORIZE_DURATION = 1000; // 1 second

export default function VisualMemory() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState(INITIAL_GRID_SIZE);
  const [tilesToRemember, setTilesToRemember] = useState(INITIAL_TILES_TO_REMEMBER);
  const [pattern, setPattern] = useState<number[]>([]);
  const [clickedTiles, setClickedTiles] = useState<number[]>([]);
  const [highlightedTile, setHighlightedTile] = useState<number | null>(null);
  const [gameOverLevel, setGameOverLevel] = useState(0);
  const [history, setHistory] = useLocalStorage<PerformanceHistory>('performance-history', initialHistory);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generatePattern = useCallback(() => {
    const newPattern: number[] = [];
    const totalTiles = gridSize * gridSize;
    const availableTiles = Array.from({ length: totalTiles }, (_, i) => i);

    for (let i = 0; i < tilesToRemember; i++) {
      const randomIndex = Math.floor(Math.random() * availableTiles.length);
      newPattern.push(availableTiles[randomIndex]);
      availableTiles.splice(randomIndex, 1);
    }
    setPattern(newPattern);
    setClickedTiles([]);
    setGameState('memorizing');
  }, [gridSize, tilesToRemember]);

  const startGame = useCallback(() => {
    setLevel(1);
    setGridSize(INITIAL_GRID_SIZE);
    setTilesToRemember(INITIAL_TILES_TO_REMEMBER);
    setGameOverLevel(0);
    generatePattern();
  }, [generatePattern]);

  const resetGame = useCallback(() => {
    setGameState('idle');
    setLevel(1);
    setGridSize(INITIAL_GRID_SIZE);
    setTilesToRemember(INITIAL_TILES_TO_REMEMBER);
    setPattern([]);
    setClickedTiles([]);
    setHighlightedTile(null);
    setGameOverLevel(0);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handleTileClick = useCallback((id: number) => {
    if (gameState !== 'recalling') return;

    if (pattern.includes(id)) {
      if (!clickedTiles.includes(id)) {
        setClickedTiles(prev => [...prev, id]);
        // Visual feedback for correct click (e.g., green flash)
      }

      if (clickedTiles.length + 1 === tilesToRemember) {
        // All correct, advance level
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setHighlightedTile(id); // Keep last clicked tile green briefly
        setTimeout(() => {
            setLevel(prev => prev + 1);
        }, 300);
      }
    } else {
      // Wrong tile clicked, Game Over
      setGameOverLevel(level);
      setGameState('gameOver');
      
      const newResult: VisualMemoryResult = {
        id: crypto.randomUUID(),
        levelReached: level,
        date: new Date().toISOString(),
      };
      setHistory(prev => ({
        ...prev,
        visualMemory: [newResult, ...(prev.visualMemory || [])].slice(0, 10),
      }));
    }
  }, [gameState, pattern, clickedTiles, tilesToRemember, level, setHistory]);

  useEffect(() => {
    if (gameState === 'memorizing') {
      let i = 0;
      const interval = setInterval(() => {
        if (i < pattern.length) {
          setHighlightedTile(pattern[i]);
          i++;
        } else {
          clearInterval(interval);
          timeoutRef.current = setTimeout(() => {
            setHighlightedTile(null);
            setGameState('recalling');
          }, MEMORIZE_DURATION); // Duration to show the last tile
        }
      }, MEMORIZE_DURATION / pattern.length); // Adjusted interval for smoother highlighting

      return () => {
        clearInterval(interval);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [gameState, pattern]);

  useEffect(() => {
    if (level > 1 && gameState === 'recalling' && clickedTiles.length === tilesToRemember) {
        // Small delay before generating next pattern
        setTimeout(() => {
            setHighlightedTile(null); // Clear highlight from last tile
            setTilesToRemember(prev => Math.min(prev + 1, gridSize * gridSize)); // Increase tiles or cap at grid size
            if (level % 3 === 0) { // Increase grid size every 3 levels
                setGridSize(prev => prev + 1);
            }
            generatePattern();
        }, 500);
    }
  }, [level, gameState, clickedTiles, tilesToRemember, gridSize, generatePattern]);


  const totalTiles = gridSize * gridSize;
  const gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        {gameState === 'idle' && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-2">Visual Memory</h1>
            <p className="text-muted-foreground mb-4">Mémorisez le motif et cliquez sur les bonnes cases.</p>
            <Button onClick={startGame}>Start Game</Button>
          </div>
        )}

        {gameState !== 'idle' && gameState !== 'gameOver' && (
          <div className="mb-4 text-xl font-semibold">Level: {level}</div>
        )}

        <div
          className="grid gap-2 p-4 rounded-lg bg-gray-100 dark:bg-gray-800"
          style={{
            gridTemplateColumns: gridTemplateColumns,
            width: `${gridSize * 70}px`, // Adjust size based on grid
            height: `${gridSize * 70}px`,
          }}
        >
          {Array.from({ length: totalTiles }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-16 h-16 rounded-lg transition-all duration-100 ease-out",
                "cursor-pointer",
                "bg-gray-300 dark:bg-gray-700", // Default tile color
                gameState === 'memorizing' && highlightedTile === index && "bg-white shadow-lg shadow-white animate-pulse-soft-glow", // Active/Memory tile
                gameState === 'recalling' && clickedTiles.includes(index) && pattern.includes(index) && "bg-teal-400 dark:bg-teal-600", // Correct click
                gameState === 'recalling' && clickedTiles.includes(index) && !pattern.includes(index) && "bg-red-400 dark:bg-red-600" // Wrong click (should not happen in current logic)
              )}
              onClick={() => handleTileClick(index)}
            />
          ))}
        </div>

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
            <p className="text-2xl mb-6">Level {gameOverLevel} Reached</p>
            <Button onClick={resetGame}>Try Again</Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
