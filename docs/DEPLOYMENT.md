# Deployment

The app deploys to GitHub Pages automatically via
`.github/workflows/deploy.yml`. This is the one-time setup needed before the
first deploy will work.

## First-time setup

1. In the repository, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.

That's it — no other configuration is needed. The workflow already requests
the `pages: write` / `id-token: write` permissions it needs, scoped to the
`deploy` job only.

## What happens on every push

`deploy.yml` runs on push to `main`, on pull requests, and on manual dispatch:

1. **`build-test` job** (always runs): install deps, lint, format check,
   `check:i18n`, unit tests, then `npm run test:e2e:prod` — which builds the
   production bundle and runs the full E2E suite against it. This is the same
   command the local pre-push hook runs.
2. **`deploy` job** (`main` only, never on pull requests): publishes the
   `dist/` build produced above to GitHub Pages.

A pull request runs the full `build-test` job — so it's fully validated
before merge — but the `deploy` job's `if` condition
(`github.ref == 'refs/heads/main'`) means a PR can never publish to
production, even from a fork.

## Where it's published

The production URL is `https://<username>.github.io/numenera/`. The `/numenera/`
base path comes from `vite.config.ts`'s `base: "/numenera/"` — if this repo is
ever renamed or forked under a different name, update that to match, or the
built assets will 404 in production while still working under `npm run dev`.

## Troubleshooting

- **Deploy job skipped**: check you're on `main` and the event isn't
  `pull_request` — see the `deploy` job's `if` condition above.
- **404s on the deployed site but `npm run build && npm run preview` works
  locally**: almost always a `base` mismatch between `vite.config.ts` and the
  actual GitHub Pages path.
- **Deploy job fails with a permissions error**: confirm Pages is still set to
  **GitHub Actions** as the source (Settings → Pages) — this gets reset if the
  repository is transferred or the setting is changed manually.
