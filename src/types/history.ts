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

export interface AimTrainerResult {
  id: string;
  totalTime: number; // in milliseconds
  averageTimePerTarget: number; // in milliseconds
  date: string; // ISO string
}

export interface VisualMemoryResult {
  id: string;
  levelReached: number;
  date: string; // ISO string
}

export type ReflexHistory = ReflexResult[];

export type TypingHistory = TypingResult[];

export type TimePerceptionHistory = TimePerceptionResult[];

export type AimTrainerHistory = AimTrainerResult[];

export type VisualMemoryHistory = VisualMemoryResult[];

export interface PerformanceHistory {
  reflex: ReflexHistory;
  typing: TypingHistory;
  timePerception: TimePerceptionHistory;
  aimTrainer: AimTrainerHistory;
  visualMemory: VisualMemoryHistory;
}
