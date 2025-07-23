import { Card, GameState, EmojiCategory, Difficulty } from '../../app/types/game'

// Test emoji data
export const TEST_EMOJIS = {
  food: ['🍎', '🍌', '🍕', '🍔', '🍰', '🍉', '🥑', '🍊', '🍓', '🥝', '🍇', '🥭', '🍒', '🍑', '🥥', '🍍', '🥬', '🥦', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🦁', '🐯', '🐸', '🐵', '🐷', '🐮', '🐥', '🐣', '🦄', '🐺', '🦝', '🦔', '🐨', '🐙', '🦀', '🐠'],
  objects: ['⚽', '🏀', '🏈', '🎾', '🏐', '🏓', '🎱', '🏸', '🎯', '🎪', '🎨', '🎭', '🎪', '🎤', '🎧', '🎮', '🕹️', '🎯', '🎳', '🎲', '🃏', '🎀', '🎁', '🎊'],
}

// Mock categories
export const MOCK_CATEGORIES: EmojiCategory[] = [
  {
    id: 'food',
    name: 'Food & Drink',
    emojis: TEST_EMOJIS.food,
    description: 'Delicious foods and beverages'
  },
  {
    id: 'animals',
    name: 'Animals',
    emojis: TEST_EMOJIS.animals,
    description: 'Cute animals and creatures'
  },
  {
    id: 'objects',
    name: 'Objects',
    emojis: TEST_EMOJIS.objects,
    description: 'Various objects and items'
  },
]

// Mock cards for different difficulties
export const createMockBoard = (difficulty: Difficulty, category = 'food'): Card[] => {
  const gridSizes = {
    easy: 16,
    medium: 24,
    hard: 36,
    expert: 48,
  }

  const totalCards = gridSizes[difficulty]
  const pairs = totalCards / 2
  const emojis = TEST_EMOJIS[category as keyof typeof TEST_EMOJIS]
  const selectedEmojis = emojis.slice(0, pairs)

  const cards: Card[] = []
  
  // Create pairs
  selectedEmojis.forEach((emoji, index) => {
    cards.push({
      id: index * 2,
      emoji,
      isFlipped: false,
      isMatched: false,
      pairId: index,
    })
    cards.push({
      id: index * 2 + 1,
      emoji,
      isFlipped: false,
      isMatched: false,
      pairId: index,
    })
  })

  return cards
}

// Mock game states for different scenarios
export const MOCK_GAME_STATES = {
  initial: {
    board: [],
    flippedCards: [],
    matchedPairs: [],
    moves: 0,
    timeElapsed: 0,
    gameStatus: 'setup' as const,
    difficulty: 'easy' as const,
    category: 'food' as const,
    score: 0,
  },
  
  inProgress: {
    board: createMockBoard('easy'),
    flippedCards: [],
    matchedPairs: [],
    moves: 5,
    timeElapsed: 30,
    gameStatus: 'playing' as const,
    difficulty: 'easy' as const,
    category: 'food' as const,
    score: 0,
  },
  
  withFlippedCards: {
    board: createMockBoard('easy'),
    flippedCards: [0, 1],
    matchedPairs: [],
    moves: 3,
    timeElapsed: 15,
    gameStatus: 'playing' as const,
    difficulty: 'easy' as const,
    category: 'food' as const,
    score: 0,
  },
  
  withMatches: {
    board: createMockBoard('easy'),
    flippedCards: [],
    matchedPairs: [0, 1, 2],
    moves: 10,
    timeElapsed: 60,
    gameStatus: 'playing' as const,
    difficulty: 'easy' as const,
    category: 'food' as const,
    score: 150,
  },
  
  completed: {
    board: createMockBoard('easy'),
    flippedCards: [],
    matchedPairs: [0, 1, 2, 3, 4, 5, 6, 7], // All pairs matched
    moves: 20,
    timeElapsed: 120,
    gameStatus: 'completed' as const,
    difficulty: 'easy' as const,
    category: 'food' as const,
    score: 300,
  },
} as const

// Mock high scores
export const MOCK_HIGH_SCORES = {
  easy: {
    bestTime: 45,
    bestMoves: 12,
    gamesPlayed: 10,
    gamesWon: 8,
  },
  medium: {
    bestTime: 90,
    bestMoves: 20,
    gamesPlayed: 5,
    gamesWon: 3,
  },
  hard: {
    bestTime: 180,
    bestMoves: 35,
    gamesPlayed: 2,
    gamesWon: 1,
  },
  expert: {
    bestTime: 300,
    bestMoves: 50,
    gamesPlayed: 1,
    gamesWon: 0,
  },
}

// Performance test scenarios
export const PERFORMANCE_SCENARIOS = {
  largeBoard: {
    difficulty: 'expert' as Difficulty,
    expectedRenderTime: 100, // ms
    expectedAnimationTime: 500, // ms
  },
  manyFlips: {
    flipsCount: 50,
    maxRenderTime: 16, // 60fps = ~16ms per frame
  },
}