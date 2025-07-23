import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Game Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should not have any accessibility violations on initial load', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should maintain accessibility during game selection', async ({ page }) => {
    // Select difficulty
    await page.getByRole('button', { name: /medium/i }).click()
    const scanAfterDifficulty = await new AxeBuilder({ page }).analyze()
    expect(scanAfterDifficulty.violations).toEqual([])
    
    // Select category
    await page.getByRole('button', { name: /animals/i }).click()
    const scanAfterCategory = await new AxeBuilder({ page }).analyze()
    expect(scanAfterCategory.violations).toEqual([])
  })

  test('should have proper keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab')
    const focusedElement = await page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Continue tabbing through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      const currentFocus = await page.locator(':focus')
      await expect(currentFocus).toBeVisible()
    }
  })

  test('should have proper ARIA labels on game cards', async ({ page }) => {
    // Start a game first
    await page.getByRole('button', { name: /start game/i }).click()
    
    // Check that cards have proper aria labels
    const cards = page.locator('[data-testid="memory-card"]')
    const cardCount = await cards.count()
    
    for (let i = 0; i < Math.min(cardCount, 5); i++) {
      const card = cards.nth(i)
      await expect(card).toHaveAttribute('aria-label')
      await expect(card).toHaveAttribute('role', 'button')
    }
  })

  test('should announce game state changes to screen readers', async ({ page }) => {
    // Start game
    await page.getByRole('button', { name: /start game/i }).click()
    
    // Check for live regions
    const liveRegion = page.locator('[aria-live]')
    await expect(liveRegion).toBeVisible()
  })

  test('should support reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    // Reload and check accessibility
    await page.reload()
    const scanResults = await new AxeBuilder({ page }).analyze()
    expect(scanResults.violations).toEqual([])
  })
})