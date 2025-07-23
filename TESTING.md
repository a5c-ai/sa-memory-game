# Testing Documentation

This document outlines the comprehensive testing infrastructure for the Memory Game project.

## Overview

The testing setup includes:
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **Accessibility Tests**: axe-core integration
- **Performance Tests**: Lighthouse CI
- **CI/CD Integration**: GitHub Actions

## Test Categories

### 1. Unit Tests (`__tests__/`)
Located in `__tests__/` directory, organized by:
- `components/` - React component tests
- `hooks/` - Custom hook tests  
- `utils/` - Utility function tests
- `fixtures/` - Mock data and test fixtures

**Running Unit Tests:**
```bash
npm test                 # Run tests once
npm run test:watch      # Run in watch mode
npm run test:coverage   # Run with coverage report
```

**Coverage Requirements:**
- **Lines**: 80%+
- **Functions**: 80%+  
- **Branches**: 80%+
- **Statements**: 80%+

### 2. E2E Tests (`e2e/`)
End-to-end tests using Playwright:
- `game-flow.spec.ts` - Complete game scenarios
- `game-accessibility.spec.ts` - Accessibility compliance
- `performance.spec.ts` - Performance benchmarks

**Running E2E Tests:**
```bash
npm run test:e2e        # Run all E2E tests
npm run test:e2e:ui     # Run with UI mode
npm run test:accessibility  # Run accessibility tests only
```

**Browser Coverage:**
- Chromium (Desktop & Mobile)
- Firefox (Desktop)
- WebKit/Safari (Desktop & Mobile)

### 3. Accessibility Tests
Automated accessibility testing using axe-core:
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast validation
- Focus management

**Key Accessibility Features Tested:**
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader announcements
- Color-independent information
- Reduced motion support

### 4. Performance Tests
Performance validation using Lighthouse CI:
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1
- **Performance Score**: 80%+
- **Accessibility Score**: 90%+
- **Best Practices Score**: 90%+

## Test Utilities

### Custom Test Utils (`__tests__/utils/test-utils.tsx`)
Enhanced testing utilities:
- Custom render function with providers
- User event setup helpers
- Animation wait utilities
- Mock data creators
- LocalStorage mocking

### Test Fixtures (`__tests__/fixtures/game-data.ts`)
Mock data for consistent testing:
- Game states (initial, in-progress, completed)
- Card configurations for all difficulties
- Emoji category data
- High score data
- Performance scenarios

## Configuration Files

### Jest Configuration (`jest.config.js`)
- Next.js integration
- jsDOM environment
- Coverage thresholds
- Module name mapping
- Test path patterns

### Playwright Configuration (`playwright.config.ts`)
- Multi-browser testing
- Mobile viewport testing
- Screenshot on failure
- Trace collection
- Local dev server integration

### Lighthouse Configuration (`lighthouserc.js`)
- Performance assertions
- Accessibility requirements
- Best practices validation
- CI integration

## CI/CD Pipeline

### GitHub Actions (`.github_workflows/test.yml`)
Automated testing pipeline with jobs:

1. **Unit Tests Job**:
   - Node.js matrix testing (18.x, 20.x)
   - TypeScript type checking
   - ESLint validation
   - Jest test execution
   - Coverage reporting

2. **E2E Tests Job**:
   - Playwright test execution
   - Multi-browser testing
   - Test report generation
   - Artifact upload

3. **Accessibility Job**:
   - Dedicated accessibility testing
   - axe-core integration
   - WCAG compliance validation

4. **Performance Job**:
   - Lighthouse CI execution
   - Core Web Vitals validation
   - Performance regression detection

## Test Data Management

### Mock Data Strategy
- Realistic test data that mirrors production
- Consistent emoji categories and board configurations
- Predefined game states for different scenarios
- Performance test scenarios with expected benchmarks

### Test Isolation
- Each test runs in isolation
- Clean state setup/teardown
- Mock timers and external dependencies
- No shared state between tests

## Writing Tests

### Component Tests
```typescript
import { render, screen } from '../utils/test-utils'
import { setupUser } from '../utils/test-utils'
import MyComponent from '../../app/components/MyComponent'

describe('MyComponent', () => {
  const user = setupUser()
  
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
  
  it('should handle user interactions', async () => {
    render(<MyComponent onAction={mockFn} />)
    await user.click(screen.getByRole('button'))
    expect(mockFn).toHaveBeenCalled()
  })
})
```

### E2E Tests
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Tests', () => {
  test('should complete user journey', async ({ page }) => {
    await page.goto('/')
    
    // Test interactions
    await page.getByRole('button', { name: /start/i }).click()
    
    // Assertions
    await expect(page.getByText('Game Started')).toBeVisible()
  })
})
```

### Accessibility Tests
```typescript
import { injectAxe, checkA11y } from '@axe-core/playwright'

test('should be accessible', async ({ page }) => {
  await page.goto('/')
  await injectAxe(page)
  await checkA11y(page)
})
```

## Best Practices

### Test Writing Guidelines
1. **Descriptive Names**: Test names should clearly describe the scenario
2. **AAA Pattern**: Arrange, Act, Assert structure
3. **Single Responsibility**: One assertion per test when possible
4. **User-Centric**: Test from user perspective, not implementation
5. **Edge Cases**: Include boundary and error conditions

### Performance Testing
1. **Realistic Scenarios**: Test with realistic data volumes
2. **Multiple Devices**: Test across different viewport sizes
3. **Network Conditions**: Consider various connection speeds
4. **Regression Prevention**: Monitor performance over time

### Accessibility Testing
1. **Automated + Manual**: Combine automated tools with manual testing
2. **Real Assistive Technology**: Test with actual screen readers
3. **Keyboard Navigation**: Verify all functionality is keyboard accessible
4. **Color Blind Testing**: Test with color vision simulators

## Debugging Tests

### Jest Debugging
```bash
# Debug specific test
npm test -- --testNamePattern="specific test name"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand --no-cache
```

### Playwright Debugging
```bash
# Debug mode with browser
npx playwright test --debug

# Headed mode
npx playwright test --headed

# Generate test code
npx playwright codegen localhost:3000
```

## Continuous Integration

### Pre-commit Hooks
- TypeScript type checking
- ESLint validation
- Unit test execution
- Format checking

### Pull Request Checks
- All test suites must pass
- Coverage thresholds must be met
- Performance budgets must be maintained
- Accessibility standards must be satisfied

### Deployment Gates
- E2E tests pass in staging environment
- Performance regression checks
- Security vulnerability scans
- Accessibility compliance verification

## Monitoring and Reporting

### Test Reports
- Jest coverage reports (HTML + LCOV)
- Playwright test reports
- Lighthouse performance reports
- Accessibility audit reports

### Metrics Tracking
- Test execution time trends
- Coverage percentage over time
- Performance metrics history
- Accessibility score tracking

## Troubleshooting

### Common Issues
1. **Flaky Tests**: Use proper waits, avoid hardcoded delays
2. **Test Timeouts**: Increase timeout for slow operations
3. **Memory Leaks**: Clean up resources in test teardown
4. **Async Issues**: Properly handle promises and async operations

### Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)