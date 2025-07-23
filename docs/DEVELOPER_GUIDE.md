# 💻 Emoji Memory Game - Developer Guide

This comprehensive guide provides everything you need to set up, develop, and deploy the Emoji Memory Game project.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Building and Testing](#building-and-testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## 🛠 Prerequisites

Before getting started, ensure you have the following installed:

### Required Software
```bash
# Node.js (version 18.18.0 or higher)
node --version  # Should show v18.18.0+

# npm (comes with Node.js)
npm --version   # Should show 9.0.0+

# Git (for version control)
git --version   # Any recent version
```

### Recommended Tools
- **VS Code** with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint

## 🚀 Project Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/a5c-ai/sa-memory-game.git

# Navigate to project directory
cd sa-memory-game
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# This will install:
# - Next.js 15.4.3 (React framework)
# - React 19.1.0 (UI library)
# - TypeScript 5+ (Type safety)
# - Tailwind CSS 4 (Styling)
# - ESLint (Code linting)
# - Husky (Git hooks)
```

### 3. Environment Setup

The project uses environment variables for configuration:

```bash
# Create environment file (optional)
cp .env.example .env.local

# Edit environment variables if needed
# Most defaults work for local development
```

### 4. Git Hooks Setup

```bash
# Initialize Husky for pre-commit hooks
npm run prepare

# This enables:
# - Automatic linting before commits
# - Type checking before commits
# - Code formatting with Prettier
```

## 💻 Development Environment

### Starting Development Server

```bash
# Start the development server with Turbopack
npm run dev

# The application will be available at:
# http://localhost:3000
```

### Development Scripts

```bash
# Development with Turbopack (faster builds)
npm run dev

# Type checking
npm run type-check    # Check TypeScript types
npm run type-check:watch  # Watch mode

# Code quality
npm run lint          # Run ESLint
npm run lint:fix      # Fix auto-fixable issues
npm run format        # Format code with Prettier

# Testing
npm run test          # Run Jest tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report

# Building
npm run build         # Production build
npm run export        # Static export for GitHub Pages
npm start             # Start production server (after build)
```

### Development Workflow

1. **Feature Development**
   ```bash
   # Create feature branch
   git checkout -b feature/your-feature-name
   
   # Make changes and test
   npm run dev
   
   # Check code quality
   npm run lint
   npm run type-check
   npm run test
   
   # Commit changes (triggers pre-commit hooks)
   git add .
   git commit -m "feat: add your feature description"
   ```

2. **Code Quality Checks**
   ```bash
   # Run all quality checks
   npm run lint && npm run type-check && npm run test
   
   # Fix common issues
   npm run lint:fix
   npm run format
   ```

## 📂 Project Structure

```
sa-memory-game/
├── app/                        # Next.js App Router
│   ├── components/            # React components
│   │   ├── Card.tsx          # Individual memory card
│   │   └── GameBoard.tsx     # Main game board
│   ├── hooks/                # Custom React hooks
│   │   ├── useGameState.ts   # Game state management
│   │   ├── useLocalStorage.ts # Local storage utilities
│   │   └── useTimer.ts       # Timer functionality
│   ├── types/                # TypeScript type definitions
│   │   └── game.ts           # Game-related interfaces
│   ├── utils/                # Utility functions
│   │   ├── emojiData.ts      # Emoji collections
│   │   ├── gameLogic.ts      # Game logic utilities
│   │   └── scoring.ts        # Score calculation
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout component
│   └── page.tsx              # Home page component
├── docs/                      # Documentation
│   ├── implementation-guides/ # Detailed implementation guides
│   ├── DEVELOPER_GUIDE.md    # This file
│   ├── USER_GUIDE.md         # User documentation
│   └── ARCHITECTURE.md       # Architecture overview
├── public/                   # Static assets
├── scripts/                  # Build and deployment scripts
│   ├── build.sh             # Production build script
│   ├── deploy.sh            # Deployment script
│   ├── dev-run.sh           # Development runner
│   ├── dev-setup.sh         # Development setup
│   ├── install.sh           # Dependency installation
│   └── test.sh              # Test runner
├── .github/                 # GitHub configuration
│   └── workflows/           # GitHub Actions
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Project dependencies and scripts
└── README.md               # Project overview
```

### Key Directories Explained

- **`app/`**: Contains all application code using Next.js App Router
- **`app/components/`**: Reusable React components
- **`app/hooks/`**: Custom hooks for state management and utilities
- **`app/types/`**: TypeScript interfaces and type definitions
- **`app/utils/`**: Pure utility functions and business logic
- **`docs/`**: All project documentation
- **`public/`**: Static assets served by Next.js
- **`scripts/`**: Automation scripts for development and deployment

## 🏗 Building and Testing

### Building for Production

```bash
# Create optimized production build
npm run build

# For GitHub Pages deployment (static export)
npm run export

# Test production build locally
npm run start
```

### Build Configuration

The project is configured for static export to support GitHub Pages:

```typescript
// next.config.ts
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/sa-memory-game/' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/sa-memory-game' : ''
};
```

### Testing Strategy

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test -- Card.test.tsx

# Run tests with specific pattern
npm run test -- --testNamePattern="should match cards"
```

### Test Structure

```
__tests__/
├── components/           # Component tests
│   ├── Card.test.tsx
│   └── GameBoard.test.tsx
├── hooks/               # Hook tests
│   ├── useGameState.test.ts
│   └── useTimer.test.ts
├── utils/               # Utility tests
│   ├── gameLogic.test.ts
│   └── scoring.test.ts
└── setup.ts             # Test configuration
```

### Performance Testing

```bash
# Build and analyze bundle
npm run build
npm run analyze

# Run Lighthouse audit
npx lighthouse http://localhost:3000 --output=html

# Performance profiling
npm run dev
# Open Chrome DevTools > Performance tab
```

## 🚀 Deployment

### GitHub Pages Deployment

The project is configured for automatic deployment to GitHub Pages:

1. **Automatic Deployment**
   ```bash
   # Push to main branch triggers deployment
   git push origin main
   
   # GitHub Actions will:
   # 1. Install dependencies
   # 2. Run tests and linting
   # 3. Build static export
   # 4. Deploy to GitHub Pages
   ```

2. **Manual Deployment**
   ```bash
   # Build for production
   npm run export
   
   # Deploy using GitHub CLI (if configured)
   gh workflow run deploy
   ```

3. **Local GitHub Pages Testing**
   ```bash
   # Build static export
   npm run export
   
   # Serve locally to test
   npx serve out/
   # or
   python -m http.server 8000 -d out/
   ```

### Deployment Configuration

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run export
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

### Alternative Deployment Options

1. **Vercel** (Recommended for Next.js)
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

2. **Netlify**
   ```bash
   # Build command: npm run build
   # Publish directory: out/
   ```

3. **Static Hosting**
   ```bash
   # Any static file server
   npm run export
   # Upload 'out/' directory to your hosting provider
   ```

## 🤝 Contributing

### Development Workflow

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/sa-memory-game.git
   cd sa-memory-game
   npm install
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   ```bash
   # Follow coding standards
   # Add tests for new features
   # Update documentation
   ```

4. **Test Changes**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   git push origin feature/amazing-feature
   ```

6. **Create Pull Request**
   - Describe your changes
   - Link to related issues
   - Add screenshots for UI changes

### Code Standards

#### TypeScript Standards
```typescript
// Use explicit types
interface GameState {
  score: number;
  moves: number;
  timeElapsed: number;
}

// Prefer function declarations for components
export default function GameBoard(): JSX.Element {
  // Component logic
}

// Use const assertions for readonly data
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;
```

#### React Standards
```typescript
// Use functional components with hooks
export default function Card({ emoji, isFlipped, onClick }: CardProps) {
  // Use React.memo for performance
  return React.memo(() => (
    <button onClick={onClick} className="card">
      {isFlipped ? emoji : '?'}
    </button>
  ));
}

// Custom hooks for reusable logic
export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return { state, dispatch };
}
```

#### CSS/Tailwind Standards
```typescript
// Use Tailwind classes consistently
<div className="grid grid-cols-4 gap-4 p-6 bg-white rounded-lg shadow-lg">
  
// Use responsive design
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">

// Group related classes
<button className={cn(
  "px-4 py-2 rounded-md font-medium transition-colors",
  "bg-blue-500 hover:bg-blue-600 text-white",
  "disabled:opacity-50 disabled:cursor-not-allowed"
)}>
```

### Commit Message Format

```bash
# Format: type(scope): description
feat(game): add difficulty selection
fix(card): resolve flip animation timing
docs(readme): update installation instructions
style(components): improve card hover effects
refactor(hooks): simplify game state management
test(utils): add game logic unit tests
chore(deps): update Next.js to v15.4.3
```

## 🐛 Troubleshooting

### Common Development Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev

# Clear npm cache
npm cache clean --force
rm -rf node_modules
npm install

# TypeScript errors
npm run type-check
# Fix reported type errors
```

#### Performance Issues
```bash
# Check bundle size
npm run build
npm run analyze

# Profile performance
# Use React DevTools Profiler
# Check for unnecessary re-renders
```

#### Deployment Issues
```bash
# Test production build locally
npm run build
npm run start

# Check GitHub Pages configuration
# Verify build succeeds in CI/CD
# Check repository settings > Pages
```

### Environment-Specific Issues

#### Windows Development
```bash
# Use PowerShell or WSL2
# Install Node.js via official installer
# Use Git Bash for Unix commands

# Fix line ending issues
git config core.autocrlf true
```

#### macOS Development
```bash
# Install Node.js via Homebrew
brew install node

# Install Xcode Command Line Tools
xcode-select --install
```

#### Linux Development
```bash
# Install Node.js via package manager
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or use NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### Performance Optimization

#### Bundle Size Optimization
```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer

# Common optimizations:
# - Use dynamic imports for large components
# - Optimize images with next/image
# - Remove unused dependencies
# - Enable tree shaking
```

#### Runtime Performance
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Expensive rendering logic
});

// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return complexCalculation(input);
}, [input]);

// Optimize re-renders
const handleClick = useCallback(() => {
  // Event handler logic
}, [dependencies]);
```

## 📚 Additional Resources

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### React Resources
- [React Documentation](https://react.dev)
- [React Hooks](https://react.dev/reference/react)
- [React Performance](https://react.dev/learn/render-and-commit)

### TypeScript Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript with React](https://react-typescript-cheatsheet.netlify.app/)

### Tailwind CSS Resources
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Components](https://tailwindui.com/)

## 🆘 Getting Help

### Documentation
- Check the [User Guide](./USER_GUIDE.md) for gameplay information
- Review [Architecture Documentation](./ARCHITECTURE.md) for system design
- Explore [Implementation Guides](./implementation-guides/) for detailed patterns

### Community Support
- [GitHub Issues](https://github.com/a5c-ai/sa-memory-game/issues) - Report bugs or request features
- [GitHub Discussions](https://github.com/a5c-ai/sa-memory-game/discussions) - Ask questions and share ideas

### Development Support
- Check existing issues before creating new ones
- Provide minimal reproduction cases for bugs
- Include relevant logs and error messages
- Tag issues appropriately (bug, feature, documentation, etc.)

---

**Happy Coding!** 🚀

This developer guide provides comprehensive information to get you started with the Emoji Memory Game project. For more specific implementation details, check out the implementation guides in the `docs/implementation-guides/` directory.