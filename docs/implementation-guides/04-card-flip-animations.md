# Card Flip Animations Guide

## Overview
This guide demonstrates how to create smooth, performant 3D card flip animations using CSS transforms, Tailwind CSS, and React for memory games, with considerations for performance and accessibility.

## Core Animation Principles

### 1. 3D Transform Foundation

```css
/* Base 3D card setup */
.memory-card {
  /* Enable 3D space */
  perspective: 1000px;
  transform-style: preserve-3d;
  
  /* Smooth transitions */
  transition: transform 0.3s ease-in-out;
  
  /* Prevent backface visibility issues */
  backface-visibility: hidden;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
}

.card-front {
  transform: rotateY(0deg);
}

.card-back {
  transform: rotateY(180deg);
}

/* Flipped state */
.card-inner.flipped {
  transform: rotateY(180deg);
}
```

### 2. Tailwind CSS Implementation

```tsx
interface MemoryCardProps {
  card: Card;
  onClick: (cardId: string) => void;
  isAnimating?: boolean;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ card, onClick, isAnimating }) => {
  const [isFlipping, setIsFlipping] = useState(false);

  // Handle flip animation
  const handleClick = useCallback(() => {
    if (card.isFlipped || card.isMatched || isAnimating) return;
    
    setIsFlipping(true);
    onClick(card.id);
    
    // Reset flip state after animation
    setTimeout(() => setIsFlipping(false), 600);
  }, [card, onClick, isAnimating]);

  return (
    <div className="[perspective:1000px] w-full h-full">
      <div
        className={`
          relative w-full h-full
          [transform-style:preserve-3d]
          transition-transform duration-600 ease-out
          cursor-pointer
          ${card.isFlipped || card.isMatched ? '[transform:rotateY(180deg)]' : ''}
          ${isFlipping ? 'scale-105' : ''}
          hover:scale-105 active:scale-95
        `}
        onClick={handleClick}
      >
        {/* Card Back (Hidden/Question Mark) */}
        <div
          className={`
            absolute inset-0
            [backface-visibility:hidden]
            rounded-xl border-2
            flex items-center justify-center
            text-4xl font-bold
            transition-all duration-300
            ${getCardBackClasses(card)}
          `}
        >
          ❓
        </div>

        {/* Card Front (Emoji) */}
        <div
          className={`
            absolute inset-0
            [backface-visibility:hidden]
            [transform:rotateY(180deg)]
            rounded-xl border-2
            flex items-center justify-center
            text-4xl font-bold
            transition-all duration-300
            ${getCardFrontClasses(card)}
          `}
        >
          {card.emoji}
        </div>
      </div>
    </div>
  );
};

// Dynamic styling functions
const getCardBackClasses = (card: Card) => {
  const baseClasses = "bg-gradient-to-br from-blue-400 to-purple-500 border-blue-300 text-white shadow-lg";
  
  if (card.isMatched) {
    return "bg-gradient-to-br from-green-400 to-emerald-500 border-green-300";
  }
  
  return baseClasses;
};

const getCardFrontClasses = (card: Card) => {
  const baseClasses = "bg-white border-gray-200 shadow-xl";
  
  if (card.isMatched) {
    return "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 ring-2 ring-green-300";
  }
  
  return baseClasses;
};
```

## Advanced Animation Patterns

### 1. Staggered Grid Animations

```tsx
const GameBoard: React.FC = () => {
  const { cards } = useGame();
  const [showCards, setShowCards] = useState(false);

  // Animate cards in on game start
  useEffect(() => {
    setShowCards(true);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {cards.map((card, index) => (
        <div
          key={card.id}
          className={`
            transform transition-all duration-500 ease-out
            ${showCards 
              ? 'translate-y-0 opacity-100 scale-100' 
              : 'translate-y-8 opacity-0 scale-90'
            }
          `}
          style={{
            transitionDelay: `${index * 50}ms` // Stagger animation
          }}
        >
          <MemoryCard card={card} onClick={handleCardClick} />
        </div>
      ))}
    </div>
  );
};
```

### 2. Match Animation Effects

```tsx
const MatchedCardPair: React.FC<{ cards: Card[] }> = ({ cards }) => {
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    if (cards.every(card => card.isMatched)) {
      setIsMatching(true);
      
      // Celebration animation sequence
      setTimeout(() => setIsMatching(false), 1000);
    }
  }, [cards]);

  return (
    <>
      {cards.map(card => (
        <div
          key={card.id}
          className={`
            ${isMatching ? 'animate-match-celebration' : ''}
          `}
        >
          <MemoryCard card={card} onClick={() => {}} />
        </div>
      ))}
    </>
  );
};

// Custom animation in CSS or Tailwind config
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'match-celebration': 'matchPulse 0.6s ease-in-out 2',
        'card-flip': 'cardFlip 0.6s ease-in-out',
        'card-shake': 'shake 0.5s ease-in-out'
      },
      keyframes: {
        matchPulse: {
          '0%, 100%': { 
            transform: 'scale(1)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          },
          '50%': { 
            transform: 'scale(1.1)',
            boxShadow: '0 20px 25px -5px rgba(34, 197, 94, 0.4)'
          }
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
        }
      }
    }
  }
}
```

### 3. Performance-Optimized Animations

```tsx
// Use transform properties for GPU acceleration
const OptimizedMemoryCard: React.FC<MemoryCardProps> = ({ card, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  // Optimize animation performance
  const handleFlip = useCallback(() => {
    if (!cardRef.current) return;
    
    // Force layer creation for smoother animation
    cardRef.current.style.willChange = 'transform';
    setIsFlipping(true);
    
    // Clean up after animation
    setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.style.willChange = 'auto';
      }
      setIsFlipping(false);
    }, 600);
    
    onClick(card.id);
  }, [card.id, onClick]);

  return (
    <div
      ref={cardRef}
      className={`
        memory-card-container
        transform-gpu
        ${isFlipping ? 'animate-card-flip' : ''}
      `}
      onClick={handleFlip}
    >
      {/* Card content */}
    </div>
  );
};
```

## Animation States and Transitions

### 1. State Machine for Animation Control

```tsx
type AnimationState = 
  | 'idle'
  | 'flipping'
  | 'flipped'
  | 'matching'
  | 'matched'
  | 'mismatched'
  | 'resetting';

const useCardAnimation = (card: Card) => {
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [isAnimating, setIsAnimating] = useState(false);

  const transitionTo = useCallback((newState: AnimationState, duration: number = 300) => {
    setIsAnimating(true);
    setAnimationState(newState);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, duration);
  }, []);

  // React to card state changes
  useEffect(() => {
    if (card.isMatched && animationState !== 'matched') {
      transitionTo('matching', 600);
      setTimeout(() => transitionTo('matched', 0), 600);
    } else if (card.isFlipped && animationState === 'idle') {
      transitionTo('flipping', 300);
      setTimeout(() => transitionTo('flipped', 0), 300);
    } else if (!card.isFlipped && animationState === 'flipped') {
      transitionTo('resetting', 300);
      setTimeout(() => transitionTo('idle', 0), 300);
    }
  }, [card.isFlipped, card.isMatched, animationState, transitionTo]);

  return {
    animationState,
    isAnimating,
    transitionTo
  };
};
```

### 2. Animation Coordination Hook

```tsx
const useGameAnimations = () => {
  const { state } = useGame();
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set());

  // Track animation states across all cards
  const startCardAnimation = useCallback((cardId: string, duration: number = 600) => {
    setAnimatingCards(prev => new Set(prev).add(cardId));
    
    setTimeout(() => {
      setAnimatingCards(prev => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    }, duration);
  }, []);

  // Prevent interactions during animations
  const canInteract = useCallback(() => {
    return animatingCards.size === 0 && !state.processingMatch;
  }, [animatingCards.size, state.processingMatch]);

  return {
    animatingCards,
    startCardAnimation,
    canInteract,
    isAnyCardAnimating: animatingCards.size > 0
  };
};
```

## Responsive Animation Considerations

### 1. Device-Aware Animation

```tsx
const useResponsiveAnimations = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    // Check for mobile device
    setIsMobile(window.innerWidth < 768);

    const handleChange = () => {
      setReducedMotion(mediaQuery.matches);
      setIsMobile(window.innerWidth < 768);
    };

    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('resize', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('resize', handleChange);
    };
  }, []);

  const getAnimationClasses = useCallback((baseClasses: string) => {
    if (reducedMotion) {
      return baseClasses.replace(/duration-\d+/g, 'duration-0');
    }
    
    if (isMobile) {
      // Faster animations on mobile for better perceived performance
      return baseClasses.replace(/duration-600/g, 'duration-400');
    }
    
    return baseClasses;
  }, [reducedMotion, isMobile]);

  return {
    reducedMotion,
    isMobile,
    getAnimationClasses
  };
};
```

### 2. Adaptive Animation Timing

```tsx
const AdaptiveMemoryCard: React.FC<MemoryCardProps> = ({ card, onClick }) => {
  const { getAnimationClasses } = useResponsiveAnimations();

  const animationClasses = getAnimationClasses(`
    transition-transform duration-600 ease-out
    hover:scale-105 active:scale-95
  `);

  return (
    <div className={`memory-card ${animationClasses}`}>
      {/* Card content */}
    </div>
  );
};
```

## Accessibility Considerations

### 1. Reduced Motion Support

```tsx
const AccessibleMemoryCard: React.FC<MemoryCardProps> = ({ card, onClick }) => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <div
      className={`
        memory-card
        ${prefersReducedMotion 
          ? 'transition-none' 
          : 'transition-all duration-300 ease-in-out'
        }
      `}
      onClick={onClick}
      // Announce state changes to screen readers
      aria-label={`Card ${card.position + 1}, ${
        card.isFlipped ? `showing ${card.emoji}` : 'hidden'
      }, ${card.isMatched ? 'matched' : 'can be flipped'}`}
      aria-pressed={card.isFlipped}
    >
      {/* Card content */}
    </div>
  );
};
```

### 2. Screen Reader Announcements

```tsx
const useGameAnnouncements = () => {
  const [announcement, setAnnouncement] = useState('');

  const announceCardFlip = useCallback((card: Card) => {
    setAnnouncement(`Card flipped, showing ${card.emoji}`);
  }, []);

  const announceMatch = useCallback((cards: Card[]) => {
    setAnnouncement(`Match found! ${cards[0].emoji} pair matched`);
  }, []);

  const announceMismatch = useCallback(() => {
    setAnnouncement('Cards do not match, flipping back');
  }, []);

  return {
    announcement,
    announceCardFlip,
    announceMatch,
    announceMismatch
  };
};

// Screen reader announcement component
const GameAnnouncements: React.FC = () => {
  const { announcement } = useGameAnnouncements();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};
```

## Performance Optimization

### 1. GPU Acceleration

```css
/* Force GPU acceleration for smooth animations */
.memory-card {
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

/* Clean up after animations */
.memory-card:not(.animating) {
  will-change: auto;
}
```

### 2. Animation Batching

```tsx
const useBatchedAnimations = () => {
  const animationQueue = useRef<Array<() => void>>([]);
  const isProcessing = useRef(false);

  const queueAnimation = useCallback((animation: () => void) => {
    animationQueue.current.push(animation);
    
    if (!isProcessing.current) {
      processQueue();
    }
  }, []);

  const processQueue = useCallback(() => {
    if (animationQueue.current.length === 0) {
      isProcessing.current = false;
      return;
    }

    isProcessing.current = true;
    
    requestAnimationFrame(() => {
      const animation = animationQueue.current.shift();
      if (animation) {
        animation();
      }
      processQueue();
    });
  }, []);

  return { queueAnimation };
};
```

## Testing Animation Behavior

### 1. Animation Testing Utilities

```tsx
// Test utilities for animation behavior
export const waitForAnimation = (duration: number = 600) => {
  return new Promise(resolve => setTimeout(resolve, duration));
};

export const mockAnimationFrame = () => {
  let callbacks: Array<() => void> = [];
  
  const flush = () => {
    const toCall = callbacks;
    callbacks = [];
    toCall.forEach(cb => cb());
  };

  window.requestAnimationFrame = jest.fn((cb) => {
    callbacks.push(cb);
    return 0;
  });

  return { flush };
};

// Test example
test('card flips when clicked', async () => {
  const { flush } = mockAnimationFrame();
  
  render(<MemoryCard card={testCard} onClick={mockOnClick} />);
  
  const card = screen.getByTestId('memory-card');
  fireEvent.click(card);
  
  // Trigger animation frame
  flush();
  
  await waitFor(() => {
    expect(card).toHaveClass('flipped');
  });
});
```

## Best Practices

### 1. Animation Guidelines
- **Keep animations short**: 300-600ms for most interactions
- **Use easing functions**: Avoid linear animations, prefer cubic-bezier
- **Respect user preferences**: Honor `prefers-reduced-motion`
- **GPU acceleration**: Use `transform` properties over position changes
- **Clean up**: Remove `will-change` after animations complete

### 2. Performance Tips
- Limit simultaneous animations
- Use `transform` instead of changing layout properties
- Batch DOM updates using `requestAnimationFrame`
- Optimize for 60fps by keeping animation logic simple
- Test on low-end devices

### 3. Accessibility Requirements
- Provide alternatives for users who prefer reduced motion
- Announce important state changes to screen readers
- Ensure animations don't interfere with keyboard navigation
- Test with assistive technologies

This animation system provides smooth, performant card flip effects while maintaining accessibility and responsive design principles for memory games.