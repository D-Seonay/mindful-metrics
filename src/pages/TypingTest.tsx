import { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSoundSystem } from '@/hooks/useSoundSystem';
import { getRandomText, getRandomWords } from '@/lib/typingTexts';
import { cn } from '@/lib/utils';
import type { PerformanceHistory, TypingResult } from '@/types/history';
import { RotateCcw, Timer, Pilcrow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type GameState = 'idle' | 'typing' | 'finished';
type Language = 'fr' | 'en';
type TestMode = 'time' | 'words';

const initialHistory: PerformanceHistory = {
  reflex: [],
  typing: [],
  timePerception: [],
  aimTrainer: [],
  colorSensitivity: []
};

const translations = {
  fr: {
    title: "Test de Vitesse de Frappe",
    subtitle: "Tapez le texte ci-dessous le plus rapidement possible",
    time: "Temps",
    wpm: "WPM",
    accuracy: "Précision",
    restart: "Recommencer",
    resultsTitle: "mots par minute",
    resultsAccuracy: "précision",
    resultsTime: "temps",
    restartHint: "Appuyez sur <kbd class=\"px-2 py-1 rounded bg-secondary font-mono text-sm\">Tab</kbd> pour recommencer",
    startTyping: "Commencez à taper pour lancer le chronomètre",
    punctuation: "Ponctuation",
  },
  en: {
    title: "Typing Speed Test",
    subtitle: "Type the text below as fast as possible",
    time: "Time",
    wpm: "WPM",
    accuracy: "Accuracy",
    restart: "Restart",
    resultsTitle: "words per minute",
    resultsAccuracy: "accuracy",
    resultsTime: "time",
    restartHint: "Press <kbd class=\"px-2 py-1 rounded bg-secondary font-mono text-sm\">Tab</kbd> to restart",
    startTyping: "Start typing to begin the timer",
    punctuation: "Punctuation",
  },
};

const timeOptions = [15, 30, 60, 120];
const wordOptions = [10, 25, 50, 100];

export default function TypingTest() {
  const [language, setLanguage] = useState<Language>('fr');
  const [testMode, setTestMode] = useState<TestMode>('time');
  const [timeOption, setTimeOption] = useState(30);
  const [wordsOption, setWordsOption] = useState(25);
  const [includePunctuation, setIncludePunctuation] = useState(true);

  const [text, setText] = useState(() => getRandomText(language, includePunctuation));
  const [userInput, setUserInput] = useState('');
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [persistentErrorCount, setPersistentErrorCount] = useState(0);
  const [currentErrors, setCurrentErrors] = useState<Set<number>>(new Set());
  const [gameState, setGameState] = useState<GameState>('idle');
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [history, setHistory] = useLocalStorage<PerformanceHistory>('performance-history', initialHistory);
  const [isFocused, setIsFocused] = useState(true);
  const { playSound } = useSoundSystem();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const calculateStats = useCallback(() => {
    if (totalKeystrokes === 0) return { wpm: 0, accuracy: 100 };

    const timeInMinutes = elapsedTime / 60;
    const wordsTyped = (totalKeystrokes - persistentErrorCount) / 5;
    const wpm = timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0;
    
    const accuracy = Math.max(0, ((totalKeystrokes - persistentErrorCount) / totalKeystrokes) * 100);
    
    return { wpm, accuracy: Math.round(accuracy) };
  }, [elapsedTime, persistentErrorCount, totalKeystrokes]);

  const stats = calculateStats();

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 0.01);
    }, 10);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finishGame = useCallback(() => {
    if (gameState === 'finished') return;
    stopTimer();
    setGameState('finished');
    playSound('hit');
    setIsTestStarted(false);
  }, [stopTimer, playSound, gameState]);

  const resetGame = useCallback(() => {
    stopTimer();
    setText(testMode === 'time' ? getRandomWords(100, language, includePunctuation) : getRandomWords(wordsOption, language, includePunctuation));
    setUserInput('');
    setGameState('idle');
    setStartTime(0);
    setElapsedTime(0);
    setTotalKeystrokes(0);
    setPersistentErrorCount(0);
    setCurrentErrors(new Set());
    setIsTestStarted(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [stopTimer, language, testMode, wordsOption, includePunctuation]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    resetGame();
  };
  
  useEffect(() => {
    resetGame();
  }, [testMode, timeOption, wordsOption, language, includePunctuation, resetGame]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const currentInputLength = userInput.length;
    
    if (gameState !== 'finished') {
      if (!isTestStarted && value.length > 0) {
        setIsTestStarted(true);
        setStartTime(Date.now());
        startTimer();
      }

      if (!isTestStarted && value.length === 0) {
        setUserInput('');
        return;
      }
      
      if (value.length < currentInputLength) {
        const deletedCharIndex = currentInputLength - 1;
        setCurrentErrors(prev => {
          const newSet = new Set(prev);
          newSet.delete(deletedCharIndex);
          return newSet;
        });
      } else if (value.length > currentInputLength) {
        const charIndex = value.length - 1;
        const typedChar = value[charIndex];
        const expectedChar = text[charIndex];
        
        setTotalKeystrokes(prev => prev + 1);
        
        if (typedChar !== expectedChar) {
          setPersistentErrorCount(prev => prev + 1);
          setCurrentErrors(prev => new Set(prev).add(charIndex));
          playSound('error');
        } else {
          setCurrentErrors(prev => {
            const newSet = new Set(prev);
            newSet.delete(charIndex);
            return newSet;
          });
          playSound('type');
        }
      }
      setGameState('typing');
      setUserInput(value);

      if (testMode === 'words' && value.length >= text.length) {
        finishGame();
      }
    }
  }, [gameState, isTestStarted, startTimer, userInput.length, playSound, text, testMode, finishGame]);

  useEffect(() => {
    if (gameState === 'finished') {
      const { wpm, accuracy } = calculateStats();

      const newResult: TypingResult = {
        id: crypto.randomUUID(),
        wpm,
        accuracy,
        date: new Date().toISOString(),
      };
      
      setHistory(prev => {
        const newTypingHistory = [newResult, ...(prev.typing || [])].slice(0, 10);
        return {
          ...prev,
          typing: newTypingHistory,
        };
      });
    }
  }, [gameState, calculateStats, setHistory]);

  useEffect(() => {
    if (gameState === 'typing') {
      if (testMode === 'time' && elapsedTime >= timeOption) {
        finishGame();
      }
    }
  }, [gameState, elapsedTime, testMode, timeOption, finishGame]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab' && (gameState === 'finished' || gameState === 'typing' || gameState === 'idle')) {
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

  const formatTime = (seconds: number) => {
    const remaining = testMode === 'time' ? Math.max(0, timeOption - seconds) : seconds;
    const minutes = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const t = translations[language];

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* Compact Settings Bar */}
        <div className={cn(
          "flex flex-wrap items-center justify-between gap-4 mb-12 p-2 rounded-xl bg-secondary/20 border border-border/50 transition-opacity duration-300",
          gameState === 'typing' ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <div className="flex items-center gap-1">
            <Button 
              variant={language === 'fr' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => handleLanguageChange('fr')}
              className="h-8 text-xs font-mono"
            >
              FR
            </Button>
            <Button 
              variant={language === 'en' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => handleLanguageChange('en')}
              className="h-8 text-xs font-mono"
            >
              EN
            </Button>
          </div>

          <div className="h-4 w-[1px] bg-border/50 hidden sm:block" />

          <div className="flex items-center gap-4">
            <ToggleGroup type="single" value={testMode} onValueChange={(value: TestMode) => value && setTestMode(value)} className="bg-transparent">
              <ToggleGroupItem value="time" className="h-8 px-3 text-xs font-mono data-[state=on]:bg-secondary">
                <Timer className="h-3 w-3 mr-2" />
                TIME
              </ToggleGroupItem>
              <ToggleGroupItem value="words" className="h-8 px-3 text-xs font-mono data-[state=on]:bg-secondary">
                <Pilcrow className="h-3 w-3 mr-2" />
                WORDS
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="flex gap-1">
              {(testMode === 'time' ? timeOptions : wordOptions).map(option => (
                <Button 
                  key={option} 
                  variant={(testMode === 'time' ? timeOption : wordsOption) === option ? 'secondary' : 'ghost'} 
                  size="sm"
                  onClick={() => testMode === 'time' ? setTimeOption(option) : setWordsOption(option)}
                  className="h-8 px-3 text-xs font-mono"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div className="h-4 w-[1px] bg-border/50 hidden sm:block" />

          <div className="flex items-center gap-2">
            <Button
              variant={includePunctuation ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setIncludePunctuation(!includePunctuation)}
              className="h-8 px-3 text-xs font-mono"
            >
              {t.punctuation.toUpperCase()}
            </Button>
          </div>
        </div>

        {/* HUD Stats */}
        <div className="flex justify-start gap-12 mb-8 font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{t.time}</span>
            <span className="text-2xl font-bold tabular-nums text-primary">
              {formatTime(elapsedTime)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{t.wpm}</span>
            <span className="text-2xl font-bold tabular-nums">
              {stats.wpm}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{t.accuracy}</span>
            <span className="text-2xl font-bold tabular-nums">
              {stats.accuracy}%
            </span>
          </div>
          <div className="ml-auto flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => resetGame()}
              className="h-8 px-3 text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-2" />
              {t.restart.toUpperCase()}
            </Button>
          </div>
        </div>

        <div className="relative">
          {gameState === 'finished' ? (
            /* Results screen */
            <div className="p-12 rounded-2xl bg-secondary/10 border border-border/50 text-center result-display">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{t.resultsTitle}</div>
                  <div className="text-6xl font-bold text-primary">{stats.wpm}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{t.resultsAccuracy}</div>
                  <div className="text-4xl font-bold">{stats.accuracy}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{t.resultsTime}</div>
                  <div className="text-4xl font-bold tabular-nums">{elapsedTime.toFixed(1)}s</div>
                </div>
              </div>
              <div className="mt-12 flex flex-col items-center gap-4">
                <Button onClick={resetGame} size="lg" className="rounded-full px-8 font-mono">
                  {t.restart.toUpperCase()}
                </Button>
                <p className="text-xs text-muted-foreground font-mono" dangerouslySetInnerHTML={{ __html: t.restartHint }}></p>
              </div>
            </div>
          ) : (
            /* Typing area */
            <div
              className={cn(
                "relative p-8 rounded-2xl transition-all duration-500 cursor-text min-h-[200px]",
                !isFocused && "blur-sm grayscale-[0.5] opacity-50"
              )}
              onClick={() => inputRef.current?.focus()}
            >
              <div className="text-2xl md:text-3xl leading-relaxed font-mono tracking-tight text-left select-none">
                {text.split('').map((char, index) => {
                  let colorClass = 'text-muted-foreground/30';
                  
                  if (index < userInput.length) {
                    if (userInput[index] === char) {
                      colorClass = 'text-foreground';
                    } else {
                      colorClass = 'text-destructive';
                    }
                  }
                  
                  const isCurrentChar = index === userInput.length;
                  
                  return (
                    <span
                      key={index}
                      className={cn(
                        colorClass,
                        "transition-colors duration-150 relative",
                        isCurrentChar && "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary after:animate-pulse"
                      )}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>

              {/* Unfocused overlay */}
              {!isFocused && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="bg-background/80 backdrop-blur-sm px-6 py-3 rounded-full border border-border shadow-xl">
                    <p className="text-sm font-mono tracking-widest uppercase">Click to Focus</p>
                  </div>
                </div>
              )}
              
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="absolute opacity-0 pointer-events-none"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
          )}

          {gameState === 'idle' && isFocused && (
            <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <p className="text-xs font-mono text-muted-foreground tracking-[0.2em] uppercase">
                {t.startTyping}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}