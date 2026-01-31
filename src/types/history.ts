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

export interface ReflexHistory {
  results: ReflexResult[];
  bestTime: number | null;
}

export interface TypingHistory {
  results: TypingResult[];
  bestWpm: number | null;
}
