# CLAUDE.md

Guidance for Claude Code (and any AI assistant) working in this repository.

This file is the entry point. It holds the non-negotiable rules and the facts you
need most often. Detailed guidance lives in `docs/rules/` — read the relevant file
when you need depth.

---

## Project Snapshot

A responsive single-page web app for managing Numenera P&P RPG characters.

| Aspect      | Choice                                                              |
| ----------- | ------------------------------------------------------------------- |
| Language    | TypeScript (strict)                                                 |
| Build       | Vite 7                                                              |
| Rendering   | Plain classes with `lit-html` templates (**not** LitElement)        |
| Styling     | Tailwind CSS v4 (`@theme` in `src/styles/main.css`) + component CSS |
| i18n        | i18next (`en` development, `de` production)                         |
| Persistence | IndexedDB primary, localStorage fallback, behind a storage adapter  |
| Unit tests  | Vitest + jsdom + fake-indexeddb                                     |
| E2E tests   | Cucumber (Gherkin) driving Playwright                               |
| CI/CD       | GitHub Actions → GitHub Pages                                       |

Why plain classes instead of LitElement, and other significant decisions:
see `docs/ARCHITECTURE.md`.

---

## Commands

```bash
npm run dev              # dev server on http://localhost:3000
npm run build            # tsc && vite build
npm run preview          # preview production build

npm run test:unit        # Vitest, all unit tests
npm run test:unit:watch  # Vitest watch mode
npm run test:e2e -- tests/e2e/features/some.feature   # one feature file
npm run test:e2e:all     # every feature file
npm run test:e2e:prod    # against the production build (what CI runs)
npm run test:e2e:current # only scenarios tagged @current

npm run lint             # ESLint
npm run format           # Prettier write
npm run check:i18n       # verify every t() key exists in en.json AND de.json
```

**Never invoke `cucumber-js` directly.** The npm scripts start the dev server via
`concurrently`, wait for it with `wait-on`, and tear it down afterwards. Calling
`cucumber-js` yourself runs the suite against nothing and every scenario fails.

---

## Layout

```
src/
├── types/        # TypeScript interfaces & types
├── storage/      # persistence layer (adapters, factory, import/export)
├── services/     # cross-cutting services (auto-save, version history, modals)
├── components/   # UI components, one class per file
│   └── helpers/  # shared component behaviours
├── utils/        # pure utility functions
├── i18n/         # i18next setup + locales/{en,de}.json
├── data/         # mock/default characters
└── styles/       # main.css + components/ + utilities/
tests/
├── unit/         # Vitest specs
└── e2e/
    ├── features/         # Gherkin .feature files
    ├── step-definitions/ # step implementations
    └── support/          # world, hooks, helpers
docs/
├── rules/        # the detailed rules this file points to
├── ARCHITECTURE.md, FEATURES.md, TODO.md, CURRENT_FEATURE.md, ...
```

---

## The 11 Rules

These are the project's standing rules. Rules 2, 3, 6 and 10 describe how the
maintainer wants features built; follow them for feature work unless the user
asks for something different in the moment — an explicit instruction from the
user always wins over this file.

### 1. Present changes for review before committing

Show what changed, why, and the state of the tests. Wait for approval. Skip only
when the user has said to commit without review.
→ `docs/rules/workflow.md`, `docs/rules/git.md`

### 2. BDD first — no feature code without a feature file

Write the `.feature` file in `tests/e2e/features/` first, in Gherkin, describing
user-visible behaviour. Bug fixes get a scenario too.
→ `docs/rules/workflow.md`

### 3. TDD always — Red, Green, Refactor

One failing test, minimal code to pass it, refactor with tests green, repeat.
→ `docs/rules/workflow.md`, `docs/rules/testing.md`

### 4. i18n everything — no hardcoded user-facing text

`import { t } from "../i18n/index.js";` then `${t("your.key")}`. Every key must
exist in **both** `en.json` and `de.json`. The pre-commit hook blocks commits
that violate this. Technical attributes (`class`, `data-testid`, `role`) are not
translated.
→ `docs/rules/i18n.md`

### 5. TypeScript strict — no `any`

Explicit return types on exports. `unknown` plus a type guard when the type is
genuinely unknown. `interface` for object shapes, `type` for unions.
→ `docs/rules/code-quality.md`

### 6. Make the change easy, then make the easy change

Refactor first so the feature becomes trivial, keeping tests green throughout.
→ `docs/rules/workflow.md`

### 7. Conventional commits, non-interactive

`type(scope): subject`. Use one `-m` flag per paragraph — never embed newlines in
a single `-m`. Chain with `&&`, not `;`. Keep messages concise and don't mention
test state.
→ `docs/rules/git.md`

### 8. Commit only working code

Unit tests, E2E tests and the linter all pass first. Husky enforces this.
→ `docs/rules/git.md`

### 9. Responsive across all viewports

Desktop Chrome, Pixel 5, iPhone 12, iPad Pro — configured in
`playwright.config.ts`. Features must work on all of them.
→ `docs/rules/testing.md`

### 10. One test at a time

Never leave several tests failing at once. Each passing test informs the next.
→ `docs/rules/workflow.md`

### 11. Storage through adapters only

Never touch `localStorage` directly from a component. Go through
`src/storage/storageFactory.ts` (`saveCharacterState` / `loadCharacterState` /
`clearCharacterState`), which selects IndexedDB or localStorage at runtime.
→ `docs/rules/architecture.md`

> **Known violation.** `src/components/helpers/CollectionBehavior.ts`,
> `src/components/BasicInfo.ts` and `src/components/RecoveryDamageSection.ts`
> currently import `saveCharacterState` straight from `src/storage/localStorage.ts`,
> bypassing the factory. This writes a second, diverging copy of the character
> that `migrateFromLocalStorage()` later replays over the IndexedDB record. Do not
> copy this pattern; see `docs/IMPLEMENTATION_PLAN.md`.

---

## Decision Tree

```
Starting a task?
├─ Feature file exists?        No → write it first (Rule 2)
├─ Test exists for this?       No → write it first (Rule 3)
├─ Needs refactoring first?    Yes → refactor first (Rule 6)
├─ Adding user-facing text?    Yes → use t() and add both locales (Rule 4)
├─ Several tests failing?      Yes → focus on one (Rule 10)
├─ All tests passing?          No → fix them (Rule 8)
└─ Ready to commit?            → present for review (Rule 1)
```

---

## Gotchas

- **Imports use relative paths with an explicit `.js` extension**
  (`import { t } from "../i18n/index.js"`), even in `.ts` files. The `@/*`
  aliases are configured in both `tsconfig.json` and `vite.config.ts` but no
  source file uses them today. Match the surrounding code: relative + `.js`.
- **Prettier uses semicolons** (`"semi": true`), double quotes, 100-column width,
  2-space indent. Run `npm run format` rather than hand-formatting.
- **Tailwind v4 reads `@theme` in `src/styles/main.css`**, not `tailwind.config.js`
  (there is no `@config` directive). Custom colours must be declared as
  `--color-*` custom properties there.
- **Tailwind class names must be literal.** Constructing them
  (`` `bg-${theme}-100` ``) means the class is never generated in the production
  build. `src/components/helpers/CollectionBehavior.ts` does this today and the
  add-buttons lose their colours in `dist/`.
- **Version history excludes the portrait** — see `src/storage/versionHistory.ts`.
- **Where docs live:** `docs/FEATURES.md` is completed work, `docs/TODO.md` is the
  backlog, `docs/CURRENT_FEATURE.md` is the feature in flight. Move entries
  between them as work progresses; keep them accurate.

---

## Detailed Rules

| Topic                                     | File                         |
| ----------------------------------------- | ---------------------------- |
| BDD/TDD process, refactoring, commits     | `docs/rules/workflow.md`     |
| TypeScript, linting, errors, organisation | `docs/rules/code-quality.md` |
| Translation keys and the pre-commit hook  | `docs/rules/i18n.md`         |
| Commit format, branches, Husky hooks      | `docs/rules/git.md`          |
| Test structure, viewports, mocking        | `docs/rules/testing.md`      |
| Storage, styling, components, data model  | `docs/rules/architecture.md` |
| Numenera game mechanics and validation    | `docs/rules/numenera.md`     |
| Step-by-step responses to 10 situations   | `docs/rules/scenarios.md`    |
| Pitfalls, cheatsheets, troubleshooting    | `docs/rules/reference.md`    |

Project documentation (not rules): `docs/ARCHITECTURE.md`, `docs/FEATURES.md`,
`docs/TODO.md`, `docs/CURRENT_FEATURE.md`, `docs/I18N.md`,
`docs/EVENT_CATALOG.md`, `docs/REFACTORING_LOG.md`.
