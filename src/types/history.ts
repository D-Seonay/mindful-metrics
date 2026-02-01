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

export interface TimePerceptionResult {
  id: string;
  time: number; // in seconds
  difference: number; // in seconds
  date: string; // ISO string
}

export type ReflexHistory = ReflexResult[];

export type TypingHistory = TypingResult[];

export type TimePerceptionHistory = TimePerceptionResult[];

export interface PerformanceHistory {
  reflex: ReflexHistory;
  typing: TypingHistory;
  timePerception: TimePerceptionHistory;
}
