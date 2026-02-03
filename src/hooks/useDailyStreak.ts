import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { isToday, isYesterday, parseISO, format } from 'date-fns';

interface StreakData {
  count: number;
  lastPlayedDate: string | null;
}

export type ActivityHistory = Record<string, number>;

export function useDailyStreak() {
  const [streakData, setStreakData] = useLocalStorage<StreakData>('daily-streak', {
    count: 0,
    lastPlayedDate: null,
  });

  const [history, setHistory] = useLocalStorage<ActivityHistory>('activity-history', {});

  const updateStreak = useCallback(() => {
    const now = new Date();
    const todayISO = now.toISOString();
    const todayKey = format(now, 'yyyy-MM-dd');
    
    // 1. Update Streak Logic
    setStreakData((prev) => {
      // If never played
      if (!prev.lastPlayedDate) {
        return { count: 1, lastPlayedDate: todayISO };
      }

      const lastPlayed = parseISO(prev.lastPlayedDate);

      // If already played today, do nothing to streak
      if (isToday(lastPlayed)) {
        return prev;
      }

      // If played yesterday, increment
      if (isYesterday(lastPlayed)) {
        return { count: prev.count + 1, lastPlayedDate: todayISO };
      }

      // If played before yesterday, reset to 1
      return { count: 1, lastPlayedDate: todayISO };
    });

    // 2. Update History Logic (Log a login/visit)
    setHistory((prev) => {
      const currentCount = prev[todayKey] || 0;
      // We only want to count distinct "sessions" or days here? 
      // The prompt implies "activity history", so incrementing is good.
      // For now, let's just ensure the day exists. 
      // If we want to track *intensity*, we should probably have a separate explicit "increment" method.
      // But for "Daily Streak" context, simply ensuring the key exists is enough for a basic heatmap (0 or 1).
      // Let's count it as 1 if it doesn't exist.
      if (!prev[todayKey]) {
        return { ...prev, [todayKey]: 1 };
      }
      return prev;
    });
  }, [setStreakData, setHistory]);

  const incrementActivity = useCallback(() => {
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    setHistory((prev) => ({
      ...prev,
      [todayKey]: (prev[todayKey] || 0) + 1,
    }));
  }, [setHistory]);

  // Check streak on mount (app open)
  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  return {
    streak: streakData.count,
    history,
    incrementActivity,
  };
}