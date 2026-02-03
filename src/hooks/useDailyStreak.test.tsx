import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useDailyStreak } from './useDailyStreak';

describe('useDailyStreak', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with count 1 on first visit', () => {
    const { result } = renderHook(() => useDailyStreak());

    expect(result.current.streak).toBe(1);
    
    const stored = JSON.parse(window.localStorage.getItem('daily-streak') || '{}');
    expect(stored.count).toBe(1);
    expect(stored.lastPlayedDate).toBeDefined();
  });

  it('should not increment if played today', () => {
    // Set a date
    const today = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(today);

    // Initialize first play
    const { result, unmount } = renderHook(() => useDailyStreak());
    expect(result.current.streak).toBe(1);
    unmount();

    // Play again same day (later)
    const later = new Date('2024-01-01T15:00:00Z');
    vi.setSystemTime(later);
    
    const { result: result2 } = renderHook(() => useDailyStreak());
    expect(result2.current.streak).toBe(1);
  });

  it('should increment if played yesterday', () => {
    // Set initial date
    const day1 = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(day1);

    const { unmount } = renderHook(() => useDailyStreak());
    unmount();

    // Advance to next day
    const day2 = new Date('2024-01-02T12:00:00Z');
    vi.setSystemTime(day2);

    const { result } = renderHook(() => useDailyStreak());
    expect(result.current.streak).toBe(2);
  });

  it('should reset if played before yesterday', () => {
    // Set initial date
    const day1 = new Date('2024-01-01T12:00:00Z');
    vi.setSystemTime(day1);

    const { unmount } = renderHook(() => useDailyStreak());
    unmount();

    // Advance to day 3 (skip day 2)
    const day3 = new Date('2024-01-03T12:00:00Z');
    vi.setSystemTime(day3);

    const { result } = renderHook(() => useDailyStreak());
    expect(result.current.streak).toBe(1);
  });
  
  it('should handle edge case: 11:59 PM to 00:01 AM', () => {
     // 11:59 PM
     const day1 = new Date('2024-01-01T23:59:00');
     vi.setSystemTime(day1);
     
     const { unmount } = renderHook(() => useDailyStreak());
     unmount();
     
     // 00:01 AM next day
     const day2 = new Date('2024-01-02T00:01:00');
     vi.setSystemTime(day2);
     
     const { result } = renderHook(() => useDailyStreak());
     expect(result.current.streak).toBe(2);
  });
});
