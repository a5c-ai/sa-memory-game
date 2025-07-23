# Responsive Game Board Layouts Guide

## Overview
This guide demonstrates how to create responsive grid layouts for memory games using Tailwind CSS that adapt seamlessly across mobile, tablet, and desktop devices.

## Core Responsive Patterns

### 1. Mobile-First Grid System

**Basic Responsive Grid:**
```jsx
// Adaptive grid: 2 cols mobile → 4 cols tablet → 6 cols desktop
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4 p-4">
  {cards.map(card => (
    <MemoryCard key={card.id} card={card} onClick={handleCardClick} />
  ))}
</div>
```

**Advanced Responsive Configuration:**
```jsx
interface BoardConfig {
  gridSize: number;
  breakpoints: {
    sm: number;  // cols for mobile
    md: number;  // cols for tablet
    lg: number;  // cols for desktop
    xl: number;  // cols for large desktop
  };
}

const BOARD_CONFIGS: Record<string, BoardConfig> = {
  small: {
    gridSize: 12,
    breakpoints: { sm: 3, md: 4, lg: 4, xl: 6 }
  },
  medium: {
    gridSize: 16,
    breakpoints: { sm: 2, md: 4, lg: 4, xl: 4 }
  },
  large: {
    gridSize: 20,
    breakpoints: { sm: 2, md: 4, lg: 5, xl: 5 }
  },
  xlarge: {
    gridSize: 24,
    breakpoints: { sm: 2, md: 4, lg: 6, xl: 6 }
  }
};
```

### 2. Dynamic Grid Classes

```typescript
const useResponsiveGrid = (boardSize: keyof typeof BOARD_CONFIGS) => {
  const config = BOARD_CONFIGS[boardSize];
  
  const gridClasses = useMemo(() => {
    const { sm, md, lg, xl } = config.breakpoints;
    return [
      'grid',
      `grid-cols-${sm}`,
      `md:grid-cols-${md}`,
      `lg:grid-cols-${lg}`,
      `xl:grid-cols-${xl}`,
      'gap-2 md:gap-3 lg:gap-4',
      'p-2 md:p-4 lg:p-6'
    ].join(' ');
  }, [config]);

  return { gridClasses, totalCards: config.gridSize };
};

// Usage in component
const GameBoard: React.FC<{ boardSize: string }> = ({ boardSize }) => {
  const { gridClasses, totalCards } = useResponsiveGrid(boardSize);
  
  return (
    <div className={gridClasses}>
      {/* Cards rendered here */}
    </div>
  );
};
```

### 3. Card Sizing and Aspect Ratios

```jsx
// Responsive card with fixed aspect ratio
const MemoryCard: React.FC<MemoryCardProps> = ({ card, onClick }) => {
  return (
    <button
      className={`
        aspect-square
        w-full
        min-h-[60px] sm:min-h-[80px] md:min-h-[100px]
        max-h-[120px] sm:max-h-[140px] md:max-h-[160px]
        rounded-lg sm:rounded-xl
        text-xl sm:text-2xl md:text-3xl lg:text-4xl
        font-bold
        transition-all duration-300
        hover:scale-105
        focus:scale-105
        ${getCardClasses(card)}
      `}
      onClick={() => onClick(card.id)}
      disabled={card.isFlipped || card.isMatched}
    >
      {card.isFlipped || card.isMatched ? card.emoji : '❓'}
    </button>
  );
};
```

## Container and Layout Strategies

### 1. Responsive Container Management

```jsx
const GameContainer: React.FC = ({ children }) => {
  return (
    <div className="
      container mx-auto
      px-4 sm:px-6 lg:px-8
      py-4 sm:py-6 lg:py-8
      max-w-sm sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl
    ">
      {children}
    </div>
  );
};
```

### 2. Adaptive Game UI Layout

```jsx
const GameLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header - responsive stack */}
      <header className="
        flex flex-col sm:flex-row
        justify-between items-center
        p-4 sm:p-6
        gap-4 sm:gap-0
      ">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          Memory Game
        </h1>
        
        {/* Game controls - responsive layout */}
        <div className="
          flex flex-col xs:flex-row
          gap-2 sm:gap-4
          w-full sm:w-auto
        ">
          <GameStats />
          <GameControls />
        </div>
      </header>

      {/* Main game area */}
      <main className="
        flex-1
        flex flex-col
        items-center
        px-4 sm:px-6 lg:px-8
      ">
        <GameBoard />
      </main>
    </div>
  );
};
```

## Breakpoint-Specific Optimizations

### 1. Touch-Friendly Mobile Design

```jsx
// Mobile-optimized card interactions
const MobileOptimizedCard: React.FC<MemoryCardProps> = ({ card, onClick }) => {
  return (
    <button
      className={`
        // Larger touch targets for mobile
        min-h-[80px] sm:min-h-[100px]
        p-2 sm:p-3
        
        // Enhanced touch feedback
        active:scale-95 sm:active:scale-105
        touch-manipulation
        
        // Improved readability on small screens
        text-2xl sm:text-3xl md:text-4xl
        
        ${getCardClasses(card)}
      `}
      onClick={() => onClick(card.id)}
    >
      {card.isFlipped || card.isMatched ? card.emoji : '❓'}
    </button>
  );
};
```

### 2. Desktop Enhancement Features

```jsx
// Desktop-specific enhancements
const DesktopEnhancedGame: React.FC = () => {
  return (
    <div className="
      // Desktop-only sidebar for advanced controls
      lg:grid lg:grid-cols-4 lg:gap-8
    ">
      {/* Game board takes main area */}
      <div className="lg:col-span-3">
        <GameBoard />
      </div>
      
      {/* Desktop sidebar - hidden on mobile/tablet */}
      <aside className="hidden lg:block">
        <GameStatistics />
        <DifficultySelector />
        <ThemeSelector />
      </aside>
    </div>
  );
};
```

## Advanced Responsive Techniques

### 1. Dynamic Viewport Units

```jsx
// Utilize viewport dimensions for optimal sizing
const ViewportAwareGame: React.FC = () => {
  return (
    <div className="
      // Use viewport height for full-screen experience
      min-h-screen
      
      // Dynamic padding based on viewport
      p-[2vw] sm:p-[3vw] lg:p-[4vw]
      
      // Responsive text scaling
      text-[4vw] sm:text-[3vw] md:text-[2vw] lg:text-xl
    ">
      <GameBoard />
    </div>
  );
};
```

### 2. Container Queries (Modern Approach)

```jsx
// Using Tailwind's container queries (v3.2+)
const ContainerAwareBoard: React.FC = () => {
  return (
    <div className="@container">
      <div className="
        grid
        grid-cols-2 @sm:grid-cols-3 @md:grid-cols-4 @lg:grid-cols-6
        gap-2 @md:gap-4
      ">
        {/* Cards adapt to container size, not viewport */}
      </div>
    </div>
  );
};
```

## Performance Considerations

### 1. Responsive Image Optimization

```jsx
// Optimize emoji rendering for different screen sizes
const OptimizedEmojiCard: React.FC<MemoryCardProps> = ({ card }) => {
  return (
    <div className="
      // Use CSS to scale emojis properly
      text-[clamp(1.5rem,4vw,3rem)]
      
      // Prevent layout shift
      leading-none
      
      // Optimize rendering
      will-change-transform
    ">
      {card.emoji}
    </div>
  );
};
```

### 2. Layout Shift Prevention

```jsx
// Prevent cumulative layout shift (CLS)
const StableGameBoard: React.FC = () => {
  return (
    <div 
      className="grid gap-4"
      style={{
        // Reserve space before cards load
        minHeight: 'calc(100vh - 200px)',
        gridTemplateRows: 'repeat(auto-fit, minmax(80px, 1fr))'
      }}
    >
      {/* Cards */}
    </div>
  );
};
```

## Testing Responsive Layouts

### 1. Common Breakpoint Testing

```typescript
// Test configuration for different screen sizes
const RESPONSIVE_TEST_CASES = [
  { name: 'Mobile', width: 375, height: 667, gridCols: 2 },
  { name: 'Mobile Large', width: 414, height: 896, gridCols: 2 },
  { name: 'Tablet', width: 768, height: 1024, gridCols: 4 },
  { name: 'Desktop', width: 1024, height: 768, gridCols: 4 },
  { name: 'Large Desktop', width: 1440, height: 900, gridCols: 6 },
];

// Jest + Testing Library responsive test
test.each(RESPONSIVE_TEST_CASES)('renders correctly on $name', ({ width, gridCols }) => {
  // Mock viewport size
  global.innerWidth = width;
  
  render(<GameBoard />);
  
  // Verify grid columns match expected layout
  const board = screen.getByTestId('game-board');
  expect(board).toHaveClass(`grid-cols-${gridCols}`);
});
```

## Best Practices

### 1. Design Principles
- **Mobile First**: Start with mobile design, enhance for larger screens
- **Progressive Enhancement**: Core functionality works on all devices
- **Touch-Friendly**: Minimum 44px touch targets on mobile
- **Readable Text**: Ensure adequate contrast and sizing

### 2. Performance Guidelines
- Use `transform` properties for animations (GPU accelerated)
- Minimize layout thrashing with stable grid structures
- Implement proper loading states for different screen sizes
- Test on real devices, not just browser dev tools

### 3. Accessibility Considerations
- Maintain focus indicators across all screen sizes
- Ensure adequate spacing for assistive technology
- Test with screen readers on mobile devices
- Support both portrait and landscape orientations

## Common Pitfalls

1. **Fixed Sizing**: Avoid fixed pixel values that don't scale
2. **Viewport Assumptions**: Don't assume portrait orientation on mobile
3. **Touch Targets**: Cards too small for comfortable touch interaction
4. **Text Scaling**: Emojis that become unreadable on small screens
5. **Grid Overflow**: Not accounting for different aspect ratios

## Integration with Other Systems

- **Animation System**: Ensure animations work across all screen sizes
- **State Management**: Screen size changes shouldn't reset game state
- **Local Storage**: Save responsive preferences
- **Accessibility**: Coordinate with screen reader announcements

This responsive layout foundation ensures your memory game provides an optimal experience across all devices and screen sizes.