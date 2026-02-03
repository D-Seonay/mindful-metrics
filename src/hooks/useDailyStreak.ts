import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { isToday, isYesterday, parseISO } from 'date-fns';

interface StreakData {
  count: number;
  lastPlayedDate: string | null;
}

export function useDailyStreak() {
  const [streakData, setStreakData] = useLocalStorage<StreakData>('daily-streak', {
    count: 0,
    lastPlayedDate: null,
  });

  const updateStreak = () => {
    const today = new Date().toISOString();
    
    // If never played
    if (!streakData.lastPlayedDate) {
      setStreakData({
        count: 1,
        lastPlayedDate: today,
      });
      return;
    }

    const lastPlayed = parseISO(streakData.lastPlayedDate);

    // If already played today, do nothing
    if (isToday(lastPlayed)) {
      return;
    }

    // If played yesterday, increment
    if (isYesterday(lastPlayed)) {
      setStreakData({
        count: streakData.count + 1,
        lastPlayedDate: today,
      });
    } else {
      // If played before yesterday, reset to 1
      setStreakData({
        count: 1,
        lastPlayedDate: today,
      });
    }
  };

  // Check streak on mount (app open)
  useEffect(() => {
    updateStreak();
  }, []);

  return {
    streak: streakData.count,
    updateStreak,
  };
}
