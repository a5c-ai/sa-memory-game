# Accessibility Implementation Guide

## Overview
This guide provides comprehensive patterns for making memory games accessible to users with disabilities, including screen reader support, keyboard navigation, ARIA labels, and WCAG 2.1 compliance.

## Core Accessibility Principles

### 1. Semantic HTML Foundation

```tsx
// Proper semantic structure for game components
const MemoryGame: React.FC = () => {
  return (
    <main role="main" aria-labelledby="game-title">
      <header>
        <h1 id="game-title">Memory Card Game</h1>
        <p>Match pairs of emoji cards to complete the game</p>
      </header>

      <section aria-labelledby="game-controls-title">
        <h2 id="game-controls-title" className="sr-only">Game Controls</h2>
        <GameControls />
      </section>

      <section aria-labelledby="game-board-title">
        <h2 id="game-board-title" className="sr-only">Game Board</h2>
        <GameBoard />
      </section>

      <section aria-labelledby="game-stats-title">
        <h2 id="game-stats-title" className="sr-only">Game Statistics</h2>
        <GameStats />
      </section>
    </main>
  );
};
```

### 2. ARIA Labels and Roles

```tsx
interface AccessibleCardProps {
  card: Card;
  position: number;
  totalCards: number;
  onClick: (cardId: string) => void;
  isDisabled: boolean;
}

const AccessibleMemoryCard: React.FC<AccessibleCardProps> = ({
  card,
  position,
  totalCards,
  onClick,
  isDisabled
}) => {
  const cardState = getCardState(card);
  const positionInfo = `Position ${position + 1} of ${totalCards}`;

  return (
    <button
      type="button"
      className={`memory-card ${getCardClasses(card)}`}
      onClick={() => onClick(card.id)}
      disabled={isDisabled || card.isMatched}
      
      // Core ARIA attributes
      aria-label={getCardAriaLabel(card, position, totalCards)}
      aria-describedby={`card-instructions-${card.id}`}
      aria-pressed={card.isFlipped}
      
      // State information
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      
      // Visual focus indicator
      onFocus={(e) => e.target.setAttribute('data-focused', 'true')}
      onBlur={(e) => e.target.removeAttribute('data-focused')}
    >
      {/* Visual content */}
      <span aria-hidden="true" className="card-visual">
        {card.isFlipped || card.isMatched ? card.emoji : '❓'}
      </span>

      {/* Screen reader instructions */}
      <span
        id={`card-instructions-${card.id}`}
        className="sr-only"
      >
        {getCardInstructions(card)}
      </span>
    </button>
  );
};

// Helper functions for ARIA labels
const getCardAriaLabel = (card: Card, position: number, totalCards: number): string => {
  const positionInfo = `Card ${position + 1} of ${totalCards}`;
  
  if (card.isMatched) {
    return `${positionInfo}. Matched pair ${card.emoji}. No longer interactive.`;
  }
  
  if (card.isFlipped) {
    return `${positionInfo}. Currently showing ${card.emoji}. Waiting for another card selection.`;
  }
  
  return `${positionInfo}. Hidden card. Press Enter or Space to reveal.`;
};

const getCardInstructions = (card: Card): string => {
  if (card.isMatched) {
    return 'This card has been matched and is no longer active.';
  }
  
  if (card.isFlipped) {
    return 'This card is currently revealed. Select another card to make a match.';
  }
  
  return 'Press Enter or Space to flip this card and reveal its content.';
};
```

## Keyboard Navigation

### 1. Focus Management

```tsx
const useKeyboardNavigation = (gridSize: number) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  // Calculate grid dimensions
  const cols = Math.sqrt(gridSize);
  const rows = Math.ceil(gridSize / cols);

  const moveFocus = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setFocusedIndex(prevIndex => {
      const row = Math.floor(prevIndex / cols);
      const col = prevIndex % cols;

      let newRow = row;
      let newCol = col;

      switch (direction) {
        case 'up':
          newRow = row > 0 ? row - 1 : rows - 1;
          break;
        case 'down':
          newRow = row < rows - 1 ? row + 1 : 0;
          break;
        case 'left':
          newCol = col > 0 ? col - 1 : cols - 1;
          if (newCol === cols - 1 && row > 0) {
            newRow = row - 1;
          }
          break;
        case 'right':
          newCol = col < cols - 1 ? col + 1 : 0;
          if (newCol === 0 && row < rows - 1) {
            newRow = row + 1;
          }
          break;
      }

      const newIndex = newRow * cols + newCol;
      return Math.min(newIndex, gridSize - 1);
    });
  }, [cols, rows, gridSize]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        moveFocus('up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveFocus('down');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        moveFocus('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        moveFocus('right');
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(gridSize - 1);
        break;
    }
  }, [moveFocus, gridSize]);

  // Focus the currently focused card
  useEffect(() => {
    if (gridRef.current) {
      const cards = gridRef.current.querySelectorAll('.memory-card');
      const targetCard = cards[focusedIndex] as HTMLElement;
      if (targetCard) {
        targetCard.focus();
      }
    }
  }, [focusedIndex]);

  return {
    gridRef,
    focusedIndex,
    handleKeyDown,
    setFocusedIndex
  };
};

// Implementation in game board
const AccessibleGameBoard: React.FC = () => {
  const { cards } = useGame();
  const { gridRef, focusedIndex, handleKeyDown } = useKeyboardNavigation(cards.length);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      ref={gridRef}
      className="game-board"
      role="grid"
      aria-label="Memory game board"
      aria-rowcount={Math.ceil(cards.length / 4)}
      aria-colcount={4}
    >
      {cards.map((card, index) => (
        <div
          key={card.id}
          role="gridcell"
          aria-rowindex={Math.floor(index / 4) + 1}
          aria-colindex={(index % 4) + 1}
        >
          <AccessibleMemoryCard
            card={card}
            position={index}
            totalCards={cards.length}
            onClick={handleCardClick}
            isDisabled={false}
          />
        </div>
      ))}
    </div>
  );
};
```

### 2. Keyboard Shortcuts

```tsx
const useGameKeyboardShortcuts = () => {
  const { pauseGame, resetGame, gameStatus } = useGame();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Check for modifier key combinations
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'p':
            event.preventDefault();
            if (gameStatus === 'playing') {
              pauseGame();
            }
            break;
          case 'r':
            event.preventDefault();
            resetGame();
            break;
          case 'h':
            event.preventDefault();
            // Show help dialog
            break;
        }
      }

      // Space bar for pause/resume
      if (event.key === ' ' && gameStatus !== 'idle') {
        event.preventDefault();
        if (gameStatus === 'playing') {
          pauseGame();
        } else if (gameStatus === 'paused') {
          // resumeGame();
        }
      }

      // Escape for menu/pause
      if (event.key === 'Escape') {
        event.preventDefault();
        if (gameStatus === 'playing') {
          pauseGame();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, pauseGame, resetGame]);
};
```

## Screen Reader Support

### 1. Live Announcements

```tsx
const useGameAnnouncements = () => {
  const [announcement, setAnnouncement] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((message: string, level: 'polite' | 'assertive' = 'polite') => {
    setPoliteness(level);
    setAnnouncement(message);
    
    // Clear announcement after it's been read
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);

  const announceCardFlip = useCallback((card: Card, position: number) => {
    announce(`Card ${position + 1} flipped. Showing ${card.emoji}.`);
  }, [announce]);

  const announceMatch = useCallback((cards: Card[]) => {
    announce(`Match found! ${cards[0].emoji} pair matched. Great job!`, 'assertive');
  }, [announce]);

  const announceMismatch = useCallback((cards: Card[]) => {
    announce('Cards do not match. They will flip back over.', 'polite');
  }, [announce]);

  const announceGameComplete = useCallback((stats: { moves: number; time: number; score: number }) => {
    announce(
      `Congratulations! Game completed in ${stats.moves} moves and ${Math.floor(stats.time)} seconds. Your score is ${stats.score}.`,
      'assertive'
    );
  }, [announce]);

  const announceGameStart = useCallback((difficulty: string, cardCount: number) => {
    announce(
      `New ${difficulty} game started with ${cardCount} cards. Use arrow keys to navigate and Enter or Space to flip cards.`,
      'polite'
    );
  }, [announce]);

  return {
    announcement,
    politeness,
    announceCardFlip,
    announceMatch,
    announceMismatch,
    announceGameComplete,
    announceGameStart,
    announce
  };
};

// Live region component
const GameAnnouncements: React.FC = () => {
  const { announcement, politeness } = useGameAnnouncements();

  return (
    <>
      <div
        aria-live={politeness}
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcement}
      </div>
      
      {/* Additional region for game state changes */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="sr-only"
        role="log"
        id="game-log"
      >
        {/* Game events will be announced here */}
      </div>
    </>
  );
};
```

### 2. Game State Descriptions

```tsx
const GameStateDescription: React.FC = () => {
  const { gameState, gameProgress, elapsedTime } = useGame();
  const { highScoreData } = useHighScores();

  const getGameStateDescription = () => {
    switch (gameState.gameStatus) {
      case 'idle':
        return 'Game ready to start. Press the start button to begin.';
      case 'playing':
        return `Game in progress. ${gameState.totalMatches} pairs found out of ${Math.floor(gameState.cards.length / 2)} total pairs. ${gameState.player.moves} moves made.`;
      case 'paused':
        return 'Game paused. Press resume to continue playing.';
      case 'won':
        return `Congratulations! You won the game with a score of ${gameState.player.score} in ${gameState.player.moves} moves.`;
      default:
        return 'Game status unknown.';
    }
  };

  return (
    <div className="sr-only" aria-live="polite" role="status">
      <p>{getGameStateDescription()}</p>
      {gameState.gameStatus === 'playing' && (
        <p>
          Progress: {gameProgress.toFixed(0)}% complete. 
          Time elapsed: {Math.floor(elapsedTime)} seconds.
        </p>
      )}
    </div>
  );
};
```

## Visual Accessibility

### 1. High Contrast and Color Considerations

```tsx
// High contrast theme support
const useAccessibilityTheme = () => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for system preferences
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    setHighContrast(highContrastQuery.matches);
    setReducedMotion(reducedMotionQuery.matches);

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    highContrastQuery.addEventListener('change', handleHighContrastChange);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  const getCardClasses = useCallback((card: Card) => {
    const baseClasses = 'memory-card';
    const stateClasses = [];

    if (highContrast) {
      if (card.isMatched) {
        stateClasses.push('bg-green-900 text-white border-white border-4');
      } else if (card.isFlipped) {
        stateClasses.push('bg-blue-900 text-white border-white border-4');
      } else {
        stateClasses.push('bg-gray-900 text-white border-white border-4');
      }
    } else {
      // Normal contrast classes
      if (card.isMatched) {
        stateClasses.push('bg-green-100 border-green-500 border-2');
      } else if (card.isFlipped) {
        stateClasses.push('bg-blue-100 border-blue-500 border-2');
      } else {
        stateClasses.push('bg-gray-100 border-gray-400 border-2');
      }
    }

    // Focus indicator
    stateClasses.push('focus:ring-4 focus:ring-blue-500 focus:ring-offset-2');

    return [baseClasses, ...stateClasses].join(' ');
  }, [highContrast]);

  return {
    highContrast,
    reducedMotion,
    getCardClasses
  };
};
```

### 2. Focus Indicators and Visual Feedback

```css
/* Enhanced focus indicators for accessibility */
.memory-card {
  position: relative;
  transition: all 0.2s ease-in-out;
}

.memory-card:focus {
  outline: none;
  box-shadow: 
    0 0 0 3px rgba(59, 130, 246, 0.5),
    0 0 0 6px rgba(59, 130, 246, 0.25);
  transform: scale(1.05);
}

.memory-card[data-focused="true"] {
  z-index: 10;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .memory-card:focus {
    outline: 4px solid #000;
    outline-offset: 2px;
    box-shadow: none;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .memory-card {
    transition: none;
  }
  
  .memory-card:focus {
    transform: none;
  }
}

/* Windows High Contrast Mode */
@media screen and (-ms-high-contrast: active) {
  .memory-card {
    border: 2px solid windowText;
  }
  
  .memory-card:focus {
    outline: 3px solid highlight;
  }
}
```

## Alternative Input Methods

### 1. Voice Command Support (Web Speech API)

```tsx
const useVoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const { flipCard, pauseGame, resetGame } = useGame();

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        handleVoiceCommand(command);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const handleVoiceCommand = (command: string) => {
    // Card selection commands
    const cardMatch = command.match(/(?:flip|select|choose)\s+card\s+(\d+)/);
    if (cardMatch) {
      const cardNumber = parseInt(cardMatch[1]) - 1; // Convert to 0-based index
      // flipCard by position logic here
      return;
    }

    // Game control commands
    switch (command) {
      case 'pause game':
      case 'pause':
        pauseGame();
        break;
      case 'reset game':
      case 'restart':
      case 'new game':
        resetGame();
        break;
      case 'help':
        // Show help dialog
        break;
    }
  };

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    startListening,
    stopListening,
    isSupported: !!recognition
  };
};
```

### 2. Switch Navigation Support

```tsx
const useSwitchNavigation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout>();

  const startScanning = useCallback((items: number) => {
    setIsScanning(true);
    
    scanIntervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items);
    }, 1000); // 1 second intervals
  }, []);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
  }, []);

  const selectCurrent = useCallback(() => {
    stopScanning();
    // Trigger action for current item
    return currentIndex;
  }, [currentIndex, stopScanning]);

  // Space bar for switch activation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        event.preventDefault();
        if (isScanning) {
          selectCurrent();
        } else {
          // Start scanning when space is pressed
          const cards = document.querySelectorAll('.memory-card');
          startScanning(cards.length);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isScanning, selectCurrent, startScanning]);

  return {
    currentIndex,
    isScanning,
    startScanning,
    stopScanning,
    selectCurrent
  };
};
```

## Testing and Validation

### 1. Automated Accessibility Testing

```tsx
// Jest + Testing Library accessibility tests
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Memory Game Accessibility', () => {
  test('should have no accessibility violations', async () => {
    const { container } = render(<MemoryGame />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('should have proper ARIA labels on cards', () => {
    render(<MemoryGame />);
    const cards = screen.getAllByRole('button');
    
    cards.forEach((card, index) => {
      expect(card).toHaveAttribute('aria-label');
      expect(card).toHaveAttribute('aria-describedby');
      expect(card.getAttribute('aria-label')).toContain(`Card ${index + 1}`);
    });
  });

  test('should support keyboard navigation', () => {
    render(<MemoryGame />);
    const firstCard = screen.getAllByRole('button')[0];
    
    firstCard.focus();
    expect(firstCard).toHaveFocus();

    fireEvent.keyDown(firstCard, { key: 'ArrowRight' });
    
    const secondCard = screen.getAllByRole('button')[1];
    expect(secondCard).toHaveFocus();
  });

  test('should announce game events to screen readers', async () => {
    render(<MemoryGame />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeInTheDocument();

    // Simulate card flip
    const card = screen.getAllByRole('button')[0];
    fireEvent.click(card);

    await waitFor(() => {
      expect(liveRegion).toHaveTextContent(/flipped/i);
    });
  });
});
```

### 2. Manual Testing Checklist

```markdown
## Accessibility Testing Checklist

### Keyboard Navigation
- [ ] All interactive elements are reachable via keyboard
- [ ] Tab order is logical and predictable
- [ ] Arrow keys navigate between cards in grid pattern
- [ ] Home/End keys jump to first/last card
- [ ] Enter/Space activates cards
- [ ] Escape key pauses game or opens menu

### Screen Reader Support
- [ ] All cards have descriptive aria-labels
- [ ] Game state changes are announced
- [ ] Card flips are announced with content
- [ ] Matches and mismatches are announced
- [ ] Game completion is announced with statistics
- [ ] Instructions are available and clear

### Visual Accessibility
- [ ] Sufficient color contrast (4.5:1 minimum)
- [ ] Focus indicators are clearly visible
- [ ] No information conveyed by color alone
- [ ] Text is readable at 200% zoom
- [ ] High contrast mode is supported

### Motor Accessibility
- [ ] Click targets are at least 44x44px
- [ ] No time-based interactions require quick responses
- [ ] Alternative input methods work (voice, switch)
- [ ] Hover states have keyboard equivalents

### Cognitive Accessibility
- [ ] Clear, simple instructions
- [ ] Consistent navigation patterns
- [ ] Error messages are helpful
- [ ] User can control game pace
- [ ] Visual distractions can be reduced
```

## WCAG 2.1 Compliance

### 1. Level AA Requirements

```tsx
// Comprehensive accessibility component
const WCAGCompliantMemoryGame: React.FC = () => {
  const { reducedMotion } = useAccessibilityTheme();
  const { announcement } = useGameAnnouncements();

  return (
    <div className="memory-game-container">
      {/* Skip link for keyboard users */}
      <a 
        href="#game-board" 
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Skip to game board
      </a>

      {/* Page title and description */}
      <header>
        <h1 id="game-title">Memory Card Game</h1>
        <p id="game-description">
          Match pairs of emoji cards by flipping them over. 
          Use arrow keys to navigate and Enter or Space to flip cards.
        </p>
      </header>

      {/* Game settings with proper labels */}
      <section aria-labelledby="settings-title">
        <h2 id="settings-title">Game Settings</h2>
        <AccessibleGameSettings />
      </section>

      {/* Main game area */}
      <main id="game-board" aria-labelledby="board-title">
        <h2 id="board-title" className="sr-only">Game Board</h2>
        <AccessibleGameBoard />
      </main>

      {/* Live announcements */}
      <GameAnnouncements />

      {/* Error messages */}
      <div role="alert" aria-live="assertive" className="sr-only">
        {/* Error messages appear here */}
      </div>
    </div>
  );
};
```

### 2. Success Criteria Implementation

```tsx
// 1.4.3 Contrast (Minimum) - AA
const ensureContrastCompliance = (backgroundColor: string, textColor: string) => {
  // Implementation would check contrast ratio
  const contrastRatio = calculateContrastRatio(backgroundColor, textColor);
  return contrastRatio >= 4.5;
};

// 2.1.1 Keyboard - A
const KeyboardAccessibleCard: React.FC<CardProps> = ({ card, ...props }) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      props.onClick(card.id);
    }
  };

  return (
    <button
      {...props}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Card content */}
    </button>
  );
};

// 2.4.1 Bypass Blocks - A
const SkipNavigation: React.FC = () => (
  <nav aria-label="Skip navigation">
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <a href="#game-board" className="skip-link">Skip to game board</a>
  </nav>
);

// 3.2.1 On Focus - A
// Ensure no context changes occur on focus
const PredictableFocusCard: React.FC<CardProps> = ({ card, onClick }) => {
  return (
    <button
      onClick={() => onClick(card.id)}
      onFocus={() => {
        // Only visual changes, no context change
        // No automatic card flipping on focus
      }}
    >
      {card.isFlipped ? card.emoji : '❓'}
    </button>
  );
};
```

## Best Practices Summary

### 1. Implementation Guidelines
- **Start with semantic HTML** and enhance with ARIA
- **Test with real users** who rely on assistive technology
- **Use progressive enhancement** for accessibility features
- **Provide multiple ways** to accomplish tasks
- **Make error recovery** clear and simple

### 2. Common Pitfalls to Avoid
- Over-using ARIA instead of semantic HTML
- Creating keyboard traps
- Announcing too much information to screen readers
- Forgetting to test with actual assistive technology
- Assuming ARIA labels replace good visual design

### 3. Testing Strategy
- **Automated testing** with tools like axe-core
- **Manual keyboard testing** without mouse
- **Screen reader testing** with NVDA, JAWS, VoiceOver
- **User testing** with disabled community members
- **Performance testing** with assistive technology

This accessibility implementation ensures the memory game is usable by players with diverse abilities and meets international accessibility standards.