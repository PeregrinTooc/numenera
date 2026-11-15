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

1. **`changes` job** (always runs): fingerprints the commit with
   `scripts/change-inputs.js`. The fingerprint leaves out documentation, and
   the deploy fingerprint (`--app`) also leaves out tests and tooling. It then
   looks up two cache markers: `verified-<fingerprint>` (these inputs already
   passed every job) and `deployed-<app fingerprint>` (this app is already
   live). A manual dispatch ignores both and runs everything.
2. **`build-test` job**: lint, format check, `check:i18n`, `check:steps`, unit
   tests and the production build. Runs unless the inputs are verified and the
   app is deployed.
3. **`e2e` jobs**: every device profile in four shards, each running
   `npm run test:e2e:prod`, the same command the local pre-push hook runs.
   Skipped when the inputs are verified.
4. **`record` job**: saves the `verified-` marker once all the above are green.
5. **`deploy` job** (`main` only, never on pull requests): publishes the
   `dist/` build to GitHub Pages and saves the `deployed-` marker. Skipped when
   the app is already deployed, for example after a tests-only change.

So a push of documentation alone runs only the `changes` job, and a revert to
content that already passed reruns nothing. Cache markers expire after seven
days unused, which only costs a rerun.

A pull request runs the full suite, so it's fully validated before merge, but
the `changes` job only sets `deploy` for `refs/heads/main`, so a PR can never
publish to production, even from a fork.

If branch protection ever requires the E2E checks: a skipped matrix job reports
one check with the unexpanded name `E2E (${{ matrix.device }}, …)`, so required
checks naming each device would wait forever on a docs-only PR. Require a
non-matrix job instead.

## Where it's published

The production URL is `https://<username>.github.io/numenera/`. The `/numenera/`
base path comes from `vite.config.ts`'s `base: "/numenera/"` — if this repo is
ever renamed or forked under a different name, update that to match, or the
built assets will 404 in production while still working under `npm run dev`.

## Troubleshooting

- **Deploy job skipped**: check you're on `main` and the event isn't
  `pull_request`, and whether the `changes` job found this app already
  deployed. Run the workflow manually to force a deploy.
- **404s on the deployed site but `npm run build && npm run preview` works
  locally**: almost always a `base` mismatch between `vite.config.ts` and the
  actual GitHub Pages path.
- **Deploy job fails with a permissions error**: confirm Pages is still set to
  **GitHub Actions** as the source (Settings → Pages) — this gets reset if the
  repository is transferred or the setting is changed manually.
