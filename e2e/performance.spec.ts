import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load initial page quickly', async ({ page }) => {
    const startTime = Date.now()
    
    // Wait for the main content to be visible
    await page.waitForSelector('main', { state: 'visible' })
    
    const loadTime = Date.now() - startTime
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should have good Core Web Vitals', async ({ page }) => {
    // Start a game to measure interactive performance
    await page.getByRole('button', { name: /easy/i }).click()
    await page.getByRole('button', { name: /start game/i }).click()
    
    // Measure First Contentful Paint and Largest Contentful Paint
    const metrics = await page.evaluate(() => {
      return new Promise<{ fcp?: number; lcp?: number }>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const paintEntries = entries.filter(entry => 
            entry.entryType === 'paint' || entry.entryType === 'largest-contentful-paint'
          )
          if (paintEntries.length > 0) {
            resolve({
              fcp: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime,
              lcp: paintEntries.find(e => e.entryType === 'largest-contentful-paint')?.startTime,
            })
          }
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
        
        // Fallback timeout
        setTimeout(() => resolve({}), 5000)
      })
    })
    
    // Core Web Vitals thresholds
    if (metrics.fcp) {
      expect(metrics.fcp).toBeLessThan(1800) // FCP should be < 1.8s
    }
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(2500) // LCP should be < 2.5s
    }
  })

  test('should handle rapid card flips without performance degradation', async ({ page }) => {
    // Start an easy game
    await page.getByRole('button', { name: /easy/i }).click()
    await page.getByRole('button', { name: /start game/i }).click()
    
    const cards = page.locator('[data-testid="memory-card"]')
    await cards.first().waitFor({ state: 'visible' })
    
    const startTime = Date.now()
    
    // Rapidly flip cards (simulate fast clicking)
    for (let i = 0; i < 10; i++) {
      const card = cards.nth(i % 8) // Cycle through first 8 cards
      await card.click()
      await page.waitForTimeout(50) // Small delay between clicks
    }
    
    const totalTime = Date.now() - startTime
    
    // Should handle 10 rapid interactions within reasonable time
    expect(totalTime).toBeLessThan(2000)
  })

  test('should maintain smooth animations', async ({ page }) => {
    // Start a game
    await page.getByRole('button', { name: /easy/i }).click()
    await page.getByRole('button', { name: /start game/i }).click()
    
    const card = page.locator('[data-testid="memory-card"]').first()
    
    // Measure animation performance
    const animationTime = await page.evaluate(async (cardSelector) => {
      const cardElement = document.querySelector(cardSelector)
      if (!cardElement) return 0
      
      const startTime = performance.now()
      
      // Trigger card flip
      (cardElement as HTMLElement).click()
      
      // Wait for flip animation to complete
      return new Promise<number>(resolve => {
        const observer = new MutationObserver(() => {
          if (cardElement.classList.contains('rotate-y-180')) {
            const endTime = performance.now()
            observer.disconnect()
            resolve(endTime - startTime)
          }
        })
        
        observer.observe(cardElement, { 
          attributes: true, 
          attributeFilter: ['class'] 
        })
        
        // Fallback
        setTimeout(() => {
          observer.disconnect()
          resolve(500)
        }, 1000)
      })
    }, '[data-testid="memory-card"]')
    
    // Animation should complete within 500ms
    expect(animationTime).toBeLessThan(500)
  })

  test('should efficiently handle large board sizes', async ({ page }) => {
    // Test expert mode (largest board)
    await page.getByRole('button', { name: /expert/i }).click()
    await page.getByRole('button', { name: /start game/i }).click()
    
    const startTime = Date.now()
    
    // Wait for all cards to be rendered
    const cards = page.locator('[data-testid="memory-card"]')
    await expect(cards).toHaveCount(48) // Expert mode has 48 cards
    
    const renderTime = Date.now() - startTime
    
    // Should render large board within reasonable time
    expect(renderTime).toBeLessThan(1000)
    
    // Test interaction performance on large board
    const interactionStart = Date.now()
    
    await cards.first().click()
    await cards.nth(1).click()
    
    const interactionTime = Date.now() - interactionStart
    
    // Interactions should remain fast even on large boards
    expect(interactionTime).toBeLessThan(200)
  })

  test('should not have memory leaks during extended play', async ({ page }) => {
    // Measure initial memory
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize
      }
      return 0
    })
    
    // Play multiple quick games
    for (let game = 0; game < 5; game++) {
      await page.getByRole('button', { name: /easy/i }).click()
      await page.getByRole('button', { name: /start game/i }).click()
      
      // Make a few moves
      const cards = page.locator('[data-testid="memory-card"]')
      for (let i = 0; i < 6; i++) {
        await cards.nth(i).click()
        await page.waitForTimeout(100)
      }
      
      // Reset game
      const resetButton = page.getByRole('button', { name: /reset/i })
      if (await resetButton.isVisible()) {
        await resetButton.click()
      }
    }
    
    // Force garbage collection if available
    await page.evaluate(() => {
      if ('gc' in window) {
        (window as any).gc()
      }
    })
    
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize
      }
      return 0
    })
    
    // Memory usage shouldn't increase significantly
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory
      const increasePercentage = (memoryIncrease / initialMemory) * 100
      
      // Memory increase should be less than 50%
      expect(increasePercentage).toBeLessThan(50)
    }
  })
})