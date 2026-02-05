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
  aimTrainer: []
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
  const [mistakesCount, setMistakesCount] = useState(0);
  const [totalCharsTyped, setTotalCharsTyped] = useState(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [history, setHistory] = useLocalStorage<PerformanceHistory>('performance-history', initialHistory);
  const { playSound } = useSoundSystem();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  
  const calculateStats = useCallback(() => {
    if (totalCharsTyped === 0) return { wpm: 0, accuracy: 100 };

    const timeInMinutes = elapsedTime / 60;
    const wordsTyped = userInput.length / 5; // Standard: 5 chars = 1 word
    const wpm = timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0;
    
    const accuracy = Math.max(0, Math.round(((totalCharsTyped - mistakesCount) / totalCharsTyped) * 100));
    
    return { wpm, accuracy };
  }, [userInput, elapsedTime, mistakesCount, totalCharsTyped]);

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
    if (testMode === 'time') {
      setText(getRandomWords(100, language, includePunctuation));
    } else {
      setText(getRandomWords(wordsOption, language, includePunctuation));
    }
    setUserInput('');
    setGameState('idle');
    setStartTime(0);
    setElapsedTime(0);
    setMistakesCount(0);
    setTotalCharsTyped(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [stopTimer, language, testMode, wordsOption, includePunctuation]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    resetGame();
  };
  
  useEffect(() => {
    resetGame();
  }, [testMode, timeOption, wordsOption, language, includePunctuation]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (gameState !== 'finished') {
      if (value.length > userInput.length) {
        const charIndex = value.length - 1;
        const typedChar = value[charIndex];
        const expectedChar = text[charIndex];
        
        setTotalCharsTyped(prev => prev + 1);

        if (typedChar !== expectedChar) {
          setMistakesCount(prev => prev + 1);
          playSound('error');
        } else {
          playSound('type');
        }
      }

      if (gameState === 'idle' && value.length > 0) {
        setGameState('typing');
        setStartTime(Date.now());
        startTimer();
      }
      
      setUserInput(value);
    }
  }, [gameState, startTimer, userInput.length, playSound, text]);

  const finishGame = useCallback(() => {
    stopTimer();
    setGameState('finished');
    playSound('hit');
  }, [stopTimer, playSound]);

  useEffect(() => {
    if (gameState === 'finished') {
      const finalWpm = elapsedTime > 0 ? Math.round((userInput.length / 5) / (elapsedTime / 60)) : 0;
      const finalAccuracy = totalCharsTyped > 0 
        ? Math.max(0, Math.round(((totalCharsTyped - mistakesCount) / totalCharsTyped) * 100))
        : 100;

      const newResult: TypingResult = {
        id: crypto.randomUUID(),
        wpm: finalWpm,
        accuracy: finalAccuracy,
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
  }, [gameState, elapsedTime, userInput, totalCharsTyped, mistakesCount, setHistory]);

  useEffect(() => {
    if (gameState === 'typing') {
      if (testMode === 'time' && elapsedTime >= timeOption) {
        finishGame();
      }
      if (testMode === 'words' && userInput.length >= text.length) {
        finishGame();
      }
    }
  }, [gameState, elapsedTime, userInput, text, testMode, timeOption, finishGame]);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const t = translations[language];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">{t.title}</h1>
            <p className="text-muted-foreground">{t.subtitle}</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => handleLanguageChange('fr')} variant={language === 'fr' ? 'secondary' : 'ghost'}>Français</Button>
              <Button onClick={() => handleLanguageChange('en')} variant={language === 'en' ? 'secondary' : 'ghost'}>English</Button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 mb-8">
            <ToggleGroup type="single" value={includePunctuation ? 'on' : 'off'} onValueChange={(value) => setIncludePunctuation(value === 'on')}>
              <ToggleGroupItem value="on" aria-label="With punctuation">
                Punctuation
              </ToggleGroupItem>
              <ToggleGroupItem value="off" aria-label="No punctuation">
                No Punctuation
              </ToggleGroupItem>
            </ToggleGroup>

            <ToggleGroup type="single" value={testMode} onValueChange={(value: TestMode) => value && setTestMode(value)}>
              <ToggleGroupItem value="time" aria-label="Time mode">
                <Timer className="h-4 w-4 mr-2" />
                Time
              </ToggleGroupItem>
              <ToggleGroupItem value="words" aria-label="Words mode">
                <Pilcrow className="h-4 w-4 mr-2" />
                Words
              </ToggleGroupItem>
            </ToggleGroup>

            {testMode === 'time' && (
              <div className="flex gap-2">
                {timeOptions.map(option => (
                  <Button key={option} variant={timeOption === option ? 'secondary' : 'ghost'} onClick={() => setTimeOption(option)}>
                    {option}s
                  </Button>
                ))}
              </div>
            )}

            {testMode === 'words' && (
              <div className="flex gap-2">
                {wordOptions.map(option => (
                  <Button key={option} variant={wordsOption === option ? 'secondary' : 'ghost'} onClick={() => setWordsOption(option)}>
                    {option}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-4">
              {/* Stats bar */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{t.time}</span>
                  <span className="font-semibold tabular-nums">{formatTime(elapsedTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{t.wpm}</span>
                  <span className="font-semibold tabular-nums">{stats.wpm}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{t.accuracy}</span>
                  <span className="font-semibold tabular-nums">{stats.accuracy}%</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resetGame()}
                  className="ml-auto h-8 px-3"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                  {t.restart}
                </Button>
              </div>

              {gameState === 'finished' ? (
                /* Results screen */
                <div className="p-6 md:p-12 rounded-2xl bg-secondary/30 text-center result-display">
                  <div className="mb-8">
                    <div className="text-5xl md:text-7xl font-extrabold mb-2 animate-pulse-subtle">
                      {stats.wpm}
                    </div>
                    <div className="text-xl text-muted-foreground">{t.resultsTitle}</div>
                  </div>
                  <div className="flex items-center justify-center gap-8 mb-8">
                    <div>
                      <div className="text-3xl font-bold">{stats.accuracy}%</div>
                      <div className="text-sm text-muted-foreground">{t.resultsAccuracy}</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold">{formatTime(elapsedTime)}</div>
                      <div className="text-sm text-muted-foreground">{t.resultsTime}</div>
                    </div>
                  </div>
                  <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t.restartHint }}></p>
                </div>
              ) : (
                /* Typing area */
                <div
                  className="p-4 md:p-8 rounded-2xl bg-secondary/30 cursor-text"
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
                  {t.startTyping}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}