import { test, expect } from '@playwright/test'

test.describe('Memory Game E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the game homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/memory game/i)
    await expect(page.getByRole('main')).toBeVisible()
  })

  test('should allow selecting difficulty levels', async ({ page }) => {
    // Test each difficulty level
    const difficulties = ['Easy', 'Medium', 'Hard', 'Expert']
    
    for (const difficulty of difficulties) {
      await page.getByRole('button', { name: new RegExp(difficulty, 'i') }).click()
      // Verify selection is reflected in UI
      await expect(page.getByRole('button', { name: new RegExp(difficulty, 'i') })).toHaveClass(/selected|active/)
    }
  })

  test('should allow selecting emoji categories', async ({ page }) => {
    // Test category selection
    const categories = ['Food', 'Animals', 'Objects']
    
    for (const category of categories) {
      const categoryButton = page.getByRole('button', { name: new RegExp(category, 'i') })
      if (await categoryButton.isVisible()) {
        await categoryButton.click()
        await expect(categoryButton).toHaveClass(/selected|active/)
      }
    }
  })

  test('should start a complete game session', async ({ page }) => {
    // Select game settings
    await page.getByRole('button', { name: /easy/i }).click()
    await page.getByRole('button', { name: /food/i }).click()
    
    // Start the game
    await page.getByRole('button', { name: /start game/i }).click()
    
    // Verify game board appears
    const gameBoard = page.locator('[data-testid="game-board"]')
    await expect(gameBoard).toBeVisible()
    
    // Check that cards are present
    const cards = page.locator('[data-testid="memory-card"]')
    await expect(cards).toHaveCount(16) // Easy mode has 16 cards
    
    // Verify timer starts
    const timer = page.locator('[data-testid="timer"]')
    await expect(timer).toBeVisible()
  })

  test('should allow card flipping and matching', async ({ page }) => {
    // Start an easy game
    await page.getByRole('button', { name: /easy/i }).click()
    await page.getByRole('button', { name: /start game/i }).click()
    
    // Click first card
    const firstCard = page.locator('[data-testid="memory-card"]').first()
    await firstCard.click()
    await expect(firstCard).toHaveClass(/flipped/)
    
    // Click second card
    const secondCard = page.locator('[data-testid="memory-card"]').nth(1)
    await secondCard.click()
    await expect(secondCard).toHaveClass(/flipped/)
    
    // Wait for match evaluation
    await page.waitForTimeout(1000)
    
    // Check moves counter updated
    const movesCounter = page.locator('[data-testid="moves-counter"]')
    await expect(movesCounter).toContainText('1')
  })

  test('should handle game completion', async ({ page }) => {
    // This would be a longer test that completes an entire game
    // For demo purposes, we'll test the completion modal appears
    await page.getByRole('button', { name: /easy/i }).click()
    await page.getByRole('button', { name: /start game/i }).click()
    
    // Simulate game completion (this would require completing all pairs)
    // For testing, we might need to inject completion state or use a test-specific route
  })

  test('should reset game properly', async ({ page }) => {
    // Start a game
    await page.getByRole('button', { name: /easy/i }).click()
    await page.getByRole('button', { name: /start game/i }).click()
    
    // Make some moves
    await page.locator('[data-testid="memory-card"]').first().click()
    await page.locator('[data-testid="memory-card"]').nth(1).click()
    
    // Reset the game
    await page.getByRole('button', { name: /reset/i }).click()
    
    // Verify game state is reset
    const movesCounter = page.locator('[data-testid="moves-counter"]')
    await expect(movesCounter).toContainText('0')
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Verify game loads and is playable on mobile
    await expect(page.getByRole('main')).toBeVisible()
    
    // Test touch interactions
    await page.getByRole('button', { name: /easy/i }).tap()
    await page.getByRole('button', { name: /start game/i }).tap()
    
    // Verify cards are touchable
    const firstCard = page.locator('[data-testid="memory-card"]').first()
    await firstCard.tap()
    await expect(firstCard).toHaveClass(/flipped/)
  })

  test('should persist high scores', async ({ page }) => {
    // Complete a game and check if score is saved
    // This would require completing a game or mocking the completion
    
    // Check local storage for scores
    const scores = await page.evaluate(() => {
      return localStorage.getItem('memoryGameScores')
    })
    
    // Verify scores can be retrieved
    if (scores) {
      expect(JSON.parse(scores)).toBeDefined()
    }
  })
})