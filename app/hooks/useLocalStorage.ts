'use client';

import { useState, useEffect, useCallback } from 'react';
import { LocalStorageData, GameStats, Difficulty } from '../types/game';

// Default values for local storage data
const defaultGameStats: GameStats = {
  totalGames: 0,
  bestTimes: {
    easy: Infinity,
    medium: Infinity,
    hard: Infinity,
    expert: Infinity
  },
  bestMoves: {
    easy: Infinity,
    medium: Infinity,
    hard: Infinity,
    expert: Infinity
  },
  completionRate: 0,
  averageTime: 0,
  averageMoves: 0,
  gamesWon: 0,
  gamesLost: 0
};

const defaultLocalStorageData: LocalStorageData = {
  gameStats: defaultGameStats,
  highScores: [],
  preferences: {
    soundEnabled: true,
    animationEnabled: true,
    defaultDifficulty: 'easy',
    defaultCategory: 'food'
  }
};

const STORAGE_KEY = 'emoji-memory-game-data';

function isClient(): boolean {
  return typeof window !== 'undefined';
}

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Failed to parse stored data:', error);
    return fallback;
  }
}

function safeLocalStorageGetItem(key: string): string | null {
  if (!isClient()) return null;
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return null;
  }
}

function safeLocalStorageSetItem(key: string, value: string): boolean {
  if (!isClient()) return false;
  
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn('Failed to write to localStorage:', error);
    return false;
  }
}

export function useLocalStorage() {
  const [data, setData] = useState<LocalStorageData>(defaultLocalStorageData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = safeLocalStorageGetItem(STORAGE_KEY);
    const parsedData = safeJsonParse(stored, defaultLocalStorageData);
    
    // Merge with defaults to handle partial data or missing fields
    const mergedData: LocalStorageData = {
      gameStats: { ...defaultGameStats, ...parsedData.gameStats },
      highScores: parsedData.highScores || [],
      preferences: { ...defaultLocalStorageData.preferences, ...parsedData.preferences }
    };
    
    setData(mergedData);
    setIsLoaded(true);
  }, []);

  // Save data to localStorage whenever it changes
  const saveData = useCallback((newData: LocalStorageData) => {
    setData(newData);
    const success = safeLocalStorageSetItem(STORAGE_KEY, JSON.stringify(newData));
    if (!success) {
      console.warn('Failed to save game data to localStorage');
    }
  }, []);

  // Update game statistics
  const updateGameStats = useCallback((
    difficulty: Difficulty,
    moves: number,
    time: number,
    won: boolean,
    score: number,
    category: string
  ) => {
    const newData = { ...data };
    const stats = newData.gameStats;
    
    // Update basic stats
    stats.totalGames += 1;
    if (won) {
      stats.gamesWon += 1;
      
      // Update best times and moves only for won games
      if (time < stats.bestTimes[difficulty]) {
        stats.bestTimes[difficulty] = time;
      }
      if (moves < stats.bestMoves[difficulty]) {
        stats.bestMoves[difficulty] = moves;
      }
      
      // Add to high scores
      newData.highScores.push({
        difficulty,
        category,
        moves,
        time,
        score,
        date: new Date().toISOString()
      });
      
      // Keep only top 10 scores per difficulty
      newData.highScores = newData.highScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 100); // Keep more scores for analysis
    } else {
      stats.gamesLost += 1;
    }
    
    // Calculate completion rate
    stats.completionRate = stats.totalGames > 0 ? (stats.gamesWon / stats.totalGames) * 100 : 0;
    
    // Calculate averages (only for won games)
    if (stats.gamesWon > 0) {
      const wonGames = newData.highScores;
      stats.averageTime = wonGames.reduce((sum, game) => sum + game.time, 0) / wonGames.length;
      stats.averageMoves = wonGames.reduce((sum, game) => sum + game.moves, 0) / wonGames.length;
    }
    
    saveData(newData);
  }, [data, saveData]);

  // Get high scores for a specific difficulty
  const getHighScores = useCallback((difficulty?: Difficulty, limit: number = 10) => {
    let scores = data.highScores;
    
    if (difficulty) {
      scores = scores.filter(score => score.difficulty === difficulty);
    }
    
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }, [data.highScores]);

  // Get statistics for a specific difficulty
  const getDifficultyStats = useCallback((difficulty: Difficulty) => {
    const difficultyScores = data.highScores.filter(score => score.difficulty === difficulty);
    
    return {
      gamesPlayed: difficultyScores.length,
      bestTime: data.gameStats.bestTimes[difficulty] === Infinity ? 0 : data.gameStats.bestTimes[difficulty],
      bestMoves: data.gameStats.bestMoves[difficulty] === Infinity ? 0 : data.gameStats.bestMoves[difficulty],
      averageTime: difficultyScores.length > 0 
        ? difficultyScores.reduce((sum, game) => sum + game.time, 0) / difficultyScores.length 
        : 0,
      averageMoves: difficultyScores.length > 0 
        ? difficultyScores.reduce((sum, game) => sum + game.moves, 0) / difficultyScores.length 
        : 0,
      highestScore: difficultyScores.length > 0 
        ? Math.max(...difficultyScores.map(score => score.score)) 
        : 0
    };
  }, [data.gameStats.bestTimes, data.gameStats.bestMoves, data.highScores]);

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<LocalStorageData['preferences']>) => {
    const newData = {
      ...data,
      preferences: {
        ...data.preferences,
        ...updates
      }
    };
    saveData(newData);
  }, [data, saveData]);

  // Clear all data
  const clearAllData = useCallback(() => {
    saveData(defaultLocalStorageData);
  }, [saveData]);

  // Clear only statistics
  const clearStats = useCallback(() => {
    const newData = {
      ...data,
      gameStats: defaultGameStats,
      highScores: []
    };
    saveData(newData);
  }, [data, saveData]);

  // Export data as JSON
  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  // Import data from JSON
  const importData = useCallback((jsonData: string) => {
    try {
      const importedData = JSON.parse(jsonData) as LocalStorageData;
      
      // Validate the imported data structure
      if (!importedData.gameStats || !importedData.highScores || !importedData.preferences) {
        throw new Error('Invalid data structure');
      }
      
      saveData(importedData);
      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }, [saveData]);

  // Check if personal best was achieved
  const isPersonalBest = useCallback((difficulty: Difficulty, moves: number, time: number) => {
    const stats = data.gameStats;
    const isBestTime = time < stats.bestTimes[difficulty];
    const isBestMoves = moves < stats.bestMoves[difficulty];
    
    return {
      time: isBestTime,
      moves: isBestMoves,
      either: isBestTime || isBestMoves
    };
  }, [data.gameStats]);

  return {
    // Data
    data,
    gameStats: data.gameStats,
    highScores: data.highScores,
    preferences: data.preferences,
    
    // State
    isLoaded,
    
    // Actions
    updateGameStats,
    updatePreferences,
    clearAllData,
    clearStats,
    
    // Utilities
    getHighScores,
    getDifficultyStats,
    isPersonalBest,
    exportData,
    importData,
    
    // Computed values
    hasPlayedBefore: data.gameStats.totalGames > 0,
    totalPlayTime: data.highScores.reduce((sum, score) => sum + score.time, 0),
    favoriteCategory: data.highScores.length > 0 
      ? data.highScores.reduce((acc, score) => {
          acc[score.category] = (acc[score.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      : {},
    
    // Storage status
    isStorageAvailable: isClient()
  };
}