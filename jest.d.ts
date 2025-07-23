import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toBeVisible(): R
      toHaveClass(className: string): R
      toHaveAttribute(attr: string, value?: string): R
    }
  }
}