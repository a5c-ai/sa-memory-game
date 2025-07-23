# Local Storage High Score System Guide

## Overview
This guide demonstrates how to implement persistent high score systems using localStorage in React memory games with TypeScript, including data serialization, error handling, and performance considerations.

## Core Storage Architecture

### 1. Data Models and Types

```typescript
interface GameScore {
  id: string;
  playerName: string;
  score: number;
  moves: number;
  timeElapsed: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard' | 'custom';
  gridSize: number;
  date: string; // ISO string
  accuracy: number; // percentage
  streakRecord: number;
}

interface HighScoreData {
  scores: GameScore[];
  personalBest: {
    bestScore: number;
    fastestTime: number;
    fewestMoves: number;
    bestAccuracy: number;
  };
  statistics: {
    gamesPlayed: number;
    totalScore: number;
    averageScore: number;
    averageTime: number;
    favoritedifficulty: string;
  };
  lastUpdated: string;
}

interface StorageConfig {
  maxScores: number;
  storageKey: string;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

// Default configuration
const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  maxScores: 100,
  storageKey: 'memoryGame_highScores',
  compressionEnabled: false,
  encryptionEnabled: false
};
```

### 2. Custom Hook Implementation

```typescript
export const useHighScores = (config: Partial<StorageConfig> = {}) => {
  const finalConfig = { ...DEFAULT_STORAGE_CONFIG, ...config };
  const [highScoreData, setHighScoreData] = useState<HighScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize high score data
  useEffect(() => {
    loadHighScores();
  }, []);

  const loadHighScores = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getStoredData(finalConfig.storageKey);
      
      if (data) {
        // Validate and migrate data if necessary
        const validatedData = validateHighScoreData(data);
        setHighScoreData(validatedData);
      } else {
        // Initialize with empty data
        const emptyData = createEmptyHighScoreData();
        setHighScoreData(emptyData);
        await saveStoredData(finalConfig.storageKey, emptyData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load high scores');
      setHighScoreData(createEmptyHighScoreData());
    } finally {
      setIsLoading(false);
    }
  }, [finalConfig.storageKey]);

  const addScore = useCallback(async (newScore: Omit<GameScore, 'id' | 'date'>) => {
    try {
      if (!highScoreData) return false;

      const scoreWithMetadata: GameScore = {
        ...newScore,
        id: generateScoreId(),
        date: new Date().toISOString()
      };

      const updatedData = {
        ...highScoreData,
        scores: [...highScoreData.scores, scoreWithMetadata]
          .sort((a, b) => b.score - a.score) // Sort by score descending
          .slice(0, finalConfig.maxScores), // Keep only top scores
        personalBest: updatePersonalBest(highScoreData.personalBest, scoreWithMetadata),
        statistics: updateStatistics(highScoreData.statistics, scoreWithMetadata),
        lastUpdated: new Date().toISOString()
      };

      setHighScoreData(updatedData);
      await saveStoredData(finalConfig.storageKey, updatedData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save score');
      return false;
    }
  }, [highScoreData, finalConfig]);

  const clearScores = useCallback(async () => {
    try {
      const emptyData = createEmptyHighScoreData();
      setHighScoreData(emptyData);
      await saveStoredData(finalConfig.storageKey, emptyData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear scores');
      return false;
    }
  }, [finalConfig.storageKey]);

  const getTopScores = useCallback((limit: number = 10, difficulty?: string) => {
    if (!highScoreData) return [];

    let filteredScores = highScoreData.scores;
    
    if (difficulty) {
      filteredScores = filteredScores.filter(score => score.difficulty === difficulty);
    }

    return filteredScores.slice(0, limit);
  }, [highScoreData]);

  const getPlayerRank = useCallback((score: number, difficulty?: string) => {
    if (!highScoreData) return null;

    let scores = highScoreData.scores;
    if (difficulty) {
      scores = scores.filter(s => s.difficulty === difficulty);
    }

    const rank = scores.filter(s => s.score > score).length + 1;
    return { rank, total: scores.length };
  }, [highScoreData]);

  return {
    highScoreData,
    isLoading,
    error,
    addScore,
    clearScores,
    getTopScores,
    getPlayerRank,
    reload: loadHighScores
  };
};
```

### 3. Storage Utilities

```typescript
// Enhanced localStorage utilities with error handling
const getStoredData = async (key: string): Promise<HighScoreData | null> => {
  try {
    // Check if localStorage is available (SSR compatibility)
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const stored = localStorage.getItem(key);
    if (!stored) return null;

    // Parse and validate JSON
    const parsed = JSON.parse(stored);
    return parsed;
  } catch (error) {
    console.warn('Failed to load stored data:', error);
    
    // Attempt to recover corrupted data
    try {
      localStorage.removeItem(key);
    } catch (removeError) {
      console.warn('Failed to remove corrupted data:', removeError);
    }
    
    return null;
  }
};

const saveStoredData = async (key: string, data: HighScoreData): Promise<void> => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage not available');
    }

    const serialized = JSON.stringify(data);
    
    // Check storage quota
    const estimatedSize = new Blob([serialized]).size;
    if (estimatedSize > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('Data too large for localStorage');
    }

    localStorage.setItem(key, serialized);
  } catch (error) {
    if (error instanceof DOMException && error.code === DOMException.QUOTA_EXCEEDED_ERR) {
      // Handle storage quota exceeded
      throw new Error('Storage quota exceeded. Please clear some data.');
    }
    throw error;
  }
};

// Data validation and migration
const validateHighScoreData = (data: any): HighScoreData => {
  // Validate structure and migrate if necessary
  if (!data || typeof data !== 'object') {
    return createEmptyHighScoreData();
  }

  // Ensure required properties exist
  const validated: HighScoreData = {
    scores: Array.isArray(data.scores) ? data.scores.filter(validateScore) : [],
    personalBest: data.personalBest || {
      bestScore: 0,
      fastestTime: Infinity,
      fewestMoves: Infinity,
      bestAccuracy: 0
    },
    statistics: data.statistics || {
      gamesPlayed: 0,
      totalScore: 0,
      averageScore: 0,
      averageTime: 0,
      favoritedifficulty: 'medium'
    },
    lastUpdated: data.lastUpdated || new Date().toISOString()
  };

  return validated;
};

const validateScore = (score: any): score is GameScore => {
  return (
    score &&
    typeof score.id === 'string' &&
    typeof score.playerName === 'string' &&
    typeof score.score === 'number' &&
    typeof score.moves === 'number' &&
    typeof score.timeElapsed === 'number' &&
    typeof score.date === 'string' &&
    ['easy', 'medium', 'hard', 'custom'].includes(score.difficulty)
  );
};
```

## Advanced Features

### 1. Compression and Optimization

```typescript
// Optional compression for large datasets
const compressData = (data: HighScoreData): string => {
  try {
    // Simple compression by removing unnecessary whitespace
    const compressed = JSON.stringify(data);
    
    // For more advanced compression, you could use libraries like pako
    // const compressed = pako.deflate(JSON.stringify(data), { to: 'string' });
    
    return compressed;
  } catch (error) {
    throw new Error('Failed to compress data');
  }
};

const decompressData = (compressed: string): HighScoreData => {
  try {
    return JSON.parse(compressed);
    
    // For advanced compression:
    // const decompressed = pako.inflate(compressed, { to: 'string' });
    // return JSON.parse(decompressed);
  } catch (error) {
    throw new Error('Failed to decompress data');
  }
};
```

### 2. Export/Import Functionality

```typescript
const useScoreExport = () => {
  const { highScoreData } = useHighScores();

  const exportScores = useCallback((format: 'json' | 'csv' = 'json') => {
    if (!highScoreData) return null;

    try {
      if (format === 'json') {
        const dataStr = JSON.stringify(highScoreData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        return URL.createObjectURL(dataBlob);
      } else if (format === 'csv') {
        const csvContent = convertToCSV(highScoreData.scores);
        const dataBlob = new Blob([csvContent], { type: 'text/csv' });
        return URL.createObjectURL(dataBlob);
      }
    } catch (error) {
      console.error('Failed to export scores:', error);
      return null;
    }
  }, [highScoreData]);

  const importScores = useCallback(async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      
      if (file.type === 'application/json') {
        const imported = JSON.parse(text);
        const validated = validateHighScoreData(imported);
        
        // Merge with existing data
        await mergeHighScoreData(validated);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to import scores:', error);
      return false;
    }
  }, []);

  return { exportScores, importScores };
};

const convertToCSV = (scores: GameScore[]): string => {
  const headers = ['Player Name', 'Score', 'Moves', 'Time', 'Difficulty', 'Date', 'Accuracy'];
  const rows = scores.map(score => [
    score.playerName,
    score.score.toString(),
    score.moves.toString(),
    score.timeElapsed.toString(),
    score.difficulty,
    new Date(score.date).toLocaleDateString(),
    `${score.accuracy.toFixed(1)}%`
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};
```

### 3. Statistics and Analytics

```typescript
const useScoreAnalytics = () => {
  const { highScoreData } = useHighScores();

  const getAnalytics = useMemo(() => {
    if (!highScoreData || highScoreData.scores.length === 0) {
      return null;
    }

    const scores = highScoreData.scores;
    
    return {
      // Performance trends
      scoreDistribution: calculateScoreDistribution(scores),
      timeDistribution: calculateTimeDistribution(scores),
      improvementTrend: calculateImprovementTrend(scores),
      
      // Difficulty analysis
      difficultyStats: calculateDifficultyStats(scores),
      
      // Playing patterns
      playingFrequency: calculatePlayingFrequency(scores),
      averageSessionLength: calculateAverageSessionLength(scores),
      
      // Personal records
      personalBests: {
        allTime: findAllTimeBests(scores),
        monthly: findMonthlyBests(scores),
        weekly: findWeeklyBests(scores)
      }
    };
  }, [highScoreData]);

  return getAnalytics;
};

// Analytics calculation functions
const calculateScoreDistribution = (scores: GameScore[]) => {
  const ranges = [
    { min: 0, max: 1000, label: '0-1000' },
    { min: 1001, max: 2000, label: '1001-2000' },
    { min: 2001, max: 3000, label: '2001-3000' },
    { min: 3001, max: Infinity, label: '3001+' }
  ];

  return ranges.map(range => ({
    ...range,
    count: scores.filter(s => s.score >= range.min && s.score <= range.max).length
  }));
};

const calculateImprovementTrend = (scores: GameScore[]) => {
  if (scores.length < 2) return null;

  // Sort by date
  const sortedScores = [...scores].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate moving average
  const windowSize = Math.min(10, Math.floor(sortedScores.length / 3));
  const movingAverages = [];

  for (let i = windowSize - 1; i < sortedScores.length; i++) {
    const window = sortedScores.slice(i - windowSize + 1, i + 1);
    const average = window.reduce((sum, score) => sum + score.score, 0) / windowSize;
    movingAverages.push({
      date: sortedScores[i].date,
      average,
      bestInWindow: Math.max(...window.map(s => s.score))
    });
  }

  return movingAverages;
};
```

## Performance Optimizations

### 1. Debounced Saves

```typescript
const useDebouncedSave = (delay: number = 1000) => {
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const debouncedSave = useCallback((key: string, data: HighScoreData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveStoredData(key, data);
      } catch (error) {
        console.error('Debounced save failed:', error);
      }
    }, delay);
  }, [delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return debouncedSave;
};
```

### 2. Background Processing

```typescript
const useBackgroundScoreProcessing = () => {
  const workerRef = useRef<Worker>();

  useEffect(() => {
    // Create web worker for heavy computations
    if (typeof window !== 'undefined' && window.Worker) {
      const workerCode = `
        self.onmessage = function(e) {
          const { type, data } = e.data;
          
          switch (type) {
            case 'CALCULATE_STATISTICS':
              const stats = calculateStatistics(data);
              self.postMessage({ type: 'STATISTICS_RESULT', result: stats });
              break;
            case 'SORT_SCORES':
              const sorted = data.sort((a, b) => b.score - a.score);
              self.postMessage({ type: 'SORT_RESULT', result: sorted });
              break;
          }
        };
        
        function calculateStatistics(scores) {
          // Heavy statistical calculations
          return {
            mean: scores.reduce((sum, s) => sum + s.score, 0) / scores.length,
            median: findMedian(scores.map(s => s.score)),
            mode: findMode(scores.map(s => s.score))
          };
        }
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      workerRef.current = new Worker(URL.createObjectURL(blob));
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const processInBackground = useCallback((type: string, data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Web Worker not available'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Background processing timeout'));
      }, 5000);

      workerRef.current.onmessage = (e) => {
        clearTimeout(timeout);
        resolve(e.data.result);
      };

      workerRef.current.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };

      workerRef.current.postMessage({ type, data });
    });
  }, []);

  return { processInBackground };
};
```

## Component Integration

### 1. High Score Display Component

```tsx
const HighScoreBoard: React.FC<{
  difficulty?: string;
  limit?: number;
}> = ({ difficulty, limit = 10 }) => {
  const { getTopScores, isLoading, error } = useHighScores();
  const topScores = getTopScores(limit, difficulty);

  if (isLoading) {
    return <div className="animate-pulse">Loading scores...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded">
        Error loading scores: {error}
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">
        High Scores {difficulty && `(${difficulty})`}
      </h3>
      
      {topScores.length === 0 ? (
        <p className="text-gray-500">No scores yet. Play a game to get started!</p>
      ) : (
        <div className="space-y-2">
          {topScores.map((score, index) => (
            <div
              key={score.id}
              className={`flex justify-between items-center p-2 rounded ${
                index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="font-bold text-gray-600">#{index + 1}</span>
                <span className="font-medium">{score.playerName}</span>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg">{score.score.toLocaleString()}</div>
                <div className="text-sm text-gray-500">
                  {score.moves} moves • {formatTime(score.timeElapsed)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 2. Score Submission Component

```tsx
const ScoreSubmission: React.FC<{
  gameResult: {
    score: number;
    moves: number;
    timeElapsed: number;
    difficulty: string;
    accuracy: number;
    streakRecord: number;
  };
  onSubmit: () => void;
}> = ({ gameResult, onSubmit }) => {
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addScore, getPlayerRank } = useHighScores();

  const handleSubmit = async () => {
    if (!playerName.trim()) return;

    setIsSubmitting(true);
    
    try {
      const success = await addScore({
        playerName: playerName.trim(),
        score: gameResult.score,
        moves: gameResult.moves,
        timeElapsed: gameResult.timeElapsed,
        difficulty: gameResult.difficulty as any,
        gridSize: calculateGridSize(gameResult.difficulty),
        accuracy: gameResult.accuracy,
        streakRecord: gameResult.streakRecord
      });

      if (success) {
        onSubmit();
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rank = getPlayerRank(gameResult.score, gameResult.difficulty);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4 text-center">🎉 Game Complete!</h3>
      
      <div className="mb-6 text-center">
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {gameResult.score.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">
          {gameResult.moves} moves • {formatTime(gameResult.timeElapsed)} • {gameResult.accuracy.toFixed(1)}% accuracy
        </div>
        {rank && (
          <div className="mt-2 text-sm font-medium text-green-600">
            Rank #{rank.rank} of {rank.total}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="playerName" className="block text-sm font-medium mb-2">
          Your Name
        </label>
        <input
          id="playerName"
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          maxLength={20}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!playerName.trim() || isSubmitting}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Saving...' : 'Save Score'}
      </button>
    </div>
  );
};
```

## Testing Strategies

### 1. localStorage Testing

```typescript
// Mock localStorage for testing
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Test example
describe('useHighScores', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  test('should save and load high scores', async () => {
    const { result } = renderHook(() => useHighScores());

    await act(async () => {
      await result.current.addScore({
        playerName: 'Test Player',
        score: 1000,
        moves: 20,
        timeElapsed: 60,
        difficulty: 'medium',
        gridSize: 16,
        accuracy: 85,
        streakRecord: 5
      });
    });

    expect(result.current.highScoreData?.scores).toHaveLength(1);
    expect(result.current.highScoreData?.scores[0].playerName).toBe('Test Player');
  });

  test('should handle storage errors gracefully', async () => {
    // Simulate storage quota exceeded
    mockLocalStorage.setItem = jest.fn(() => {
      throw new DOMException('QuotaExceededError');
    });

    const { result } = renderHook(() => useHighScores());

    await act(async () => {
      const success = await result.current.addScore({
        playerName: 'Test',
        score: 100,
        // ... other required fields
      });
      expect(success).toBe(false);
    });
  });
});
```

## Best Practices

### 1. Data Management
- **Validate all data** before storing to prevent corruption
- **Implement versioning** for data migration strategies
- **Set reasonable limits** on stored data size
- **Handle storage quota** exceeded errors gracefully
- **Provide export/import** functionality for data portability

### 2. Performance
- **Debounce saves** to avoid excessive localStorage writes
- **Use background processing** for heavy calculations
- **Implement lazy loading** for large datasets
- **Cache frequently accessed data** in memory
- **Monitor storage usage** and provide cleanup options

### 3. Security and Privacy
- **Never store sensitive information** in localStorage
- **Validate imported data** to prevent XSS attacks
- **Consider data anonymization** for analytics
- **Respect user privacy preferences**
- **Provide clear data deletion** options

### 4. User Experience
- **Show loading states** during data operations
- **Handle errors gracefully** with user-friendly messages
- **Provide feedback** for successful operations
- **Allow data export** for user data portability
- **Support offline functionality** where possible

This high score system provides robust, persistent storage for memory game achievements while maintaining performance and user experience standards.