export interface ReflexResult {
  id: string;
  time: number; // in milliseconds
  date: string; // ISO string
}

export interface TypingResult {
  id: string;
  wpm: number;
  accuracy: number;
  date: string; // ISO string
}

export type ReflexHistory = ReflexResult[];

export type TypingHistory = TypingResult[];

export interface PerformanceHistory {
  reflex: ReflexHistory;
  typing: TypingHistory;
}
