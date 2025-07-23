import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Add any providers here if needed (Context, Redux, etc.)
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
  }

  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Setup user event for testing user interactions
export const setupUser = () => userEvent.setup()

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Custom matchers for testing
export const expectToBeInRange = (value: number, min: number, max: number) => {
  expect(value).toBeGreaterThanOrEqual(min)
  expect(value).toBeLessThanOrEqual(max)
}

// Mock data helpers
export const createMockCard = (overrides = {}) => ({
  id: 1,
  emoji: '🍎',
  isFlipped: false,
  isMatched: false,
  pairId: 1,
  ...overrides,
})

export const createMockGameState = (overrides = {}) => ({
  board: [],
  flippedCards: [],
  matchedPairs: [],
  moves: 0,
  timeElapsed: 0,
  gameStatus: 'setup' as const,
  difficulty: 'easy' as const,
  category: 'food' as const,
  score: 0,
  ...overrides,
})

// Wait for animations to complete
export const waitForAnimations = () => new Promise(resolve => setTimeout(resolve, 500))

// Mock localStorage for tests
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })
  return localStorageMock
}

// Helper to simulate card flips with timing
export const simulateCardFlip = async (card: HTMLElement, user: ReturnType<typeof userEvent.setup>) => {
  await user.click(card)
  await waitForAnimations()
}

// Performance testing helpers
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now()
  renderFn()
  const end = performance.now()
  return end - start
}

// Add a dummy test to satisfy Jest
describe('dummy', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })
})