import {
  fisherYatesShuffle,
  createGameBoard,
  areCardsMatching,
  getCardById,
  isGameCompleted,
  getTotalPairs,
  getBoardDimensions,
  canFlipCard,
  calculateGameProgress,
  getRemainingPairs,
  validateGameBoard,
  resetBoard,
  getFlippedCards,
  getMatchedCards,
} from '../../app/utils/gameLogic'
import { MOCK_CATEGORIES, createMockBoard } from '../fixtures/game-data'
import { createMockCard } from '../utils/test-utils'

describe('gameLogic utilities', () => {
  describe('fisherYatesShuffle', () => {
    it('should shuffle array elements', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8]
      const shuffled = fisherYatesShuffle(original)
      
      // Should have same length
      expect(shuffled).toHaveLength(original.length)
      
      // Should contain all original elements
      original.forEach(item => {
        expect(shuffled).toContain(item)
      })
      
      // Should not modify original array
      expect(original).not.toBe(shuffled)
    })

    it('should handle empty arrays', () => {
      const result = fisherYatesShuffle([])
      expect(result).toEqual([])
    })

    it('should handle single element arrays', () => {
      const result = fisherYatesShuffle([1])
      expect(result).toEqual([1])
    })
  })

  describe('createGameBoard', () => {
    it('should create correct number of cards for easy difficulty', () => {
      const board = createGameBoard('easy', MOCK_CATEGORIES[0])
      expect(board).toHaveLength(16) // 8 pairs = 16 cards
    })

    it('should create correct number of cards for medium difficulty', () => {
      const board = createGameBoard('medium', MOCK_CATEGORIES[0])
      expect(board).toHaveLength(24) // 12 pairs = 24 cards
    })

    it('should create pairs of matching cards', () => {
      const board = createGameBoard('easy', MOCK_CATEGORIES[0])
      
      // Count occurrences of each emoji
      const emojiCounts = new Map<string, number>()
      board.forEach(card => {
        emojiCounts.set(card.emoji, (emojiCounts.get(card.emoji) || 0) + 1)
      })
      
      // Each emoji should appear exactly twice
      emojiCounts.forEach(count => {
        expect(count).toBe(2)
      })
    })

    it('should assign unique IDs to cards', () => {
      const board = createGameBoard('easy', MOCK_CATEGORIES[0])
      const ids = board.map(card => card.id)
      const uniqueIds = new Set(ids)
      
      expect(uniqueIds.size).toBe(board.length)
    })

    it('should assign correct pairIds', () => {
      const board = createGameBoard('easy', MOCK_CATEGORIES[0])
      
      // Group cards by pairId
      const pairGroups = new Map<number, number>()
      board.forEach(card => {
        pairGroups.set(card.pairId, (pairGroups.get(card.pairId) || 0) + 1)
      })
      
      // Each pairId should have exactly 2 cards
      pairGroups.forEach(count => {
        expect(count).toBe(2)
      })
    })
  })

  describe('areCardsMatching', () => {
    it('should return true for matching cards', () => {
      const card1 = createMockCard({ id: 0, pairId: 1, emoji: '🍎' })
      const card2 = createMockCard({ id: 1, pairId: 1, emoji: '🍎' })
      
      expect(areCardsMatching(card1, card2)).toBe(true)
    })

    it('should return false for non-matching cards', () => {
      const card1 = createMockCard({ id: 0, pairId: 1, emoji: '🍎' })
      const card2 = createMockCard({ id: 1, pairId: 2, emoji: '🍌' })
      
      expect(areCardsMatching(card1, card2)).toBe(false)
    })

    it('should return false for same card', () => {
      const card1 = createMockCard({ id: 0, pairId: 1, emoji: '🍎' })
      const card2 = createMockCard({ id: 0, pairId: 1, emoji: '🍎' })
      
      expect(areCardsMatching(card1, card2)).toBe(false)
    })
  })

  describe('getCardById', () => {
    it('should return correct card by ID', () => {
      const board = createMockBoard('easy')
      const targetId = 5
      
      const result = getCardById(board, targetId)
      
      expect(result).toBeDefined()
      expect(result?.id).toBe(targetId)
    })

    it('should return undefined for non-existent ID', () => {
      const board = createMockBoard('easy')
      
      const result = getCardById(board, 999)
      
      expect(result).toBeUndefined()
    })
  })

  describe('isGameCompleted', () => {
    it('should return true when all cards are matched', () => {
      const board = createMockBoard('easy').map(card => ({ ...card, isMatched: true }))
      
      expect(isGameCompleted(board)).toBe(true)
    })

    it('should return false when some cards are not matched', () => {
      const board = createMockBoard('easy')
      board[0].isMatched = true
      
      expect(isGameCompleted(board)).toBe(false)
    })

    it('should return true for empty board', () => {
      expect(isGameCompleted([])).toBe(true)
    })
  })

  describe('getTotalPairs', () => {
    it('should return correct pairs for each difficulty', () => {
      expect(getTotalPairs('easy')).toBe(8)
      expect(getTotalPairs('medium')).toBe(12)
      expect(getTotalPairs('hard')).toBe(18)
      expect(getTotalPairs('expert')).toBe(24)
    })
  })

  describe('getBoardDimensions', () => {
    it('should return correct dimensions for each difficulty', () => {
      expect(getBoardDimensions('easy')).toEqual({ rows: 4, cols: 4 })
      expect(getBoardDimensions('medium')).toEqual({ rows: 4, cols: 6 })
      expect(getBoardDimensions('hard')).toEqual({ rows: 6, cols: 6 })
      expect(getBoardDimensions('expert')).toEqual({ rows: 6, cols: 8 })
    })
  })

  describe('canFlipCard', () => {
    it('should return true for valid flip', () => {
      const card = createMockCard()
      
      expect(canFlipCard(card, 0, 'playing')).toBe(true)
      expect(canFlipCard(card, 1, 'playing')).toBe(true)
    })

    it('should return false for undefined card', () => {
      expect(canFlipCard(undefined, 0, 'playing')).toBe(false)
    })

    it('should return false when game is not playing', () => {
      const card = createMockCard()
      
      expect(canFlipCard(card, 0, 'setup')).toBe(false)
      expect(canFlipCard(card, 0, 'completed')).toBe(false)
    })

    it('should return false for already flipped card', () => {
      const card = createMockCard({ isFlipped: true })
      
      expect(canFlipCard(card, 0, 'playing')).toBe(false)
    })

    it('should return false for matched card', () => {
      const card = createMockCard({ isMatched: true })
      
      expect(canFlipCard(card, 0, 'playing')).toBe(false)
    })

    it('should return false when 2 cards already flipped', () => {
      const card = createMockCard()
      
      expect(canFlipCard(card, 2, 'playing')).toBe(false)
    })
  })

  describe('calculateGameProgress', () => {
    it('should calculate correct progress percentage', () => {
      expect(calculateGameProgress(0, 8)).toBe(0)
      expect(calculateGameProgress(4, 8)).toBe(50)
      expect(calculateGameProgress(8, 8)).toBe(100)
    })

    it('should handle zero total pairs', () => {
      expect(calculateGameProgress(0, 0)).toBe(0)
    })

    it('should round to nearest integer', () => {
      expect(calculateGameProgress(1, 3)).toBe(33)
      expect(calculateGameProgress(2, 3)).toBe(67)
    })
  })

  describe('getRemainingPairs', () => {
    it('should calculate remaining pairs correctly', () => {
      expect(getRemainingPairs(0, 8)).toBe(8)
      expect(getRemainingPairs(3, 8)).toBe(5)
      expect(getRemainingPairs(8, 8)).toBe(0)
    })

    it('should not return negative values', () => {
      expect(getRemainingPairs(10, 8)).toBe(0)
    })
  })

  describe('validateGameBoard', () => {
    it('should validate correct board', () => {
      const board = createMockBoard('easy')
      
      expect(validateGameBoard(board, 'easy')).toBe(true)
    })

    it('should reject board with wrong card count', () => {
      const board = createMockBoard('easy').slice(0, 10) // Remove some cards
      
      expect(validateGameBoard(board, 'easy')).toBe(false)
    })

    it('should reject board with incorrect pair distribution', () => {
      const board = createMockBoard('easy')
      // Make all cards have the same pairId
      board.forEach(card => { card.pairId = 0 })
      
      expect(validateGameBoard(board, 'easy')).toBe(false)
    })
  })

  describe('resetBoard', () => {
    it('should reset all cards to unflipped/unmatched state', () => {
      const board = createMockBoard('easy').map(card => ({
        ...card,
        isFlipped: true,
        isMatched: true,
      }))
      
      const resetBoardResult = resetBoard(board)
      
      resetBoardResult.forEach(card => {
        expect(card.isFlipped).toBe(false)
        expect(card.isMatched).toBe(false)
      })
    })

    it('should preserve other card properties', () => {
      const board = createMockBoard('easy')
      const originalCard = board[0]
      
      const resetBoardResult = resetBoard(board)
      const resetCard = resetBoardResult[0]
      
      expect(resetCard.id).toBe(originalCard.id)
      expect(resetCard.emoji).toBe(originalCard.emoji)
      expect(resetCard.pairId).toBe(originalCard.pairId)
    })
  })

  describe('getFlippedCards', () => {
    it('should return only flipped but not matched cards', () => {
      const board = createMockBoard('easy')
      board[0].isFlipped = true
      board[1].isFlipped = true
      board[1].isMatched = true
      board[2].isMatched = true
      
      const flippedCards = getFlippedCards(board)
      
      expect(flippedCards).toHaveLength(1)
      expect(flippedCards[0].id).toBe(board[0].id)
    })

    it('should return empty array when no cards are flipped', () => {
      const board = createMockBoard('easy')
      
      const flippedCards = getFlippedCards(board)
      
      expect(flippedCards).toHaveLength(0)
    })
  })

  describe('getMatchedCards', () => {
    it('should return only matched cards', () => {
      const board = createMockBoard('easy')
      board[0].isMatched = true
      board[1].isMatched = true
      board[2].isFlipped = true
      
      const matchedCards = getMatchedCards(board)
      
      expect(matchedCards).toHaveLength(2)
      expect(matchedCards.map(c => c.id)).toEqual([board[0].id, board[1].id])
    })

    it('should return empty array when no cards are matched', () => {
      const board = createMockBoard('easy')
      
      const matchedCards = getMatchedCards(board)
      
      expect(matchedCards).toHaveLength(0)
    })
  })
})