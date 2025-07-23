# Memory Game Logic Implementation Guide

## Overview
This guide provides comprehensive patterns for implementing memory game logic in React with TypeScript, focusing on card matching algorithms, state management, and game flow control.

## Core Game Logic Patterns

### 1. Card State Management

**TypeScript Interface Definition:**
```typescript
interface Card {
  id: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  pairId: string; // Links matching cards
}

interface GameState {
  cards: Card[];
  flippedCards: Card[];
  matchedPairs: number;
  moves: number;
  gameStatus: 'idle' | 'playing' | 'won' | 'paused';
  startTime: Date | null;
  endTime: Date | null;
}
```

### 2. Game State Hook Implementation

```typescript
const useMemoryGame = (gridSize: number, emojiSet: string[]) => {
  const [gameState, setGameState] = useState<GameState>({
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    gameStatus: 'idle',
    startTime: null,
    endTime: null
  });

  // Initialize game board
  const initializeGame = useCallback(() => {
    const pairs = Math.floor(gridSize / 2);
    const selectedEmojis = emojiSet.slice(0, pairs);
    
    // Create pairs and shuffle using Fisher-Yates algorithm
    const cards: Card[] = selectedEmojis
      .flatMap((emoji, index) => [
        { id: `${index}-a`, emoji, isFlipped: false, isMatched: false, pairId: `pair-${index}` },
        { id: `${index}-b`, emoji, isFlipped: false, isMatched: false, pairId: `pair-${index}` }
      ])
      .sort(() => Math.random() - 0.5); // Basic shuffle (Fisher-Yates recommended for production)

    setGameState(prev => ({
      ...prev,
      cards,
      flippedCards: [],
      matchedPairs: 0,
      moves: 0,
      gameStatus: 'playing',
      startTime: new Date(),
      endTime: null
    }));
  }, [gridSize, emojiSet]);

  return { gameState, initializeGame };
};
```

### 3. Card Click Handler

```typescript
const handleCardClick = useCallback((cardId: string) => {
  setGameState(prev => {
    // Prevent clicks during evaluation or on already flipped/matched cards
    if (prev.flippedCards.length === 2 || 
        prev.cards.find(c => c.id === cardId)?.isFlipped ||
        prev.cards.find(c => c.id === cardId)?.isMatched) {
      return prev;
    }

    const clickedCard = prev.cards.find(c => c.id === cardId);
    if (!clickedCard) return prev;

    const updatedCards = prev.cards.map(card =>
      card.id === cardId ? { ...card, isFlipped: true } : card
    );

    const newFlippedCards = [...prev.flippedCards, clickedCard];

    return {
      ...prev,
      cards: updatedCards,
      flippedCards: newFlippedCards,
      moves: prev.moves + 1
    };
  });
}, []);
```

### 4. Match Checking Logic

```typescript
useEffect(() => {
  if (gameState.flippedCards.length === 2) {
    const [card1, card2] = gameState.flippedCards;
    const isMatch = card1.pairId === card2.pairId;

    // Delay for animation and user feedback
    const timer = setTimeout(() => {
      setGameState(prev => {
        if (isMatch) {
          // Mark cards as matched
          const updatedCards = prev.cards.map(card =>
            card.pairId === card1.pairId 
              ? { ...card, isMatched: true }
              : card
          );

          const newMatchedPairs = prev.matchedPairs + 1;
          const totalPairs = Math.floor(prev.cards.length / 2);
          const gameWon = newMatchedPairs === totalPairs;

          return {
            ...prev,
            cards: updatedCards,
            flippedCards: [],
            matchedPairs: newMatchedPairs,
            gameStatus: gameWon ? 'won' : 'playing',
            endTime: gameWon ? new Date() : null
          };
        } else {
          // Flip cards back
          const updatedCards = prev.cards.map(card =>
            prev.flippedCards.some(fc => fc.id === card.id)
              ? { ...card, isFlipped: false }
              : card
          );

          return {
            ...prev,
            cards: updatedCards,
            flippedCards: []
          };
        }
      });
    }, 1000); // 1-second delay for user feedback

    return () => clearTimeout(timer);
  }
}, [gameState.flippedCards]);
```

## Advanced Patterns

### 1. Game Difficulty Management

```typescript
interface DifficultySettings {
  gridSize: number;
  flipDelay: number;
  maxMistakes?: number;
}

const DIFFICULTY_LEVELS: Record<string, DifficultySettings> = {
  easy: { gridSize: 12, flipDelay: 1500 },
  medium: { gridSize: 16, flipDelay: 1000 },
  hard: { gridSize: 20, flipDelay: 750 },
  expert: { gridSize: 24, flipDelay: 500, maxMistakes: 10 }
};
```

### 2. Performance Optimizations

```typescript
// Memoized card component to prevent unnecessary re-renders
const MemoryCard = React.memo<{
  card: Card;
  onClick: (id: string) => void;
}>(({ card, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(card.id);
  }, [card.id, onClick]);

  return (
    <button
      className={`memory-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
      onClick={handleClick}
      disabled={card.isFlipped || card.isMatched}
    >
      {card.isFlipped || card.isMatched ? card.emoji : '?'}
    </button>
  );
});
```

### 3. Game Statistics Tracking

```typescript
interface GameStats {
  bestTime: number | null;
  bestMoves: number | null;
  gamesPlayed: number;
  averageTime: number;
  winRate: number;
}

const calculateGameStats = (gameState: GameState): Partial<GameStats> => {
  if (!gameState.startTime || !gameState.endTime) return {};
  
  const gameTime = gameState.endTime.getTime() - gameState.startTime.getTime();
  
  return {
    gameTime: Math.floor(gameTime / 1000),
    moves: gameState.moves,
    accuracy: gameState.matchedPairs / gameState.moves
  };
};
```

## Best Practices

### 1. Error Handling
- Always validate card existence before state updates
- Implement timeout cleanup for async operations
- Handle edge cases (rapid clicking, browser back/forward)

### 2. Performance Considerations
- Use `React.memo` for card components
- Implement `useCallback` for event handlers
- Consider `useMemo` for expensive calculations

### 3. State Management
- Keep game state normalized and flat
- Separate UI state from game logic state
- Use reducers for complex state transitions

### 4. Testing Considerations
- Unit test game logic functions independently
- Mock timers for animation delays in tests
- Test win/lose conditions thoroughly

## Common Pitfalls

1. **Race Conditions**: Multiple rapid clicks can cause state inconsistencies
2. **Memory Leaks**: Forgetting to clear timeouts on component unmount
3. **Animation Conflicts**: Not coordinating flip animations with state updates
4. **Accessibility**: Forgetting keyboard navigation and screen reader support

## Next Steps

- Implement card flip animations (see Animation Guide)
- Add responsive grid layouts (see Layout Guide)
- Integrate high score persistence (see Storage Guide)
- Ensure accessibility compliance (see Accessibility Guide)