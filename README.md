# Numenera Character Sheet

A responsive web application for managing Numenera P&P RPG characters with cloud sync capabilities.

## Features

- 📱 **Responsive Design**: Optimized for desktop, tablet, and smartphone
- 🌍 **Internationalization**: English (development) and German (production) support
- 💾 **Local Storage**: Persist character data in browser
- ☁️ **Cloud Sync** (Coming Soon): OneDrive, Google Drive, Dropbox, iCloud support
- 🧪 **BDD/TDD**: Comprehensive test coverage with Vitest and Playwright
- 🎨 **Modern Stack**: TypeScript, Vite, Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

### Development

```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test:unit        # Run unit tests
npm run test:unit:watch  # Run unit tests in watch mode
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests with UI

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

## Project Structure

```
numenera/
├── src/
│   ├── types/           # TypeScript type definitions
│   ├── storage/         # Data persistence layer
│   ├── i18n/            # Internationalization
│   ├── components/      # UI components
│   └── styles/          # Global styles
├── tests/
│   ├── unit/            # Unit tests
│   └── e2e/             # End-to-end tests
├── .github/
│   └── workflows/       # GitHub Actions CI/CD
└── docs/                # Documentation
```

## Development Workflow

This project follows BDD/TDD principles:

1. **Write a feature file** describing the desired behavior
2. **Write failing unit tests** for the implementation
3. **Implement the feature** to make tests pass
4. **Refactor** while keeping tests green
5. **Commit** the working feature

See [docs/FEATURES.md](docs/FEATURES.md) for the feature roadmap and [.cline/cline_docs.md](.cline/cline_docs.md) for detailed development guidelines.

## Git Hooks

Husky enforces code quality:

- **Pre-commit**: Runs linter, formatter, and unit tests
- **Pre-push**: Runs E2E tests

## Deployment

The app is automatically deployed to GitHub Pages on push to `main`.

**⚠️ First Time Setup Required**: GitHub Pages must be enabled manually in repository settings.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete setup instructions.

Once configured, every push to `main`:

1. Runs tests in CI
2. Creates production build
3. Deploys to https://[username].github.io/numenera/

## Technology Stack

- **Framework**: TypeScript + Vite
- **Styling**: Tailwind CSS
- **Testing**: Vitest (unit) + Playwright (E2E) + Cucumber (BDD)
- **i18n**: i18next
- **Storage**: localStorage (cloud adapters planned)
- **CI/CD**: GitHub Actions
- **Hosting**: GitHub Pages

## Contributing

1. Check [docs/FEATURES.md](docs/FEATURES.md) for planned features
2. Create a feature branch
3. Write tests first (BDD/TDD)
4. Implement the feature
5. Ensure all tests pass
6. Submit a pull request

## License

ISC

## Resources

- [Numenera RPG](https://www.montecookgames.com/store/product/numenera-discovery/)
- [Development Guide](.cline/cline_docs.md)
- [Feature Roadmap](docs/FEATURES.md)
