# Design Rules

**Context:** Detail supporting Rule #12 in `CLAUDE.md` (simple design — no
design smells). It defines the six smells, says how a reviewer recognises each
one and what does _not_ count, and holds the review checklist every review runs.

**Exception: None.** Where existing code shows a smell, it is listed in
`docs/RULE_VIOLATIONS.md`; fix it, do not copy it.

---

## Rule #12 — Simple Design, No Design Smells

Code passes its tests, reveals its intention, says each thing once, and has no
element it does not need — in that order of priority. Six smells break this and
are not allowed in new or changed code:

1. Overlong units
2. Duplication (DRY)
3. Speculative code (YAGNI)
4. Gratuitous defensive coding
5. Over-commenting
6. Tests coupled to the implementation

Removing a smell must not change behaviour: the same tests pass before and
after. If removing it would change behaviour, it is a bug or a feature — raise
it, do not fold it into the cleanup.

---

## 1. Overlong Units

A unit — function, method, class, file — does one thing at one level of
abstraction.

**Flag it when:**

- a function or method body runs past roughly 30 lines (lit-html templates
  count), or mixes levels — orchestration next to DOM, storage or string detail;
- a function needs section comments ("// load", "// migrate", "// render") to be
  readable — each section is a function waiting to be extracted;
- a class carries several clusters of state that change for different reasons;
- a file passes 300 lines (`code-quality.md`).

The line counts are tripwires, not targets: a 25-line function that does three
things is still overlong. Fix with Extract Function, Extract Class, Split Phase.

## 2. Duplication (DRY)

Every piece of knowledge — a rule, a field list, a template, an event's shape —
lives in one place.

**Flag it when** the same logic, mapping, boilerplate or template appears a
second time, so that one change would have to be made in several places. Typical
cases here: the same `CustomEvent` dispatch in several components, the same
IndexedDB request-to-promise wrapper in several stores, the same field list in
the diff, change-detection and description code.

**Not the smell:** code that looks alike by accident and would not change
together. Two lines that happen to match are not knowledge. Tailwind classes
must stay literal (`CLAUDE.md` Gotchas) — parameterise structure, not class
names. Fix with Extract Function, Parameterize Function, Combine Functions into
Class, Pull Up Method.

## 3. Speculative Code (YAGNI)

Build what a current feature or test needs, nothing more.

**Flag it when:**

- an export, method, parameter, option, type, event or branch has no caller in
  `src/` (used only by tests counts as no caller);
- a parameter or option is always passed the same value;
- an interface or abstraction has exactly one implementation and no second one
  is planned in `docs/TODO.md`;
- code is kept "for later" or "just in case".

Weigh this one carefully. **Not the smell:** an interface that marks an
identified architectural boundary — for example the persistence layer behind
`src/storage/storageFactory.ts`, which would be abstracted even with a single
storage backend, the system clock (timers and the current time), which tests
must be able to control without patching the browser, or the E2E suite's DSL ↔
protocol driver split (`SheetDriver`, `SectionInput`). Once a boundary has been
identified, it needs a clear interface, even while only one implementation
exists. The smell is an interface _inside_ a layer that no boundary calls for.

Fix with Remove Dead Code, Inline Function, Inline Class, Remove Flag Argument,
Collapse Hierarchy. Git keeps the history; the code does not need to.

## 4. Gratuitous Defensive Coding

Check at the boundaries. Inside them, trust the contract.

**Flag it when** code guards against a state that its types or callers already
rule out: `?.`, `??`, `if (!x)`, `typeof` checks, `try/catch` or fallbacks on a
value that strict TypeScript says is present, that the only caller always
passes, or that an internal invariant guarantees. A reviewer asks: _which
contract says this can happen?_ If none is in evidence, the check goes.

**Not the smell — real boundaries keep their checks:**

- parsing anything from outside: imported files, stored JSON, `postMessage` /
  `BroadcastChannel` payloads, URL parameters;
- IndexedDB, localStorage and file-system calls, which can fail at any time;
- DOM queries that can genuinely miss, and user input;
- an invariant worth asserting loudly — make it an assertion that throws
  (Introduce Assertion), not a silent fallback that hides the bug.

## 5. Over-Commenting

A comment explains _why_ — a design choice, a constraint, a trap. The code says
_what_.

**Flag:**

- comments that restate the code, including JSDoc that repeats the name and
  signature (`@param name - the name`);
- comments about what the code does _not_ do or does not have
  ("no validation here", "we don't support X yet");
- history: "previously", "now", "used to", "changed to", "moved from",
  "fix for …", "was a bug" — that belongs in the commit message;
- banner and section-divider comments inside a unit (see smell 1).

**Keep:** the reason for a non-obvious choice, an ordering or race constraint, a
browser quirk, a log-and-continue justification (`code-quality.md`), a link to a
spec. If a comment is needed to say what a block does, extract the block into a
function whose name says it instead.

## 6. Tests Coupled to the Implementation

Tests describe behaviour through the unit's public surface, so a
behaviour-preserving refactoring never breaks them.

**Flag it when a test:**

- `vi.mock`s, `vi.spyOn`s or stubs a collaborator inside the same architectural
  boundary — another component, a helper of the same component, an in-process
  service, a pure util, `@/i18n`, the storage adapters (fake-indexeddb is loaded
  for every unit test in `tests/unit/setup.ts`, so use the real adapter);
- asserts _that_ or _how often_ an internal method was called, with which
  arguments or in which order, instead of the result: rendered DOM, return
  value, persisted state read back through the real adapter, emitted DOM event;
- reaches private state through `as unknown as { … }` casts, or replaces private
  members;
- asserts a CSS class that is styling, not behaviour, when a `data-testid`,
  role or text would do.

**Not the smell — real boundaries may be faked:**

- browser features jsdom lacks or cannot drive: layout (`getBoundingClientRect`,
  `elementFromPoint`), the Web Animations API, `matchMedia`, file pickers,
  downloads, `BroadcastChannel`;
- failures that cannot be produced for real, induced at the platform boundary
  (e.g. an aborting `IDBDatabase.prototype.transaction`), not by patching
  private members;
- time (fake timers) and `console` in logger tests;
- callbacks passed to the unit's constructor or public method — they are its
  output contract, so asserting on them is asserting behaviour.

---

## Review Checklist

Every review runs this checklist against the **change** — the Rule #1
presentation before a commit, `/code-review`, a reviewer subagent, the
`tdd-wrapup` and `refactor` passes. The review reports the result, including
"none found".

```
□ Overlong units — no new or grown function/method past ~30 lines or mixing
  levels; no class with a second responsibility; no file past 300 lines
□ DRY — no logic, mapping, template or boilerplate that already exists elsewhere
□ YAGNI — every new export, parameter, option, branch and type has a caller in src/
□ Defensive coding — every new guard, fallback and try/catch is at a boundary or
  backed by a contract the reviewer can point to
□ Comments — no new comment that restates code, describes an absent feature or
  narrates history
□ Tests — no new mock, spy or private-state access inside one architectural
  boundary; assertions are on observable behaviour
```

A change that re-introduces a smell is not ready to commit. A change that
touches code with an existing smell does not have to clean it up, but must not
copy the pattern or make it worse; if it grows a listed violation, say so.

---

## Related Rules

- **Code Quality:** `code-quality.md` — file size, error handling, comments
- **Testing:** `testing.md` — mocking boundaries, test quality checklist
- **Workflow:** `workflow.md` — Rule #1 review, Rule #6 refactor first
