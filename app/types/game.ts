export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type GameStatus = 'setup' | 'playing' | 'paused' | 'completed';

export interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  pairId: number;
}

export interface EmojiCategory {
  id: string;
  name: string;
  emojis: string[];
  description: string;
}

export interface GameState {
  board: Card[];
  flippedCards: number[];
  matchedPairs: number[];
  moves: number;
  timeElapsed: number;
  gameStatus: GameStatus;
  difficulty: Difficulty;
  category: EmojiCategory;
  score: number;
}

export interface GameStats {
  totalGames: number;
  bestTimes: Record<Difficulty, number>;
  bestMoves: Record<Difficulty, number>;
  completionRate: number;
  averageTime: number;
  averageMoves: number;
  gamesWon: number;
  gamesLost: number;
}

export interface GameAction {
  type: 'FLIP_CARD' | 'MATCH_CARDS' | 'UNMATCH_CARDS' | 'RESET_GAME' | 'START_GAME' | 'PAUSE_GAME' | 'RESUME_GAME' | 'COMPLETE_GAME' | 'UPDATE_TIME';
  payload?: {
    cardId?: number;
    cardIds?: number[];
    difficulty?: Difficulty;
    category?: EmojiCategory;
    timeElapsed?: number;
  };
}

export interface TimerState {
  timeElapsed: number;
  isRunning: boolean;
  isPaused: boolean;
}

export interface LocalStorageData {
  gameStats: GameStats;
  highScores: Array<{
    difficulty: Difficulty;
    category: string;
    moves: number;
    time: number;
    score: number;
    date: string;
  }>;
  preferences: {
    soundEnabled: boolean;
    animationEnabled: boolean;
    defaultDifficulty: Difficulty;
    defaultCategory: string;
  };
}

export interface DifficultyConfig {
  rows: number;
  cols: number;
  pairs: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: { rows: 4, cols: 4, pairs: 8 },
  medium: { rows: 4, cols: 6, pairs: 12 },
  hard: { rows: 6, cols: 6, pairs: 18 },
  expert: { rows: 6, cols: 8, pairs: 24 }
};