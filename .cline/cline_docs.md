# Numenera Character Sheet - Development Guide

## Project Overview

This is a responsive web application for managing Numenera P&P RPG characters. It's built with TypeScript, Vite, and Tailwind CSS following BDD/TDD principles.

## Architecture Principles

### Development Workflow

1. **BDD First**: Every feature starts with a `.feature` file in `tests/e2e/features/`
2. **TDD Implementation**: Write unit tests before implementation
3. **One Test at a Time**: Write one test, make it pass, refactor, repeat
4. **Commit Early, Commit Often**: Every working feature is committed
5. **Quality Gates**: Husky enforces formatting and tests before commit/push

### Code Organization

```
src/
├── types/          # TypeScript type definitions
├── storage/        # Data persistence layer
├── i18n/           # Internationalization
├── components/     # UI components (future)
├── utils/          # Utility functions
└── styles/         # Global styles
```

### Testing Strategy

- **Unit Tests**: `tests/unit/` - Test individual functions and classes
- **E2E Tests**: `tests/e2e/` - Test complete user flows with Playwright
- **Mobile/Tablet**: All E2E tests run on desktop, mobile, and tablet viewports

## Numenera Game Concepts

### Character Structure

- **Tier**: Character level (1-6)
- **Type**: Glaive (warrior), Nano (mage), Jack (rogue)
- **Descriptor**: Adjective describing character (Strong, Graceful, etc.)
- **Focus**: Special ability ("Bears a Halo of Fire", etc.)

### Stats (Pools)

Three main stats, each with:

- **Pool**: Maximum points
- **Edge**: Reduction to effort costs
- **Current**: Current available points

Stats are: Might, Speed, Intellect

### Items

- **Cyphers**: One-use items (limited to 2-3 per character)
- **Artifacts**: Permanent items with depletion
- **Oddities**: Curiosities with no game effect

## Development Guidelines

### TypeScript

- Use strict mode
- Define interfaces for all data structures
- Use path aliases (@/ for src/)
- Avoid `any` types

### Styling

- **Mobile-first**: Start with mobile layout, add responsive breakpoints
- **Touch targets**: Minimum 44x44px for interactive elements
- **Tailwind**: Use utility classes, avoid custom CSS when possible
- **Theme colors**: Use `numenera-primary`, `numenera-secondary`, `numenera-accent`

### i18n

- All user-facing text through translation keys
- English (`en`) for development
- German (`de`) for production
- Use `t("key.path")` function for translations

### State Management

- Currently: Simple class-based approach with localStorage
- Future: May need state management library for complex features

### Storage

- **Phase 1**: localStorage only
- **Phase 2**: Cloud storage adapters (OneDrive, Google Drive, Dropbox)
- **Interface**: Storage adapter pattern for easy extension

## Testing Guidelines

### Writing BDD Tests

```gherkin
Feature: Feature name
    As a user type
    I want to do something
    So that I achieve a goal

    Scenario: Specific use case
        Given initial state
        When action occurs
        And another action
        Then expected outcome
        And another outcome
```

### Writing Unit Tests

```typescript
describe("ClassName", () => {
  describe("methodName", () => {
    it("should do something specific", () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Running Tests

```bash
npm run test:unit          # Run unit tests
npm run test:unit:watch    # Watch mode
npm run test:e2e           # Run E2E tests
npm run test:e2e:ui        # E2E with UI
```

## Common Tasks

### Adding a New Feature

1. Update `FEATURES.md` with feature description
2. Write BDD feature file in `tests/e2e/features/`
3. Write failing unit tests
4. Implement feature
5. Make tests pass
6. Refactor
7. Update `FEATURES.md` to mark as implemented
8. Commit with descriptive message

### Adding Translations

1. Add keys to `src/i18n/locales/en.json`
2. Add translations to `src/i18n/locales/de.json`
3. Use `t("your.key")` in code

### Responsive Design

- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Test on multiple viewport sizes
- Consider touch vs mouse interactions

## Git Workflow

### Commit Messages

- Use conventional commits format
- Examples:
  - `feat: add character image upload`
  - `fix: correct tier validation`
  - `test: add storage adapter tests`
  - `docs: update README`
  - `chore: configure prettier`

### Branches

- `main`: Production-ready code
- Feature branches: `feature/description`
- Bugfix branches: `fix/description`

## Known Issues and Limitations

### Current Limitations

- Single character only (multiple coming in Phase 2)
- No image upload yet (coming soon)
- No cloud sync (Phase 4)
- Desktop-optimized (mobile optimization in progress)

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features required
- localStorage required

## Future Considerations

### Performance

- Consider virtual scrolling for large lists
- Lazy load images
- Code splitting for large features

### Accessibility

- ARIA labels for screen readers
- Keyboard navigation
- High contrast mode support

### PWA

- Service worker for offline support
- App manifest for install prompt
- Local caching strategy

## Resources

- [Numenera Rules](https://www.montecookgames.com/store/product/numenera-discovery/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
