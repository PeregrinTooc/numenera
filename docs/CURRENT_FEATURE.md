# CURRENT FEATURE: PWA Support

## Overview

Make the character sheet installable and usable without a connection.
Character data already lives in IndexedDB, so the work is caching the app shell
and handling updates. Newer versions are offered with a prompt rather than
installed silently, so open tabs never mix old and new code.

`vite-plugin-pwa` generates the manifest and a precaching Workbox service
worker from the production build. Service workers only run there, so the
scenarios are tagged `@prod-only` and run under `test:e2e:prod`.

## E2E Tests

File: `tests/e2e/features/pwa-support.feature`

- [x] The character sheet can be installed as an app
- [x] The character sheet opens without a connection
- [ ] Changes made without a connection are kept
- [ ] I am offered a newer version of the character sheet (needs i18n keys for the prompt)

## Open points

- `public/icon.svg` and the PNGs rendered from it are a placeholder icon.
