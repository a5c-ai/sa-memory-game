import { Difficulty, GameStats, DIFFICULTY_CONFIGS } from '../types/game';

/**
 * Scoring system configuration
 */
export const SCORING_CONFIG = {
  BASE_MATCH_POINTS: 100,           // Base points for each successful match
  PERFECT_MATCH_BONUS: 500,         // Bonus for completing without mistakes
  TIME_BONUS_MAX: 1000,             // Maximum time bonus points
  TIME_BONUS_THRESHOLD: 300,        // Time in seconds for maximum bonus (5 minutes)
  MOVE_PENALTY_MULTIPLIER: 10,      // Points deducted per move beyond optimal
  DIFFICULTY_MULTIPLIERS: {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0,
    expert: 2.5
  } as Record<Difficulty, number>,
  STREAK_BONUS: 50,                 // Bonus points for consecutive matches
  COMPLETION_BONUS: 200             // Bonus for completing the game
};

/**
 * Calculate optimal number of moves for a difficulty
 * Optimal moves = number of pairs (minimum moves if perfect memory)
 */
export function calculateOptimalMoves(difficulty: Difficulty): number {
  return DIFFICULTY_CONFIGS[difficulty].pairs;
}

/**
 * Calculate time-based bonus points
 * Faster completion = higher bonus (diminishing returns)
 */
export function calculateTimeBonus(timeElapsed: number): number {
  const { TIME_BONUS_MAX, TIME_BONUS_THRESHOLD } = SCORING_CONFIG;
  
  if (timeElapsed <= 0) return TIME_BONUS_MAX;
  
  // Linear decay from max bonus to 0 over the threshold time
  const timeBonus = Math.max(0, TIME_BONUS_MAX * (1 - timeElapsed / TIME_BONUS_THRESHOLD));
  
  return Math.round(timeBonus);
}

/**
 * Calculate move efficiency bonus/penalty
 * Fewer moves than optimal = bonus, more moves = penalty
 */
export function calculateMoveEfficiencyScore(moves: number, difficulty: Difficulty): number {
  const optimalMoves = calculateOptimalMoves(difficulty);
  const moveDifference = moves - optimalMoves;
  
  if (moveDifference <= 0) {
    // Bonus for efficiency (completing in optimal or fewer moves)
    return Math.abs(moveDifference) * SCORING_CONFIG.MOVE_PENALTY_MULTIPLIER;
  } else {
    // Penalty for extra moves
    return -moveDifference * SCORING_CONFIG.MOVE_PENALTY_MULTIPLIER;
  }
}

/**
 * Calculate difficulty multiplier bonus
 */
export function calculateDifficultyBonus(baseScore: number, difficulty: Difficulty): number {
  const multiplier = SCORING_CONFIG.DIFFICULTY_MULTIPLIERS[difficulty];
  return Math.round(baseScore * (multiplier - 1));
}

/**
 * Calculate score for a single match
 */
export function calculateMatchScore(
  difficulty: Difficulty,
  timeElapsed: number,
  totalMoves: number,
  consecutiveMatches: number = 0
): number {
  const { BASE_MATCH_POINTS, STREAK_BONUS } = SCORING_CONFIG;
  
  let score = BASE_MATCH_POINTS;
  
  // Add streak bonus
  if (consecutiveMatches > 1) {
    score += (consecutiveMatches - 1) * STREAK_BONUS;
  }
  
  // Apply difficulty multiplier
  score *= SCORING_CONFIG.DIFFICULTY_MULTIPLIERS[difficulty];
  
  return Math.round(score);
}

/**
 * Calculate final game score
 */
export function calculateGameScore(
  difficulty: Difficulty,
  timeElapsed: number,
  moves: number,
  matchedPairs: number,
  isCompleted: boolean = false
): number {
  const { BASE_MATCH_POINTS, COMPLETION_BONUS, PERFECT_MATCH_BONUS } = SCORING_CONFIG;
  
  // Base score from matches
  let score = matchedPairs * BASE_MATCH_POINTS;
  
  // Apply difficulty multiplier to base score
  score *= SCORING_CONFIG.DIFFICULTY_MULTIPLIERS[difficulty];
  
  if (isCompleted) {
    // Time bonus for completion
    const timeBonus = calculateTimeBonus(timeElapsed);
    score += timeBonus;
    
    // Move efficiency bonus/penalty
    const moveEfficiency = calculateMoveEfficiencyScore(moves, difficulty);
    score += moveEfficiency;
    
    // Completion bonus
    score += COMPLETION_BONUS;
    
    // Perfect game bonus (completed in optimal moves)
    const optimalMoves = calculateOptimalMoves(difficulty);
    if (moves === optimalMoves) {
      score += PERFECT_MATCH_BONUS;
    }
  }
  
  return Math.max(0, Math.round(score));
}

/**
 * Calculate score breakdown for display
 */
export interface ScoreBreakdown {
  baseScore: number;
  timeBonus: number;
  moveEfficiency: number;
  difficultyBonus: number;
  completionBonus: number;
  perfectBonus: number;
  totalScore: number;
}

export function calculateScoreBreakdown(
  difficulty: Difficulty,
  timeElapsed: number,
  moves: number,
  matchedPairs: number,
  isCompleted: boolean = false
): ScoreBreakdown {
  const { BASE_MATCH_POINTS, COMPLETION_BONUS, PERFECT_MATCH_BONUS } = SCORING_CONFIG;
  
  const baseScore = matchedPairs * BASE_MATCH_POINTS;
  const difficultyBonus = calculateDifficultyBonus(baseScore, difficulty);
  
  let timeBonus = 0;
  let moveEfficiency = 0;
  let completionBonus = 0;
  let perfectBonus = 0;
  
  if (isCompleted) {
    timeBonus = calculateTimeBonus(timeElapsed);
    moveEfficiency = calculateMoveEfficiencyScore(moves, difficulty);
    completionBonus = COMPLETION_BONUS;
    
    const optimalMoves = calculateOptimalMoves(difficulty);
    if (moves === optimalMoves) {
      perfectBonus = PERFECT_MATCH_BONUS;
    }
  }
  
  const totalScore = Math.max(0, baseScore + difficultyBonus + timeBonus + moveEfficiency + completionBonus + perfectBonus);
  
  return {
    baseScore,
    timeBonus,
    moveEfficiency,
    difficultyBonus,
    completionBonus,
    perfectBonus,
    totalScore
  };
}

/**
 * Calculate game efficiency rating (0-100)
 */
export function calculateEfficiencyRating(
  difficulty: Difficulty,
  timeElapsed: number,
  moves: number
): number {
  const optimalMoves = calculateOptimalMoves(difficulty);
  const { TIME_BONUS_THRESHOLD } = SCORING_CONFIG;
  
  // Move efficiency (0-50 points)
  const moveEfficiency = Math.max(0, 50 - ((moves - optimalMoves) / optimalMoves) * 25);
  
  // Time efficiency (0-50 points)
  const timeEfficiency = Math.max(0, 50 - (timeElapsed / TIME_BONUS_THRESHOLD) * 25);
  
  return Math.round(Math.min(100, moveEfficiency + timeEfficiency));
}

/**
 * Update game statistics with a completed game
 */
export function updateGameStats(
  currentStats: GameStats,
  difficulty: Difficulty,
  timeElapsed: number,
  moves: number,
  score: number,
  isWon: boolean
): GameStats {
  const updatedStats = { ...currentStats };
  
  // Update game counts
  updatedStats.totalGames += 1;
  if (isWon) {
    updatedStats.gamesWon += 1;
  } else {
    updatedStats.gamesLost += 1;
  }
  
  // Update completion rate
  updatedStats.completionRate = (updatedStats.gamesWon / updatedStats.totalGames) * 100;
  
  // Update best times and moves for this difficulty
  if (isWon) {
    if (!updatedStats.bestTimes[difficulty] || timeElapsed < updatedStats.bestTimes[difficulty]) {
      updatedStats.bestTimes[difficulty] = timeElapsed;
    }
    
    if (!updatedStats.bestMoves[difficulty] || moves < updatedStats.bestMoves[difficulty]) {
      updatedStats.bestMoves[difficulty] = moves;
    }
  }
  
  // Update averages
  const totalTime = (currentStats.averageTime * currentStats.totalGames) + timeElapsed;
  const totalMoves = (currentStats.averageMoves * currentStats.totalGames) + moves;
  
  updatedStats.averageTime = totalTime / updatedStats.totalGames;
  updatedStats.averageMoves = totalMoves / updatedStats.totalGames;
  
  return updatedStats;
}

/**
 * Get score grade based on efficiency rating
 */
export function getScoreGrade(efficiencyRating: number): string {
  if (efficiencyRating >= 90) return 'S';
  if (efficiencyRating >= 80) return 'A';
  if (efficiencyRating >= 70) return 'B';
  if (efficiencyRating >= 60) return 'C';
  if (efficiencyRating >= 50) return 'D';
  return 'F';
}

/**
 * Format score for display with separators
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Format time for display (MM:SS)
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}