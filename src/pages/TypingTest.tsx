import { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { HistoryPanel } from '@/components/HistoryPanel';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { getRandomText } from '@/lib/typingTexts';
import { cn } from '@/lib/utils';
import type { TypingHistory, TypingResult } from '@/types/history';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type GameState = 'idle' | 'typing' | 'finished';

const initialHistory: TypingHistory = {
  results: [],
  bestWpm: null,
};

export default function TypingTest() {
  const [text, setText] = useState(() => getRandomText());
  const [userInput, setUserInput] = useState('');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [history, setHistory] = useLocalStorage<TypingHistory>('typing-history', initialHistory);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const calculateStats = useCallback(() => {
    if (userInput.length === 0) return { wpm: 0, accuracy: 100 };
    
    const timeInMinutes = elapsedTime / 60;
    const wordsTyped = userInput.length / 5; // Standard: 5 chars = 1 word
    const wpm = timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0;
    
    let correctChars = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === text[i]) correctChars++;
    }
    const accuracy = Math.round((correctChars / userInput.length) * 100);
    
    return { wpm, accuracy };
  }, [userInput, text, elapsedTime]);

  const stats = calculateStats();

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 0.1);
    }, 100);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetGame = useCallback(() => {
    stopTimer();
    setText(getRandomText());
    setUserInput('');
    setGameState('idle');
    setStartTime(0);
    setElapsedTime(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [stopTimer]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (gameState === 'idle' && value.length > 0) {
      setGameState('typing');
      setStartTime(Date.now());
      startTimer();
    }
    
    if (gameState !== 'finished') {
      setUserInput(value);
      
      // Check if finished
      if (value.length >= text.length) {
        stopTimer();
        setGameState('finished');
        
        const finalStats = {
          wpm: elapsedTime > 0 ? Math.round((value.length / 5) / (elapsedTime / 60)) : 0,
          accuracy: (() => {
            let correct = 0;
            for (let i = 0; i < value.length; i++) {
              if (value[i] === text[i]) correct++;
            }
            return Math.round((correct / value.length) * 100);
          })(),
        };
        
        const newResult: TypingResult = {
          id: crypto.randomUUID(),
          wpm: finalStats.wpm,
          accuracy: finalStats.accuracy,
          date: new Date().toISOString(),
        };
        
        setHistory(prev => {
          const newResults = [newResult, ...prev.results].slice(0, 10);
          const newBest = prev.bestWpm === null ? finalStats.wpm : Math.max(prev.bestWpm, finalStats.wpm);
          return { results: newResults, bestWpm: newBest };
        });
      }
    }
  }, [gameState, text, elapsedTime, startTimer, stopTimer, setHistory]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab' && gameState === 'finished') {
      e.preventDefault();
      resetGame();
    }
  }, [gameState, resetGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const handleClearHistory = () => {
    setHistory(initialHistory);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Test de Vitesse de Frappe</h1>
            <p className="text-muted-foreground">
              Tapez le texte ci-dessous le plus rapidement possible
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {/* Stats bar */}
              <div className="flex items-center gap-6 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Temps</span>
                  <span className="font-semibold tabular-nums">{formatTime(elapsedTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">WPM</span>
                  <span className="font-semibold tabular-nums">{stats.wpm}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Précision</span>
                  <span className="font-semibold tabular-nums">{stats.accuracy}%</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetGame}
                  className="ml-auto h-8 px-3"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                  Recommencer
                </Button>
              </div>

              {gameState === 'finished' ? (
                /* Results screen */
                <div className="p-12 rounded-2xl bg-secondary/30 text-center result-display">
                  <div className="mb-8">
                    <div className="text-7xl font-extrabold mb-2 animate-pulse-subtle">
                      {stats.wpm}
                    </div>
                    <div className="text-xl text-muted-foreground">mots par minute</div>
                  </div>
                  <div className="flex items-center justify-center gap-8 mb-8">
                    <div>
                      <div className="text-3xl font-bold">{stats.accuracy}%</div>
                      <div className="text-sm text-muted-foreground">précision</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{formatTime(elapsedTime)}</div>
                      <div className="text-sm text-muted-foreground">temps</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Appuyez sur <kbd className="px-2 py-1 rounded bg-secondary font-mono text-sm">Tab</kbd> pour recommencer
                  </p>
                </div>
              ) : (
                /* Typing area */
                <div
                  className="p-8 rounded-2xl bg-secondary/30 cursor-text"
                  onClick={() => inputRef.current?.focus()}
                >
                  <div className="text-xl md:text-2xl leading-relaxed font-medium tracking-wide">
                    {text.split('').map((char, index) => {
                      let colorClass = 'text-muted-foreground/40'; // Not typed yet
                      
                      if (index < userInput.length) {
                        if (userInput[index] === char) {
                          colorClass = 'text-foreground'; // Correct
                        } else {
                          colorClass = 'text-destructive'; // Incorrect
                        }
                      }
                      
                      const isCurrentChar = index === userInput.length;
                      
                      return (
                        <span
                          key={index}
                          className={cn(
                            colorClass,
                            isCurrentChar && "border-l-2 border-primary typing-cursor"
                          )}
                        >
                          {char}
                        </span>
                      );
                    })}
                  </div>
                  
                  {/* Hidden input for capturing keystrokes */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    className="absolute opacity-0 pointer-events-none"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
              )}

              {gameState === 'idle' && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Commencez à taper pour lancer le chronomètre
                </p>
              )}
            </div>

            <div className="lg:col-span-1">
              <HistoryPanel
                title="Historique"
                items={history.results.map(r => ({
                  id: r.id,
                  date: r.date,
                  value: r.wpm,
                  secondaryValue: r.accuracy,
                }))}
                bestValue={history.bestWpm}
                valueLabel="WPM"
                secondaryLabel="Précision"
                formatValue={(v) => `${v} WPM`}
                formatSecondary={(v) => `${v}%`}
                onClear={handleClearHistory}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
