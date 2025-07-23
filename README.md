# 🧠 Emoji Memory Game

A modern, accessible emoji memory game built with Next.js 15, React 19, and TypeScript. Test your memory by matching pairs of emojis across multiple difficulty levels and categories!

![Game Preview](https://img.shields.io/badge/Demo-Live%20Preview-blue?style=for-the-badge)
[![Deployed on GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-green?style=for-the-badge&logo=github)](https://a5c-ai.github.io/sa-memory-game)

## ✨ Features

### 🎮 Core Gameplay
- **Multiple Difficulty Levels**: Easy (4×4), Medium (6×4), Hard (6×6), Expert (8×6)
- **Emoji Categories**: Food & Drink, Animals, Objects, Nature, Travel, and more
- **Smart Scoring System**: Time-based scoring with move efficiency bonuses
- **Game Statistics**: Track your best times, scores, and completion rates
- **Persistent High Scores**: Your achievements are saved locally

### 🎨 User Experience  
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Smooth Animations**: GPU-accelerated card flip animations
- **Accessibility First**: WCAG 2.1 AA compliant with full keyboard navigation
- **Dark/Light Theme**: Respects system preferences
- **Offline Ready**: Works completely offline after initial load

### 🛠 Technical Excellence
- **Modern Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Performance Optimized**: Core Web Vitals compliant
- **Zero Dependencies**: No external APIs or backend required
- **Progressive Enhancement**: Works even with JavaScript disabled

## 🚀 Quick Start

### Prerequisites
- Node.js 18.18.0 or higher
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/a5c-ai/sa-memory-game.git
cd sa-memory-game

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start playing!

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create production build |
| `npm run export` | Generate static export for GitHub Pages |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint code analysis |
| `npm run type-check` | Run TypeScript type checking |
| `npm run test` | Run Jest unit tests |

## 🎯 How to Play

### Basic Rules
1. **Choose your settings**: Select difficulty level and emoji category
2. **Flip cards**: Click on face-down cards to reveal emojis
3. **Match pairs**: Find two cards with identical emojis
4. **Complete the board**: Match all pairs to win the game
5. **Beat your score**: Aim for fewer moves and faster completion times

### Difficulty Levels
- **🟢 Easy (4×4)**: 16 cards, 8 pairs - Perfect for beginners
- **🟡 Medium (6×4)**: 24 cards, 12 pairs - Balanced challenge  
- **🟠 Hard (6×6)**: 36 cards, 18 pairs - Memory test
- **🔴 Expert (8×6)**: 48 cards, 24 pairs - Ultimate challenge

### Keyboard Controls
- **Arrow Keys**: Navigate the game board
- **Space/Enter**: Flip selected card  
- **Tab**: Move between controls
- **R**: Reset game
- **P**: Pause/Resume
- **Esc**: Close modals

## 🏗 Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | [Next.js](https://nextjs.org/) | 15.4.3 | React framework with App Router |
| **Runtime** | [React](https://react.dev/) | 19.1.0 | UI library with modern hooks |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | 5+ | Type safety and developer experience |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | 4.0 | Utility-first CSS framework |
| **Testing** | [Jest](https://jestjs.io/) + [RTL](https://testing-library.com/react) | Latest | Unit testing and component testing |
| **Linting** | [ESLint](https://eslint.org/) | 9+ | Code quality and consistency |
| **Deployment** | [GitHub Pages](https://pages.github.com/) | - | Static site hosting |

## 📚 Documentation

Comprehensive documentation is available to help you understand and contribute to the project:

### 📖 User Documentation
- **[User Guide](docs/USER_GUIDE.md)** - Complete gameplay instructions, tips, and strategies
- **[Accessibility Guide](docs/USER_GUIDE.md#accessibility-features)** - Screen reader support, keyboard navigation, and inclusive features

### 🛠 Developer Documentation  
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** - Setup, development workflow, and contribution guidelines
- **[Architecture Overview](docs/ARCHITECTURE.md)** - System design, patterns, and technical decisions
- **[Implementation Guides](docs/implementation-guides/)** - Detailed technical implementation patterns

### 📋 Project Documentation
- **[Project Specifications](specs.md)** - Complete project requirements and specifications
- **[Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)** - Research findings and implementation approach

## 🎨 Project Structure

```
sa-memory-game/
├── app/                    # Next.js App Router
│   ├── components/         # React components
│   │   ├── Card.tsx       # Memory card component  
│   │   └── GameBoard.tsx  # Main game component
│   ├── hooks/             # Custom React hooks
│   │   ├── useGameState.ts # Game state management
│   │   ├── useTimer.ts    # Timer functionality
│   │   └── useLocalStorage.ts # Persistence layer
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utility functions
│   │   ├── emojiData.ts   # Emoji collections
│   │   ├── gameLogic.ts   # Core game algorithms
│   │   └── scoring.ts     # Score calculations
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── docs/                  # Comprehensive documentation
├── public/                # Static assets
├── scripts/               # Build and deployment scripts
└── __tests__/             # Test files
```

## 🚀 Deployment

### GitHub Pages (Current)
The game is automatically deployed to GitHub Pages on every push to main:

1. **Automatic Deployment**: GitHub Actions builds and deploys automatically
2. **Static Export**: Optimized for static hosting
3. **Custom Domain Ready**: Easy to configure custom domains

### Alternative Deployment Options

#### Vercel (Recommended for Next.js)
```bash
npm i -g vercel
vercel --prod
```

#### Netlify
```bash
# Build command: npm run export  
# Publish directory: out/
```

#### Any Static Host
```bash
npm run export
# Upload the 'out/' directory
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test Card.test.tsx
```

### Test Coverage
- **Components**: All React components have comprehensive tests
- **Hooks**: Custom hooks are tested in isolation
- **Utils**: Pure functions have complete test coverage
- **Integration**: Game flow scenarios are tested end-to-end

## 🤝 Contributing

We welcome contributions! Please see our [Developer Guide](docs/DEVELOPER_GUIDE.md) for detailed information on:

- Development setup and workflow
- Code standards and conventions  
- Testing requirements
- Submission guidelines

### Quick Contribution Guide

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with tests
4. **Run quality checks**: `npm run lint && npm run type-check && npm run test`
5. **Commit your changes**: `git commit -m 'feat: add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## 📊 Performance

The game is optimized for excellent performance across all devices:

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 1.5s
- **FID (First Input Delay)**: < 50ms  
- **CLS (Cumulative Layout Shift)**: < 0.1

### Optimization Features
- **Code Splitting**: Dynamic imports for optimal loading
- **Image Optimization**: Efficient emoji rendering
- **Bundle Analysis**: Optimized for minimal JavaScript
- **Memory Management**: Efficient state updates and cleanup

## 🔒 Privacy & Security

- **No Data Collection**: Zero user tracking or analytics
- **Local Storage Only**: All data stays on your device
- **No External Dependencies**: Self-contained application
- **Security Headers**: Comprehensive CSP and security measures

## 📱 Browser Support

### Modern Browsers (Full Support)
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- iOS Safari 14+, Chrome Mobile 90+

### Legacy Browsers (Basic Support)  
- Progressive enhancement ensures basic functionality
- Graceful degradation for older browsers

## 🆘 Support & Troubleshooting

### Getting Help
- **[User Guide](docs/USER_GUIDE.md)** - Gameplay help and FAQ
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)** - Technical documentation
- **[GitHub Issues](https://github.com/a5c-ai/sa-memory-game/issues)** - Bug reports and feature requests
- **[GitHub Discussions](https://github.com/a5c-ai/sa-memory-game/discussions)** - Questions and community support

### Common Issues
- **Game not loading**: Try refreshing or clearing browser cache
- **Slow performance**: Enable "Reduce Motion" in accessibility settings
- **Keyboard navigation**: See accessibility guide for full keyboard controls

## 📄 License

This project is licensed under the [Apache License 2.0](LICENSE). You are free to use, modify, and distribute this software according to the license terms.

## 🙏 Acknowledgments

- **Template**: Based on [Next.js Vercel example template](https://github.com/vercel/vercel/tree/main/examples/nextjs)
- **Icons**: System emoji collections
- **Inspiration**: Classic memory card games

---

<div align="center">

**🎮 [Start Playing Now](https://a5c-ai.github.io/sa-memory-game) 🎮**

*Built with ❤️ using Next.js, React, and TypeScript*

**⭐ Star this repository if you enjoyed the game! ⭐**

</div>