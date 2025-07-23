# Game State Management Guide

## Overview
This guide covers best practices for managing complex game state in React memory games using modern patterns including useReducer, Context API, and custom hooks with TypeScript.

## State Architecture Patterns

### 1. State Structure Design

```typescript
// Core game entities
interface Card {
  id: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  pairId: string;
  position: number;
}

interface Player {
  id: string;
  name: string;
  score: number;
  moves: number;
  timeElapsed: number;
}

interface GameSettings {
  difficulty: 'easy' | 'medium' | 'hard' | 'custom';
  gridSize: number;
  emojiSet: string;
  timeLimit?: number;
  maxMistakes?: number;
  soundEnabled: boolean;
  theme: string;
}

// Main game state
interface GameState {
  // Game entities
  cards: Card[];
  player: Player;
  settings: GameSettings;
  
  // Game flow state
  gameStatus: 'idle' | 'playing' | 'paused' | 'won' | 'lost';
  gamePhase: 'setup' | 'memo' | 'playing' | 'result';
  
  // Interaction state
  selectedCards: Card[];
  processingMatch: boolean;
  
  // Timing and scoring
  startTime: Date | null;
  endTime: Date | null;
  streak: number;
  bestStreak: number;
  
  // UI state
  showingHint: boolean;
  animatingCards: string[];
  
  // Statistics
  totalMatches: number;
  totalMisses: number;
  averageMatchTime: number;
}
```

### 2. Action-Based State Management

```typescript
// Action types
type GameAction =
  | { type: 'INITIALIZE_GAME'; payload: { settings: GameSettings; cards: Card[] } }
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'FLIP_CARD'; payload: { cardId: string } }
  | { type: 'PROCESS_MATCH'; payload: { isMatch: boolean; matchTime: number } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'SHOW_HINT'; payload: { cardIds: string[] } }
  | { type: 'HIDE_HINT' }
  | { type: 'ANIMATION_START'; payload: { cardIds: string[] } }
  | { type: 'ANIMATION_END'; payload: { cardIds: string[] } };

// State reducer
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'INITIALIZE_GAME':
      return {
        ...initialGameState,
        cards: action.payload.cards,
        settings: action.payload.settings,
        gameStatus: 'idle'
      };

    case 'START_GAME':
      return {
        ...state,
        gameStatus: 'playing',
        gamePhase: 'playing',
        startTime: new Date(),
        player: {
          ...state.player,
          moves: 0,
          score: 0,
          timeElapsed: 0
        }
      };

    case 'FLIP_CARD': {
      const cardId = action.payload.cardId;
      const card = state.cards.find(c => c.id === cardId);
      
      // Validation
      if (!card || card.isFlipped || card.isMatched || 
          state.selectedCards.length >= 2 || 
          state.processingMatch) {
        return state;
      }

      const updatedCards = state.cards.map(c =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      );

      const newSelectedCards = [...state.selectedCards, card];

      return {
        ...state,
        cards: updatedCards,
        selectedCards: newSelectedCards,
        player: {
          ...state.player,
          moves: state.player.moves + 1
        }
      };
    }

    case 'PROCESS_MATCH': {
      const { isMatch, matchTime } = action.payload;
      const [card1, card2] = state.selectedCards;

      if (isMatch) {
        const updatedCards = state.cards.map(card =>
          card.pairId === card1.pairId 
            ? { ...card, isMatched: true }
            : card
        );

        const newScore = state.player.score + calculateMatchScore(matchTime, state.streak);
        const newStreak = state.streak + 1;
        const totalMatches = state.totalMatches + 1;
        const allMatched = updatedCards.every(card => card.isMatched);

        return {
          ...state,
          cards: updatedCards,
          selectedCards: [],
          processingMatch: false,
          player: { ...state.player, score: newScore },
          streak: newStreak,
          bestStreak: Math.max(state.bestStreak, newStreak),
          totalMatches,
          averageMatchTime: (state.averageMatchTime * (totalMatches - 1) + matchTime) / totalMatches,
          gameStatus: allMatched ? 'won' : 'playing',
          endTime: allMatched ? new Date() : null
        };
      } else {
        // No match - flip cards back
        const updatedCards = state.cards.map(card =>
          state.selectedCards.some(sc => sc.id === card.id)
            ? { ...card, isFlipped: false }
            : card
        );

        return {
          ...state,
          cards: updatedCards,
          selectedCards: [],
          processingMatch: false,
          streak: 0, // Reset streak on miss
          totalMisses: state.totalMisses + 1
        };
      }
    }

    default:
      return state;
  }
};
```

### 3. Context Provider Setup

```typescript
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  
  // Computed values
  gameProgress: number;
  elapsedTime: number;
  remainingTime?: number;
  
  // Action creators
  initializeGame: (settings: GameSettings) => void;
  startGame: () => void;
  flipCard: (cardId: string) => void;
  pauseGame: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer effect for elapsed time
  useEffect(() => {
    if (state.gameStatus === 'playing' && state.startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - state.startTime!.getTime());
      }, 100);

      return () => clearInterval(interval);
    }
  }, [state.gameStatus, state.startTime]);

  // Auto-process matches when 2 cards are selected
  useEffect(() => {
    if (state.selectedCards.length === 2 && !state.processingMatch) {
      dispatch({ type: 'PROCESS_MATCH', payload: { processingMatch: true } });

      const [card1, card2] = state.selectedCards;
      const isMatch = card1.pairId === card2.pairId;
      
      setTimeout(() => {
        dispatch({
          type: 'PROCESS_MATCH',
          payload: { isMatch, matchTime: elapsedTime }
        });
      }, 1000); // Delay for user feedback
    }
  }, [state.selectedCards, state.processingMatch, elapsedTime]);

  // Computed values
  const gameProgress = useMemo(() => {
    const totalPairs = Math.floor(state.cards.length / 2);
    return totalPairs > 0 ? (state.totalMatches / totalPairs) * 100 : 0;
  }, [state.cards.length, state.totalMatches]);

  const remainingTime = useMemo(() => {
    if (!state.settings.timeLimit || !state.startTime) return undefined;
    const elapsed = Math.floor(elapsedTime / 1000);
    return Math.max(0, state.settings.timeLimit - elapsed);
  }, [state.settings.timeLimit, state.startTime, elapsedTime]);

  // Action creators
  const initializeGame = useCallback((settings: GameSettings) => {
    const cards = generateCards(settings.gridSize, settings.emojiSet);
    dispatch({ type: 'INITIALIZE_GAME', payload: { settings, cards } });
  }, []);

  const flipCard = useCallback((cardId: string) => {
    dispatch({ type: 'FLIP_CARD', payload: { cardId } });
  }, []);

  const value: GameContextType = {
    state,
    dispatch,
    gameProgress,
    elapsedTime: Math.floor(elapsedTime / 1000),
    remainingTime,
    initializeGame,
    startGame: () => dispatch({ type: 'START_GAME' }),
    flipCard,
    pauseGame: () => dispatch({ type: 'PAUSE_GAME' }),
    resetGame: () => dispatch({ type: 'RESET_GAME' })
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook for consuming context
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
```

## Custom Hooks for Specific Features

### 1. Game Statistics Hook

```typescript
interface GameStatistics {
  accuracy: number;
  efficiency: number;
  averageTimePerMatch: number;
  perfectMatches: number;
  rating: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export const useGameStatistics = (): GameStatistics => {
  const { state } = useGame();

  return useMemo(() => {
    const totalAttempts = state.totalMatches + state.totalMisses;
    const accuracy = totalAttempts > 0 ? (state.totalMatches / totalAttempts) * 100 : 0;
    
    const totalPairs = Math.floor(state.cards.length / 2);
    const efficiency = totalPairs > 0 ? (totalPairs / state.player.moves) * 100 : 0;
    
    const perfectMatches = state.bestStreak;
    
    let rating: GameStatistics['rating'] = 'beginner';
    if (accuracy > 90 && efficiency > 80) rating = 'expert';
    else if (accuracy > 80 && efficiency > 70) rating = 'advanced';
    else if (accuracy > 70 && efficiency > 60) rating = 'intermediate';

    return {
      accuracy,
      efficiency,
      averageTimePerMatch: state.averageMatchTime,
      perfectMatches,
      rating
    };
  }, [state]);
};
```

### 2. Game Persistence Hook

```typescript
export const useGamePersistence = () => {
  const { state, dispatch } = useGame();

  // Save game state to localStorage
  const saveGame = useCallback(() => {
    try {
      const saveData = {
        cards: state.cards,
        player: state.player,
        settings: state.settings,
        gameStatus: state.gameStatus,
        startTime: state.startTime?.toISOString(),
        totalMatches: state.totalMatches,
        totalMisses: state.totalMisses,
        streak: state.streak,
        bestStreak: state.bestStreak
      };
      
      localStorage.setItem('memoryGame_saveState', JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }, [state]);

  // Load game state from localStorage
  const loadGame = useCallback(() => {
    try {
      const saveData = localStorage.getItem('memoryGame_saveState');
      if (!saveData) return false;

      const parsed = JSON.parse(saveData);
      dispatch({
        type: 'LOAD_GAME',
        payload: {
          ...parsed,
          startTime: parsed.startTime ? new Date(parsed.startTime) : null
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  }, [dispatch]);

  // Auto-save on significant state changes
  useEffect(() => {
    if (state.gameStatus === 'playing' && state.player.moves > 0) {
      const timeoutId = setTimeout(saveGame, 1000); // Debounce saves
      return () => clearTimeout(timeoutId);
    }
  }, [state.player.moves, state.totalMatches, saveGame]);

  return { saveGame, loadGame };
};
```

### 3. Game Timer Hook

```typescript
export const useGameTimer = () => {
  const { state } = useGame();
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (state.gameStatus === 'playing') {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 100);

      return () => clearInterval(interval);
    }
  }, [state.gameStatus]);

  const elapsedSeconds = useMemo(() => {
    if (!state.startTime) return 0;
    return Math.floor((currentTime - state.startTime.getTime()) / 1000);
  }, [state.startTime, currentTime]);

  const remainingSeconds = useMemo(() => {
    if (!state.settings.timeLimit) return null;
    return Math.max(0, state.settings.timeLimit - elapsedSeconds);
  }, [state.settings.timeLimit, elapsedSeconds]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [elapsedSeconds]);

  return {
    elapsedSeconds,
    remainingSeconds,
    formattedTime,
    isTimeUp: remainingSeconds === 0
  };
};
```

## Advanced State Patterns

### 1. State Machines with XState (Optional)

```typescript
import { createMachine, interpret } from 'xstate';

const gameStateMachine = createMachine({
  id: 'memoryGame',
  initial: 'idle',
  context: {
    moves: 0,
    matches: 0,
    selectedCards: []
  },
  states: {
    idle: {
      on: {
        START: 'playing'
      }
    },
    playing: {
      on: {
        FLIP_CARD: {
          target: 'evaluating',
          cond: 'canFlipCard'
        },
        PAUSE: 'paused'
      }
    },
    evaluating: {
      after: {
        1000: [
          { target: 'playing', cond: 'isNotGameComplete' },
          { target: 'won', cond: 'isGameComplete' }
        ]
      }
    },
    paused: {
      on: {
        RESUME: 'playing',
        RESET: 'idle'
      }
    },
    won: {
      on: {
        RESET: 'idle'
      }
    }
  }
}, {
  guards: {
    canFlipCard: (context) => context.selectedCards.length < 2,
    isGameComplete: (context) => context.matches === context.totalPairs,
    isNotGameComplete: (context) => context.matches < context.totalPairs
  }
});
```

### 2. Optimistic Updates

```typescript
export const useOptimisticGameState = () => {
  const { state, dispatch } = useGame();
  const [optimisticState, setOptimisticState] = useState(state);

  const optimisticFlipCard = useCallback((cardId: string) => {
    // Immediately update UI
    setOptimisticState(prev => ({
      ...prev,
      cards: prev.cards.map(card =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    }));

    // Dispatch actual action
    dispatch({ type: 'FLIP_CARD', payload: { cardId } });
  }, [dispatch]);

  // Sync optimistic state with actual state
  useEffect(() => {
    setOptimisticState(state);
  }, [state]);

  return {
    state: optimisticState,
    optimisticFlipCard
  };
};
```

## Performance Optimization

### 1. Selective Re-rendering

```typescript
// Memoized selectors to prevent unnecessary re-renders
export const useGameSelectors = () => {
  const { state } = useGame();

  return useMemo(() => ({
    // Only re-render when cards change
    cards: state.cards,
    
    // Only re-render when score changes
    score: state.player.score,
    
    // Only re-render when game status changes
    gameStatus: state.gameStatus,
    
    // Computed values
    canFlipCard: state.selectedCards.length < 2 && !state.processingMatch,
    isGameActive: state.gameStatus === 'playing'
  }), [
    state.cards,
    state.player.score,
    state.gameStatus,
    state.selectedCards.length,
    state.processingMatch
  ]);
};
```

### 2. State Normalization

```typescript
// Normalized state structure for better performance
interface NormalizedGameState {
  cards: {
    byId: Record<string, Card>;
    allIds: string[];
  };
  matches: {
    byId: Record<string, Match>;
    allIds: string[];
  };
  // ... other normalized entities
}

// Selectors for normalized state
export const selectCard = (state: NormalizedGameState, cardId: string) =>
  state.cards.byId[cardId];

export const selectAllCards = (state: NormalizedGameState) =>
  state.cards.allIds.map(id => state.cards.byId[id]);
```

## Testing Strategies

### 1. State Reducer Testing

```typescript
describe('gameReducer', () => {
  test('should flip card when FLIP_CARD is dispatched', () => {
    const initialState = createTestGameState();
    const action: GameAction = { type: 'FLIP_CARD', payload: { cardId: 'card1' } };
    
    const newState = gameReducer(initialState, action);
    
    expect(newState.cards.find(c => c.id === 'card1')?.isFlipped).toBe(true);
    expect(newState.selectedCards).toHaveLength(1);
    expect(newState.player.moves).toBe(1);
  });

  test('should not flip already flipped card', () => {
    const initialState = createTestGameState({
      cards: [{ id: 'card1', isFlipped: true }]
    });
    
    const action: GameAction = { type: 'FLIP_CARD', payload: { cardId: 'card1' } };
    const newState = gameReducer(initialState, action);
    
    expect(newState).toEqual(initialState);
  });
});
```

### 2. Context Testing

```typescript
const renderWithGameProvider = (ui: React.ReactElement) => {
  return render(
    <GameProvider>
      {ui}
    </GameProvider>
  );
};

test('game context provides correct initial state', () => {
  const TestComponent = () => {
    const { state } = useGame();
    return <div data-testid="game-status">{state.gameStatus}</div>;
  };

  renderWithGameProvider(<TestComponent />);
  
  expect(screen.getByTestId('game-status')).toHaveTextContent('idle');
});
```

## Best Practices

1. **Single Source of Truth**: Centralize all game state in one reducer
2. **Immutable Updates**: Always return new state objects
3. **Action Separation**: Keep actions focused and atomic
4. **Computed Values**: Use memoization for derived state
5. **Type Safety**: Leverage TypeScript for action and state typing
6. **Error Boundaries**: Wrap context providers with error boundaries
7. **Testing**: Write comprehensive tests for state transitions
8. **Performance**: Use selectors to prevent unnecessary re-renders

## Integration Points

- **Local Storage**: Persist game state across sessions
- **Animation System**: Coordinate state changes with animations
- **Sound System**: Trigger audio based on state changes
- **Analytics**: Track game events and state transitions
- **Accessibility**: Announce state changes to screen readers

This state management architecture provides a robust foundation for complex memory game interactions while maintaining performance and testability.