# Implementation Plan — Rules Documentation Restructure

`CLAUDE.md` plus `docs/rules/*.md` total ~4,160 lines for a ruleset
`CLAUDE.md` itself summarizes in ~230. A full read of all 9 rule files plus
`docs/RULE_VIOLATIONS.md` found three distinct problems, not just verbosity:

1. **Duplication.** The same content restated near-verbatim 2-5x across
   files — e.g. the commit `-m` flag formatting rule appears in full in
   `CLAUDE.md`, three separate sections of `git.md` itself, `reference.md`,
   and `scenarios.md`.
2. **Contradictions** between files, which is actively dangerous since an
   agent reading only one file gets wrong guidance:
   - `architecture.md` says Character "has no `id` and no `lastModified`",
     then 40 lines later its own example returns `{ id: generateId(), ... }`.
   - `architecture.md` hardcodes Tailwind theme colors as prose, even though
     `RULE_VIOLATIONS.md`'s "Fixed" table records two past incidents
     (`xs: 480px`, `--font-handwritten`) caused by exactly this pattern —
     restating `@theme` config as prose instead of pointing at it.
   - `architecture.md`'s "Future Architecture Considerations" and
     `numenera.md`'s "Feature Roadmap Context" both restate a product
     roadmap and disagree with each other on phase numbering — neither
     should exist since `docs/TODO.md` owns the backlog.
   - `architecture.md`'s "Known Violation" callout describes a storage
     bypass bug that `RULE_VIOLATIONS.md`'s "Fixed" table shows was already
     fixed (routed through `persistCharacterState()`) — the callout is
     stale and tells a future reader a live bug exists where none does.
3. **Non-rule content dressed as rules.** Every rule file ends with a banner
   like "_These rules are ABSOLUTE and NON-NEGOTIABLE_" even though most
   files are 60-70% examples, troubleshooting, tool tutorials, and roadmap
   notes. Individual files also declare their own "Rule"/"MANDATORY" items
   outside the 11 numbered in `CLAUDE.md`, so "the 11 rules" isn't actually a
   complete accounting of what's asserted as non-negotiable.

**Guiding principle:** single source of truth per fact. `CLAUDE.md`'s
per-rule paragraph already states requirements/why/exception — detail files
must not re-derive that; they should add only what `CLAUDE.md` doesn't
already say (codebase-specific examples, edge cases, hard-won
troubleshooting, domain nuance). Only the 11 numbered rules keep
"ABSOLUTE/NON-NEGOTIABLE" framing; other file-level content gets a plain
heading instead.

---

## Per-file changes

- **`CLAUDE.md`** — drop the `scenarios.md`/`reference.md` rows from the
  Detailed Rules table once those files are deleted; otherwise unchanged.
- **`workflow.md`** (279 → ~150 lines) — trim Rules #1/#2/#3/#6/#10 to what
  isn't already in `CLAUDE.md`. Keep one canonical Red-Green-Refactor
  `StatPool` example (other files point to it instead of repeating it).
  Drop the "Quick Decision Tree" (duplicate of `CLAUDE.md`'s). Migrate the
  one useful paragraph from `scenarios.md` Scenario 10 (when
  `AskUserQuestion` is warranted) in here before that file is deleted.
- **`testing.md`** (688 → ~350 lines) — remove the duplicate RGR example and
  duplicate Test Quality Checklist (testing.md keeps the canonical
  checklist; `code-quality.md` points to it). Remove the "Running Tests"
  command list already in `CLAUDE.md`. De-escalate "ALWAYS Use NPM Scripts
  for E2E Tests" and "Test New Features in Isolation First" from
  Rule/MANDATORY banners to plain subsections — keep the content, drop the
  framing. Keep the hard-won "Debugging Tests" flake knowledge (Vite
  dev-server reload race, async render race) verbatim.
- **`code-quality.md`** (349 → ~200 lines) — keep the TS-strict/`any` rule
  and the import-alias table as canonical. Remove the duplicate directory
  tree, duplicate Performance Considerations (canonical copy moves to
  `architecture.md`), and duplicate Testing Quality checklist. Merge "Code
  Review Checklist" into `git.md`'s pre-commit checklist (near-duplicates).
- **`git.md`** (447 → ~250 lines) — the "multiple `-m` flags, never embed
  newlines" rule appears in full three times within this one file;
  consolidate to one and delete the "For AI Development" section (a fourth
  restatement). Keep conventional-commit types/examples, branch strategy,
  Husky hooks, troubleshooting. House the canonical pre-commit checklist
  here (merged from `code-quality.md`).
- **`i18n.md`** (412 → ~300 lines) — least duplicated file; fix code
  examples to import via `@/` alias instead of relative paths, consistent
  with Rule #5. Trim Troubleshooting to what's i18n-specific.
- **`architecture.md`** (528 → ~300 lines) — remove the stale "Known
  Violation" callout; replace hardcoded Tailwind colors with a pointer to
  the `@theme` block in `src/styles/main.css` (matching how breakpoints
  already do this correctly); remove "Future Architecture Considerations";
  cut the generic "API Design Principles" example that introduced the stale
  `id: generateId()` field, keeping the Data Model section's correct "no
  `id` field" statement; merge "Mobile-First Design" and "Styling with
  Tailwind CSS" into one section; remove the duplicate directory tree and
  Performance Considerations (canonical copy lives here now). Keep the
  storage-adapter layers (Rule #11 core) and the lit-html-not-LitElement
  Component Architecture pattern.
- **`numenera.md`** (460 → ~300 lines) — keep core domain knowledge
  (stats/pools/edge, items, recovery/damage, validation) and the "Data Model
  Considerations" divergence notes. Remove "Feature Roadmap Context"
  (conflicts with `architecture.md`'s version; belongs in `TODO.md` only)
  and "Common Scenarios" (restates mechanics already explained earlier in
  the same file).
- **`reference.md`** — **delete.** Every section duplicates a
  better-maintained original elsewhere (pitfalls mirror the rules,
  cheatsheets duplicate owning files, troubleshooting duplicates
  `git.md`/`i18n.md`, decision trees duplicate `CLAUDE.md`'s); its "Tool
  Selection Guide" teaches baseline Claude Code tool usage that needs no
  project-specific documentation. Its file-reference-map table is already
  covered by `CLAUDE.md`'s Detailed Rules table.
- **`scenarios.md`** — **delete.** Its 10 "scenarios" are generic playbooks
  chaining together rules stated precisely elsewhere; Scenario 7 instructs
  using a `replace_in_file` tool call, which is not a Claude Code tool —
  leftover phrasing from a different AI assistant's ruleset, never adapted.
  Migrate Scenario 10's `AskUserQuestion` guidance into `workflow.md` first.
- **`RULE_VIOLATIONS.md`** — unchanged; already well-scoped, and the stale
  facts above are being fixed in place rather than logged as new entries.

---

## Expected outcome

~4,160 lines → roughly ~2,200 across 7 files instead of 9 (`reference.md`
and `scenarios.md` deleted), zero known cross-file contradictions, and a
clear line between "one of the 11 absolute rules" and "useful project
context."

---

## Verification

- `npm run check:i18n` still passes after `i18n.md` edits (docs-only change,
  but confirms no accidental drift).
- Grep the repo for `scenarios.md` and `reference.md` after deletion —
  should only have appeared in `CLAUDE.md`'s own table beforehand.
- Diff each rewritten file's retained rule statements against `CLAUDE.md`'s
  11-rule summaries to confirm no rule's meaning changed, only its
  supporting detail was trimmed/deduplicated.
- Re-read `CLAUDE.md` + all `docs/rules/*.md` end-to-end after editing to
  confirm every `See X.md` cross-reference still points at content that
  exists and says what it claims to.
