import { Card, Difficulty, EmojiCategory, DIFFICULTY_CONFIGS } from '../types/game';
import { getRandomEmojis, validateCategoryForDifficulty } from './emojiData';

/**
 * Fisher-Yates shuffle algorithm for randomizing array elements
 * Time Complexity: O(n), Space Complexity: O(1)
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Generate pairs of emojis from a category for the game board
 */
export function generateEmojiPairs(category: EmojiCategory, pairCount: number): string[] {
  if (!validateCategoryForDifficulty(category, pairCount)) {
    throw new Error(
      `Category '${category.name}' doesn't have enough emojis for ${pairCount} pairs. ` +
      `Required: ${pairCount}, Available: ${category.emojis.length}`
    );
  }

  return getRandomEmojis(category, pairCount);
}

/**
 * Create game board with shuffled cards
 */
export function createGameBoard(difficulty: Difficulty, category: EmojiCategory): Card[] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const { pairs } = config;

  // Generate emoji pairs for the game
  const selectedEmojis = generateEmojiPairs(category, pairs);

  // Create card objects - two cards per emoji
  const cards: Card[] = [];
  selectedEmojis.forEach((emoji, pairIndex) => {
    // First card of the pair
    cards.push({
      id: pairIndex * 2,
      emoji,
      isFlipped: false,
      isMatched: false,
      pairId: pairIndex
    });

    // Second card of the pair
    cards.push({
      id: pairIndex * 2 + 1,
      emoji,
      isFlipped: false,
      isMatched: false,
      pairId: pairIndex
    });
  });

  // Shuffle the cards
  const shuffledCards = fisherYatesShuffle(cards);

  // Update IDs to match shuffled positions
  shuffledCards.forEach((card, index) => {
    card.id = index;
  });

  return shuffledCards;
}

/**
 * Check if two cards form a matching pair
 */
export function areCardsMatching(card1: Card, card2: Card): boolean {
  return card1.pairId === card2.pairId && card1.id !== card2.id;
}

/**
 * Get card by ID from the board
 */
export function getCardById(board: Card[], cardId: number): Card | undefined {
  return board.find(card => card.id === cardId);
}

/**
 * Check if all cards are matched (game completed)
 */
export function isGameCompleted(board: Card[]): boolean {
  return board.every(card => card.isMatched);
}

/**
 * Get total pairs for a difficulty level
 */
export function getTotalPairs(difficulty: Difficulty): number {
  return DIFFICULTY_CONFIGS[difficulty].pairs;
}

/**
 * Get board dimensions for a difficulty level
 */
export function getBoardDimensions(difficulty: Difficulty): { rows: number; cols: number } {
  const config = DIFFICULTY_CONFIGS[difficulty];
  return { rows: config.rows, cols: config.cols };
}

/**
 * Validate card flip action
 */
export function canFlipCard(
  card: Card | undefined,
  flippedCardsCount: number,
  gameStatus: string
): boolean {
  if (!card || gameStatus !== 'playing') {
    return false;
  }

  if (card.isFlipped || card.isMatched) {
    return false;
  }

  if (flippedCardsCount >= 2) {
    return false;
  }

  return true;
}

/**
 * Calculate game progress percentage
 */
export function calculateGameProgress(matchedPairs: number, totalPairs: number): number {
  if (totalPairs === 0) return 0;
  return Math.round((matchedPairs / totalPairs) * 100);
}

/**
 * Get remaining pairs count
 */
export function getRemainingPairs(matchedPairs: number, totalPairs: number): number {
  return Math.max(0, totalPairs - matchedPairs);
}

/**
 * Validate game board integrity
 */
export function validateGameBoard(board: Card[], difficulty: Difficulty): boolean {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const expectedCards = config.pairs * 2;

  // Check total card count
  if (board.length !== expectedCards) {
    return false;
  }

  // Check that each pair has exactly 2 cards
  const pairCounts = new Map<number, number>();
  for (const card of board) {
    pairCounts.set(card.pairId, (pairCounts.get(card.pairId) || 0) + 1);
  }

  // Verify each pair has exactly 2 cards
  for (const count of pairCounts.values()) {
    if (count !== 2) {
      return false;
    }
  }

  // Verify correct number of pairs
  if (pairCounts.size !== config.pairs) {
    return false;
  }

  return true;
}

/**
 * Reset all cards to initial state
 */
export function resetBoard(board: Card[]): Card[] {
  return board.map(card => ({
    ...card,
    isFlipped: false,
    isMatched: false
  }));
}

/**
 * Get cards that are currently flipped but not matched
 */
export function getFlippedCards(board: Card[]): Card[] {
  return board.filter(card => card.isFlipped && !card.isMatched);
}

/**
 * Get matched cards from the board
 */
export function getMatchedCards(board: Card[]): Card[] {
  return board.filter(card => card.isMatched);
}