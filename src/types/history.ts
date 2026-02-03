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
  mode: 'TIME_ATTACK' | 'PRECISION' | 'cLASSIC'; // Added modes, 'CLASSIC' for backward compatibility
  score?: number; // Targets hit (primary metric for Time Attack)
  totalTime: number; // Duration of the session
  averageTimePerTarget: number;
  accuracy?: number; // Hits / Clicks
  date: string; // ISO string
}

export type ReflexHistory = ReflexResult[];

export type TypingHistory = TypingResult[];

export type TimePerceptionHistory = TimePerceptionResult[];

export type AimTrainerHistory = AimTrainerResult[];

export interface PerformanceHistory {
  reflex: ReflexHistory;
  typing: TypingHistory;
  timePerception: TimePerceptionHistory;
  aimTrainer: AimTrainerHistory;
}
