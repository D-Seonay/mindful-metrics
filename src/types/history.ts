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

export interface ColorSensitivityResult {
  id: string;
  score: number; // level reached
  difficulty: "facile" | "normal" | "difficile";
  date: string; // ISO string
}

export interface ColorMemoryResult {
  id: string;
  score: number; // level reached
  accuracy: number; // percentage of correct clicks
  date: string; // ISO string
}

export interface CircleMemoryResult {
  id: string;
  score: number; // 0-100
  date: string; // ISO string
}

export interface PeripheralVisionResult {
  id: string;
  averageTime: number; // in milliseconds
  accuracy: number; // percentage
  targetsHit: number;
  date: string; // ISO string
}

export type ReflexHistory = ReflexResult[];

export type TypingHistory = TypingResult[];

export type TimePerceptionHistory = TimePerceptionResult[];

export type AimTrainerHistory = AimTrainerResult[];

export type ColorSensitivityHistory = ColorSensitivityResult[];

export type ColorMemoryHistory = ColorMemoryResult[];

export type CircleMemoryHistory = CircleMemoryResult[];

export type PeripheralVisionHistory = PeripheralVisionResult[];

export interface PerformanceHistory {
  reflex: ReflexHistory;
  typing: TypingHistory;
  timePerception: TimePerceptionHistory;
  aimTrainer: AimTrainerHistory;
  colorSensitivity: ColorSensitivityHistory;
  colorMemory: ColorMemoryHistory;
  circleMemory: CircleMemoryHistory;
  peripheralVision: PeripheralVisionHistory;
}
