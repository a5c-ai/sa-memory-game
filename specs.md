# Emoji Memory Game - Project Specifications

## Project Overview

**Project Name**: Emoji Memory Game  
**Template Used**: Next.js 15 Vercel Example Template  
**Description**: An emoji memory game built with Next.js, allowing multiple board sizes, emoji types (food, animal, etc.), client-side only implementation with no backend requirements, and deployment to GitHub Pages.

## Technology Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Runtime**: React 19.1.0
- **Deployment**: GitHub Pages (configured for static export)
- **Development**: Turbopack for fast development

## Game Mechanics & Rules

### Core Gameplay
1. **Card Flipping**: Players click on cards to flip them and reveal emojis
2. **Pattern Matching**: Match pairs of identical emojis
3. **Game Objective**: Complete the board by matching all pairs
4. **Challenge**: Finish with the fewest moves and shortest time

### Game States
- **Pre-game**: Board setup and configuration selection
- **Active**: Game in progress with timer running
- **Paused**: Game temporarily halted (timer paused)
- **Completed**: All pairs matched successfully
- **Failed**: Optional failure condition (time limit exceeded)

### Difficulty Levels
- **Easy**: 4x4 grid (8 pairs, 16 cards)
- **Medium**: 6x4 grid (12 pairs, 24 cards)  
- **Hard**: 6x6 grid (18 pairs, 36 cards)
- **Expert**: 8x6 grid (24 pairs, 48 cards)

## Feature Requirements

### Core Features
- ✅ Multiple board sizes for different difficulty levels
- ✅ Various emoji categories (food, animals, objects, nature, travel, activities)
- ✅ Responsive design for mobile and desktop
- ✅ Score tracking and game statistics
- ✅ Timer functionality
- ✅ Smooth animations and transitions

### Extended Features
- **Category Selection**: Players can choose emoji themes
- **Statistics Tracking**: Moves count, time elapsed, best scores
- **Local Storage**: Persist high scores and preferences
- **Accessibility**: Keyboard navigation and screen reader support
- **Progressive Enhancement**: Works without JavaScript (basic functionality)

## Technical Architecture

### Component Structure
```
app/
├── layout.tsx (Root layout with global styles)
├── page.tsx (Home page with game board)
├── components/
│   ├── GameBoard.tsx (Main game board container)
│   ├── Card.tsx (Individual memory card)
│   ├── GameControls.tsx (Start, pause, reset buttons)
│   ├── GameStats.tsx (Timer, moves counter, score)
│   ├── DifficultySelector.tsx (Board size selection)
│   ├── CategorySelector.tsx (Emoji category selection)
│   └── GameOverModal.tsx (Completion/results dialog)
├── hooks/
│   ├── useGameState.ts (Game logic and state management)
│   ├── useTimer.ts (Timer functionality)
│   └── useLocalStorage.ts (Persistence utilities)
├── utils/
│   ├── emojiData.ts (Emoji collections by category)
│   ├── gameLogic.ts (Shuffle, match detection utilities)
│   └── scoring.ts (Score calculation algorithms)
└── types/
    └── game.ts (TypeScript interfaces and types)
```

### Data Structures

#### Game State Interface
```typescript
interface GameState {
  board: Card[];
  flippedCards: number[];
  matchedPairs: number[];
  moves: number;
  timeElapsed: number;
  gameStatus: 'setup' | 'playing' | 'paused' | 'completed';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: EmojiCategory;
  score: number;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  pairId: number;
}

interface GameStats {
  totalGames: number;
  bestTimes: Record<Difficulty, number>;
  bestMoves: Record<Difficulty, number>;
  completionRate: number;
}
```

### State Management Strategy

**Primary Approach**: React hooks with useReducer for complex game state
- `useGameState`: Central game logic and state management
- `useTimer`: Dedicated timer management with pause/resume
- `useLocalStorage`: Persistent data management
- Context API for global game settings (theme, sound preferences)

**State Flow**:
1. Initial setup → Category/difficulty selection
2. Board generation → Card shuffling and placement
3. Game loop → Card flipping, matching, validation
4. Completion → Score calculation, statistics update

## User Interface Specifications

### Layout Design
- **Mobile-first**: Responsive grid layout adapting to screen size
- **Card Grid**: Dynamic grid based on difficulty (CSS Grid)
- **Header**: Game title, timer, moves counter
- **Controls**: Difficulty selector, category picker, reset button
- **Footer**: Statistics, help, accessibility options

### Visual Design
- **Color Scheme**: Accessible contrast ratios, dark/light theme support
- **Typography**: Clear, readable fonts (system fonts for performance)
- **Card Design**: Rounded corners, subtle shadows, hover effects
- **Animations**: Smooth flip transitions (CSS transforms), match celebrations

### Responsive Breakpoints
```css
/* Mobile: 320px - 768px */
.board-container { 
  padding: 1rem;
  max-width: 100vw;
}

/* Tablet: 768px - 1024px */
@media (min-width: 768px) {
  .board-container { 
    padding: 2rem;
    max-width: 600px;
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .board-container { 
    max-width: 800px;
    margin: 0 auto;
  }
}
```

### Accessibility Requirements
- **WCAG 2.1 AA compliance**
- **Keyboard Navigation**: Tab order, Enter/Space activation
- **Screen Reader Support**: Proper ARIA labels and roles
- **Color Independence**: Information not conveyed by color alone
- **Focus Management**: Clear focus indicators
- **Reduced Motion**: Respect `prefers-reduced-motion`

## Performance Requirements

### Core Web Vitals Targets
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms  
- **CLS (Cumulative Layout Shift)**: < 0.1

### Optimization Strategies
- **Code Splitting**: Dynamic imports for game components
- **Image Optimization**: Emoji rendering optimization
- **Bundle Size**: Keep total JS < 200KB (gzipped)
- **Lazy Loading**: Non-critical components loaded on demand
- **Memory Management**: Efficient card state updates

### Browser Support
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Progressive Enhancement**: Basic functionality for older browsers
- **Mobile Optimization**: iOS Safari 14+, Chrome Mobile 90+

## Emoji Data Management

### Category Structure
```typescript
interface EmojiCategory {
  id: string;
  name: string;
  emojis: string[];
  description: string;
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'food',
    name: 'Food & Drink',
    emojis: ['🍎', '🍌', '🍕', '🍔', '🍰', '🍉', '🥑', '🍊'],
    description: 'Delicious foods and beverages'
  },
  {
    id: 'animals',
    name: 'Animals',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    description: 'Cute animals and creatures'
  },
  // ... additional categories
];
```

### Emoji Selection Algorithm
1. **Category Filtering**: Select emojis from chosen category
2. **Pair Generation**: Create matched pairs for game board
3. **Shuffling**: Fisher-Yates shuffle for random placement
4. **Validation**: Ensure sufficient emojis for difficulty level

## Testing Requirements

### Unit Testing
- **Game Logic**: Card matching, scoring algorithms
- **Utilities**: Shuffle functions, timer calculations
- **Components**: Isolated component behavior
- **Hooks**: Custom hook functionality

### Integration Testing
- **Game Flow**: Complete game scenarios
- **State Management**: Cross-component state updates
- **Persistence**: Local storage operations
- **Responsive Design**: Layout behavior across devices

### End-to-End Testing
- **User Journeys**: Complete game sessions
- **Accessibility**: Screen reader and keyboard navigation
- **Performance**: Core Web Vitals measurement
- **Cross-browser**: Major browser compatibility

### Testing Tools
- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright or Cypress
- **Performance**: Lighthouse CI
- **Accessibility**: axe-core integration

## Deployment Specifications

### GitHub Pages Configuration
```json
// next.config.ts additions for static export
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/sa-memory-game/' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/sa-memory-game' : ''
};
```

### Build Pipeline
1. **Development**: `npm run dev` (Turbopack)
2. **Build**: `npm run build` (Static export)
3. **Deploy**: GitHub Actions → GitHub Pages
4. **Testing**: Automated testing in CI/CD pipeline

### Environment Configuration
- **Production**: Static files served from GitHub Pages
- **Development**: Local Next.js dev server
- **Preview**: GitHub Pages deployment previews
- **Assets**: All assets must be relative paths for GitHub Pages

## Security Considerations

### Client-side Security
- **XSS Prevention**: Sanitized emoji rendering
- **Content Security Policy**: Restrictive CSP headers
- **Data Validation**: Input validation for game settings
- **Safe Storage**: Secure local storage usage

### Privacy Requirements
- **No Analytics**: No user tracking or analytics
- **Local Data**: All data stored locally
- **No Cookies**: Cookie-free implementation
- **Minimal Permissions**: No unnecessary browser permissions

## Development Workflow

### Setup Process
1. **Installation**: `npm install`
2. **Development**: `npm run dev`
3. **Type Check**: `npm run type-check`
4. **Linting**: `npm run lint`
5. **Testing**: `npm run test`
6. **Build**: `npm run build`

### Code Quality Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks

### Git Workflow
- **Main Branch**: Production-ready code
- **Feature Branches**: Individual feature development
- **Pull Requests**: Code review required
- **Conventional Commits**: Standardized commit messages

## Future Enhancements

### Potential Features
- **Multiplayer Mode**: Local multiplayer support
- **Custom Emojis**: User-uploaded emoji sets
- **Sound Effects**: Audio feedback (optional)
- **Themes**: Visual theme customization
- **Achievements**: Unlock system for milestones
- **Export Statistics**: Downloadable game history

### Technical Improvements
- **Service Worker**: Offline functionality
- **PWA Features**: Install prompt, app-like experience
- **Advanced Analytics**: Detailed performance tracking
- **API Integration**: Online leaderboards (future backend)

## Success Metrics

### User Experience
- **Completion Rate**: > 70% of started games completed
- **Return Usage**: > 50% users play multiple sessions
- **Performance**: All Core Web Vitals targets met
- **Accessibility**: WCAG AA compliance verified

### Technical Metrics
- **Build Time**: < 30 seconds
- **Bundle Size**: < 200KB total JavaScript
- **Test Coverage**: > 90% code coverage
- **Zero Runtime Errors**: No console errors in production

---

This specification document provides a comprehensive foundation for developing the Emoji Memory Game, ensuring all requirements are clearly defined and implementation follows best practices for performance, accessibility, and user experience.