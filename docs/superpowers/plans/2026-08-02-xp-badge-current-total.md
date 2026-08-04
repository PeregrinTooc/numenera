# XP Badge Current/Total Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single `Character.xp` number with two independently-tracked values — `currentXp` (unspent) and `totalXp` (lifetime earned, including spent) — and show both on the XP badge, each independently editable.

**Architecture:** Mirrors the existing `StatPool` pattern (Might/Speed/Intellect's Pool/Edge/Current): two flat `Character` fields, two new `FieldType` entries reusing the existing single-value `EditFieldModal`, and a badge with two independently-clickable cells instead of one. `sanitizeCharacter` gains a fallback so legacy data (and legacy version-history snapshots) with only `xp` populates both new fields with that value.

**Tech Stack:** TypeScript (strict), lit-html templates, Vitest + jsdom, Cucumber + Playwright.

## Global Constraints

- TypeScript strict, no `any`, explicit return types on exports (CLAUDE.md Rule 5).
- Every new user-facing string (including new aria-labels) goes through `t()` with keys in **both** `src/i18n/locales/en.json` and `de.json` (Rule 4).
- BDD first: Gherkin scenarios describing the new behavior exist before/alongside the UI change (Rule 2).
- TDD: write/update the failing test before the implementation change, in every task (Rule 3).
- One task = one commit; run `npm run test:unit` (and `npm run check:i18n` where i18n keys changed) before each commit — these are what the pre-commit hook enforces (Rule 8). `tests/` is excluded from `tsc` (see `tsconfig.json` `exclude`) and from ESLint's type-aware rules are not enabled, so test fixtures don't gate `npm run build`; but keep them accurate anyway per Task 7/9.
- `npm run build` (full `tsc` + Vite) and `npm run test:e2e:prod` only run at `git push` (pre-push hook) — run them yourself before the final push regardless, per the verification task at the end.
- No XP-spending mechanic, no cross-field validation between `currentXp`/`totalXp` (out of scope — see the approved spec at `docs/superpowers/specs/2026-08-02-xp-badge-current-total-design.md`).

---

### Task 1: Data model, validation, defaults, and legacy migration

**Files:**

- Modify: `src/types/character.ts:67`
- Modify: `src/utils/unified-validation.ts` (FieldType union, FIELD_CONFIGS, validateCharacter, CHARACTER_DEFAULTS, sanitizeCharacter + new helper)
- Modify: `src/data/mockCharacters.ts:11`, `src/data/mockCharacters.ts:154`
- Modify: `tests/unit/characterValidation.test.ts`
- Modify: `tests/unit/fieldValidation.test.ts`

**Interfaces:**

- Produces: `Character.currentXp: number`, `Character.totalXp: number` (replacing `Character.xp`) — every later task reads/writes these two fields.
- Produces: `FieldType` gains `"currentXp" | "totalXp"`, loses `"xp"` — Task 2, 4, 5, 6 depend on this.
- Produces: `CHARACTER_DEFAULTS.currentXp === 0`, `CHARACTER_DEFAULTS.totalXp === 0`.
- Produces: `sanitizeCharacter(data).character.currentXp` / `.totalXp` — falls back to a legacy `data.xp` when the new fields are absent; used directly by Task 6.

- [ ] **Step 1: Update the failing/new tests in `characterValidation.test.ts` first**

Replace every `xp: N` fixture key with `currentXp: N, totalXp: N` (same value for both, since these fixtures predate the split and aren't specifically testing migration):

At `tests/unit/characterValidation.test.ts:18` (inside `validCharacter`):

```ts
        xp: 10,
```

becomes

```ts
        currentXp: 10,
        totalXp: 10,
```

At `tests/unit/characterValidation.test.ts:151` (inside `minimalChar`):

```ts
        xp: 0,
```

becomes

```ts
        currentXp: 0,
        totalXp: 0,
```

At `tests/unit/characterValidation.test.ts:625` (inside the "complete valid character" `validCharacter`):

```ts
          xp: 10,
```

becomes

```ts
          currentXp: 10,
          totalXp: 10,
```

Replace the NaN-handling test at `tests/unit/characterValidation.test.ts:282-291`:

```ts
it("should handle NaN values", () => {
  const input = {
    xp: NaN,
  };

  const result = sanitizeCharacter(input);

  expect(result.character.xp).toBe(CHARACTER_DEFAULTS.xp);
  expect(result.warnings).toContainEqual(expect.stringContaining("xp"));
});
```

with

```ts
it("should handle NaN values", () => {
  const input = {
    currentXp: NaN,
    totalXp: NaN,
  };

  const result = sanitizeCharacter(input);

  expect(result.character.currentXp).toBe(CHARACTER_DEFAULTS.currentXp);
  expect(result.character.totalXp).toBe(CHARACTER_DEFAULTS.totalXp);
  expect(result.warnings).toContainEqual(expect.stringContaining("currentXp"));
  expect(result.warnings).toContainEqual(expect.stringContaining("totalXp"));
});
```

Add a new `describe` block directly after that test (still inside the outer `describe("sanitizeCharacter", ...)`, as a sibling of the `describe("number bounds", ...)` block that starts at line 294):

```ts
describe("legacy xp migration", () => {
  it("should populate both currentXp and totalXp from a legacy single xp value", () => {
    const input = { xp: 12 };

    const result = sanitizeCharacter(input);

    expect(result.character.currentXp).toBe(12);
    expect(result.character.totalXp).toBe(12);
  });

  it("should prefer currentXp/totalXp over a legacy xp value when both are present", () => {
    const input = { xp: 12, currentXp: 3, totalXp: 20 };

    const result = sanitizeCharacter(input);

    expect(result.character.currentXp).toBe(3);
    expect(result.character.totalXp).toBe(20);
  });

  it("should default to 0 when neither legacy xp nor the new fields are present", () => {
    const result = sanitizeCharacter({});

    expect(result.character.currentXp).toBe(0);
    expect(result.character.totalXp).toBe(0);
  });
});
```

In `tests/unit/fieldValidation.test.ts`, replace the config test at lines 49-56:

```ts
it("should have configuration for xp field", () => {
  expect(FIELD_CONFIGS.xp).toEqual({
    inputType: "number",
    inputMode: "numeric",
    min: 0,
    max: 9999,
  });
});
```

with

```ts
it("should have configuration for currentXp field", () => {
  expect(FIELD_CONFIGS.currentXp).toEqual({
    inputType: "number",
    inputMode: "numeric",
    min: 0,
    max: 9999,
  });
});

it("should have configuration for totalXp field", () => {
  expect(FIELD_CONFIGS.totalXp).toEqual({
    inputType: "number",
    inputMode: "numeric",
    min: 0,
    max: 9999,
  });
});
```

Replace the `validateField("xp", ...)` block at lines 187-210 (rename the representative field to `"currentXp"` — both fields share the same config, so one representative is consistent with how the file already treats `mightPool`/`speedEdge`/etc.):

```ts
it("should accept valid xp value", () => {
  const result = validateField("xp", "100");
  expect(result.valid).toBe(true);
});

it("should accept xp at minimum (0)", () => {
  const result = validateField("xp", "0");
  expect(result.valid).toBe(true);
});

it("should accept xp at maximum (9999)", () => {
  const result = validateField("xp", "9999");
  expect(result.valid).toBe(true);
});

it("should reject negative xp", () => {
  const result = validateField("xp", "-1");
  expect(result.valid).toBe(false);
});

it("should reject xp above maximum", () => {
  const result = validateField("xp", "10000");
  expect(result.valid).toBe(false);
});
```

becomes

```ts
it("should accept valid currentXp value", () => {
  const result = validateField("currentXp", "100");
  expect(result.valid).toBe(true);
});

it("should accept currentXp at minimum (0)", () => {
  const result = validateField("currentXp", "0");
  expect(result.valid).toBe(true);
});

it("should accept currentXp at maximum (9999)", () => {
  const result = validateField("currentXp", "9999");
  expect(result.valid).toBe(true);
});

it("should reject negative currentXp", () => {
  const result = validateField("currentXp", "-1");
  expect(result.valid).toBe(false);
});

it("should reject currentXp above maximum", () => {
  const result = validateField("currentXp", "10000");
  expect(result.valid).toBe(false);
});
```

Replace the remaining single-token references, each `"xp"` → `"currentXp"`:

- Line 305: `expect(getInputType("xp")).toBe("number");` → `expect(getInputType("currentXp")).toBe("number");`
- Line 320: `expect(getInputMode("xp")).toBe("numeric");` → `expect(getInputMode("currentXp")).toBe("numeric");`
- Lines 337-338:

  ```ts
  it("should return correct minimum for xp (0)", () => {
    expect(getMinValue("xp")).toBe(0);
  });
  ```

  becomes

  ```ts
  it("should return correct minimum for currentXp (0)", () => {
    expect(getMinValue("currentXp")).toBe(0);
  });
  ```

- Lines 363-364:

  ```ts
  it("should return correct maximum for xp (9999)", () => {
    expect(getMaxValue("xp")).toBe(9999);
  });
  ```

  becomes

  ```ts
  it("should return correct maximum for currentXp (9999)", () => {
    expect(getMaxValue("currentXp")).toBe(9999);
  });
  ```

- Line 401: `expect(getMaxLength("xp")).toBeUndefined();` → `expect(getMaxLength("currentXp")).toBeUndefined();`
- Line 417: `expect(isNumericField("xp")).toBe(true);` → `expect(isNumericField("currentXp")).toBe(true);`

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run test:unit -- tests/unit/characterValidation.test.ts tests/unit/fieldValidation.test.ts`
Expected: FAIL — `FIELD_CONFIGS.currentXp`/`.totalXp` are `undefined`, `Character` still only has `xp`, `sanitizeCharacter` doesn't know about `currentXp`/`totalXp` yet.

- [ ] **Step 3: Update `src/types/character.ts`**

At `src/types/character.ts:67`, replace:

```ts
xp: number;
```

with

```ts
currentXp: number;
totalXp: number;
```

- [ ] **Step 4: Update `src/utils/unified-validation.ts`**

Replace the `FieldType` union (lines 34-53), changing only the `xp` line:

```ts
export type FieldType = "name" | "tier" | "descriptor" | "focus" | "xp" | "shins";
```

becomes

```ts
export type FieldType =
  | "name"
  | "tier"
  | "descriptor"
  | "focus"
  | "currentXp"
  | "totalXp"
  | "shins";
```

Replace the `FIELD_CONFIGS` entry at line 136:

```ts
  xp: { inputType: "number", inputMode: "numeric", min: 0, max: 9999 },
```

with

```ts
  currentXp: { inputType: "number", inputMode: "numeric", min: 0, max: 9999 },
  totalXp: { inputType: "number", inputMode: "numeric", min: 0, max: 9999 },
```

Replace the required-field check in `validateCharacter` at lines 311-315:

```ts
if (data.xp === undefined) {
  errors.push("Missing required field: xp");
} else if (typeof data.xp !== "number") {
  errors.push("Field 'xp' must be a number");
}
```

with

```ts
if (data.currentXp === undefined) {
  errors.push("Missing required field: currentXp");
} else if (typeof data.currentXp !== "number") {
  errors.push("Field 'currentXp' must be a number");
}

if (data.totalXp === undefined) {
  errors.push("Missing required field: totalXp");
} else if (typeof data.totalXp !== "number") {
  errors.push("Field 'totalXp' must be a number");
}
```

Replace the `CHARACTER_DEFAULTS` entry at line 512:

```ts
  xp: 0,
```

with

```ts
  currentXp: 0,
  totalXp: 0,
```

Replace the `sanitizeCharacter` field construction at line 579:

```ts
    xp: sanitizeNumber(input, "xp", CHARACTER_DEFAULTS.xp, warnings, 0),
```

with

```ts
    currentXp: sanitizeXpField(input, "currentXp", warnings),
    totalXp: sanitizeXpField(input, "totalXp", warnings),
```

Add the new `sanitizeXpField` helper directly after the `sanitizeNumber` function (after line 653, before `sanitizeStats`):

```ts
/**
 * Sanitizes an XP field (currentXp or totalXp), falling back to a legacy
 * single `xp` value when the new field is absent — lets old saves/exports
 * with only `xp` populate both new fields with that value.
 */
function sanitizeXpField(
  input: Record<string, unknown>,
  field: "currentXp" | "totalXp",
  warnings: string[]
): number {
  if (input[field] !== undefined) {
    return sanitizeNumber(input, field, CHARACTER_DEFAULTS[field], warnings, 0);
  }
  if (input.xp !== undefined) {
    return sanitizeNumber(input, "xp", CHARACTER_DEFAULTS[field], warnings, 0);
  }
  warnings.push(t("validation.sanitize.missingField", { field }));
  return CHARACTER_DEFAULTS[field];
}
```

- [ ] **Step 5: Update `src/data/mockCharacters.ts`**

At `src/data/mockCharacters.ts:11` (`FULL_CHARACTER`):

```ts
  xp: 12,
```

becomes

```ts
  currentXp: 12,
  totalXp: 12,
```

At `src/data/mockCharacters.ts:154` (`NEW_CHARACTER`):

```ts
  xp: 0,
```

becomes

```ts
  currentXp: 0,
  totalXp: 0,
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm run test:unit -- tests/unit/characterValidation.test.ts tests/unit/fieldValidation.test.ts`
Expected: PASS

Note: this step alone leaves `src/utils/characterFieldUpdate.ts`, `src/utils/changeDetection.ts`, and `src/components/BasicInfo.ts` referencing the now-removed `Character.xp` and `FieldType` `"xp"` — the full unit suite (`npm run test:unit`) will fail until Task 2-4 land. That's expected and is fixed within this same work session before anything is pushed; run the two scoped test files above (not the full suite) to confirm this task's own change is correct in isolation.

- [ ] **Step 7: Commit**

```bash
git add src/types/character.ts src/utils/unified-validation.ts src/data/mockCharacters.ts tests/unit/characterValidation.test.ts tests/unit/fieldValidation.test.ts
git commit -m "$(cat <<'EOF'
feat(character): split XP into currentXp and totalXp

EOF
)"
```

---

### Task 2: Field-update wiring (`applyFieldUpdate`)

**Files:**

- Modify: `src/utils/characterFieldUpdate.ts`
- Modify: `tests/unit/characterFieldUpdate.test.ts`

**Interfaces:**

- Consumes: `FieldType` from Task 1 (`"currentXp" | "totalXp"`), `Character.currentXp`/`.totalXp` from Task 1.
- Produces: `applyFieldUpdate(character, "currentXp" | "totalXp", value)` — used by `BasicInfo` (Task 4) via its `onFieldUpdate` callback.

- [ ] **Step 1: Update the failing test**

In `tests/unit/characterFieldUpdate.test.ts:17` (fixture):

```ts
    xp: 0,
```

becomes

```ts
    currentXp: 0,
    totalXp: 0,
```

Replace the test at lines ~60-64:

```ts
const result = applyFieldUpdate(character, "xp", 5);

expect(result.character.xp).toBe(5);
```

with two assertions covering both fields:

```ts
const currentResult = applyFieldUpdate(character, "currentXp", 5);
expect(currentResult.character.currentXp).toBe(5);

const totalResult = applyFieldUpdate(character, "totalXp", 20);
expect(totalResult.character.totalXp).toBe(20);
```

(Keep the surrounding `it(...)` wrapper and any label/version-history assertions in that test as they are — only the `applyFieldUpdate` call and the field-read change.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/characterFieldUpdate.test.ts`
Expected: FAIL — `applyFieldUpdate` doesn't have a `"currentXp"`/`"totalXp"` case yet, `result.character.currentXp` is `undefined`.

- [ ] **Step 3: Update `src/utils/characterFieldUpdate.ts`**

Replace the `FIELD_LABELS` entry at line 15:

```ts
  xp: "Changed XP",
```

with

```ts
  currentXp: "Changed current XP",
  totalXp: "Changed total XP",
```

Replace the switch case at lines 65-67:

```ts
    case "xp":
      updatedCharacter.xp = value as number;
      break;
```

with

```ts
    case "currentXp":
      updatedCharacter.currentXp = value as number;
      break;
    case "totalXp":
      updatedCharacter.totalXp = value as number;
      break;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/characterFieldUpdate.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/characterFieldUpdate.ts tests/unit/characterFieldUpdate.test.ts
git commit -m "$(cat <<'EOF'
feat(character): wire currentXp/totalXp through applyFieldUpdate

EOF
)"
```

---

### Task 3: Change detection

**Files:**

- Modify: `src/utils/changeDetection.ts:119`
- Modify: `tests/unit/changeDetection.test.ts`

**Interfaces:**

- Consumes: `Character.currentXp`/`.totalXp` from Task 1.
- Produces: `detectResourceChanges` still pushes a single `"Updated XP"` string when either field changes (unchanged external contract — version-history description text).

- [ ] **Step 1: Update the failing test**

In `tests/unit/changeDetection.test.ts:14` (fixture, inside `createBaseCharacter()`):

```ts
    xp: 0,
```

becomes

```ts
    currentXp: 0,
    totalXp: 0,
```

Replace the `"should detect XP change"` test at lines 380-388 (inside `describe("Resource Tracker Changes", ...)`):

```ts
it("should detect XP change", () => {
  const char1 = createBaseCharacter();
  const char2 = createBaseCharacter();
  char2.xp = 5;

  const changes = detectChanges(char1, char2);

  expect(changes).toContain("Updated XP");
});
```

with two tests, one per field:

```ts
it("should detect currentXp change", () => {
  const char1 = createBaseCharacter();
  const char2 = createBaseCharacter();
  char2.currentXp = 5;

  const changes = detectChanges(char1, char2);

  expect(changes).toContain("Updated XP");
});

it("should detect totalXp change", () => {
  const char1 = createBaseCharacter();
  const char2 = createBaseCharacter();
  char2.totalXp = 20;

  const changes = detectChanges(char1, char2);

  expect(changes).toContain("Updated XP");
});
```

At `tests/unit/changeDetection.test.ts:413`, inside `"should combine resource changes"`:

```ts
char2.xp = 5;
```

becomes

```ts
char2.currentXp = 5;
```

(leave the rest of that test — `char2.shins = 20; char2.armor = 2;` and the `"Updated resources"` assertions — unchanged; it's exercising the combine-multiple-resource-changes behavior, not XP specifically, so one representative field is enough, consistent with how it already only touches one of the two stat-pool sub-fields elsewhere in the file.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/changeDetection.test.ts`
Expected: FAIL — `oldChar.xp`/`newChar.xp` no longer exist on `Character`, so the production code's comparison is comparing `undefined !== undefined` and never reports the change.

- [ ] **Step 3: Update `src/utils/changeDetection.ts:119`**

```ts
if (oldChar.xp !== newChar.xp) changes.push("Updated XP");
```

becomes

```ts
if (oldChar.currentXp !== newChar.currentXp || oldChar.totalXp !== newChar.totalXp) {
  changes.push("Updated XP");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/changeDetection.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/changeDetection.ts tests/unit/changeDetection.test.ts
git commit -m "$(cat <<'EOF'
feat(character): detect currentXp/totalXp changes for version history

EOF
)"
```

---

### Task 4: XP badge UI (two independently-editable cells)

**Files:**

- Modify: `src/components/BasicInfo.ts`
- Modify: `src/styles/components/stat-badge.css`
- Modify: `src/i18n/locales/en.json`, `src/i18n/locales/de.json`
- Modify: `tests/unit/basicInfo.test.ts`

**Interfaces:**

- Consumes: `Character.currentXp`/`.totalXp` (Task 1), `applyFieldUpdate`'s `"currentXp"`/`"totalXp"` cases (Task 2, via the `onFieldUpdate` callback `BasicInfo` already receives).
- Produces: `data-testid="xp-badge"` (wrapper, no longer itself clickable), `data-testid="xp-badge-current"` and `data-testid="xp-badge-total"` (the two clickable cells) — Task 8's e2e steps target these.

- [ ] **Step 1: Update the failing unit test**

In `tests/unit/basicInfo.test.ts:21` (fixture):

```ts
      xp: 5,
```

becomes

```ts
      currentXp: 5,
      totalXp: 45,
```

Replace the test at lines 316-324:

```ts
it("should render XP as editable badge", () => {
  const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
  render(basicInfo.render(), container);

  const xpBadge = container.querySelector('[data-testid="xp-badge"]') as HTMLElement;
  expect(xpBadge).toBeTruthy();
  expect(xpBadge.textContent).toContain("5");
  expect(xpBadge.classList.contains("editable-field")).toBe(true);
});
```

with

```ts
it("should render current and total XP as independently editable cells", () => {
  const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
  render(basicInfo.render(), container);

  const currentCell = container.querySelector('[data-testid="xp-badge-current"]') as HTMLElement;
  const totalCell = container.querySelector('[data-testid="xp-badge-total"]') as HTMLElement;

  expect(currentCell).toBeTruthy();
  expect(currentCell.textContent).toContain("5");
  expect(currentCell.classList.contains("editable-field")).toBe(true);

  expect(totalCell).toBeTruthy();
  expect(totalCell.textContent).toContain("45");
  expect(totalCell.classList.contains("editable-field")).toBe(true);
});
```

(This file's existing convention for "click opens the edit modal" (see the portrait-click test a few lines above, around line 227: `// Click should trigger modal (we can't fully test modal opening without ModalService mock)`) is to verify clickability attributes here at the unit level and leave the actual click → modal → correct-value flow to the e2e suite. Task 8 already adds that e2e coverage for both cells — "Clicking the Current XP badge opens edit modal with the current value" / the Total XP equivalent — so don't add a real-modal-click unit test here; it would be new-for-this-file territory with no established pattern and duplicate coverage Task 8 already provides more reliably against a real browser DOM.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/basicInfo.test.ts`
Expected: FAIL — `xp-badge-current`/`xp-badge-total` don't exist yet; `mockCharacter.currentXp`/`.totalXp` are `undefined` until Task 1's fixture edit, but the component still renders the old single `xp-badge`.

- [ ] **Step 3: Update `src/components/BasicInfo.ts`**

Replace the local `FieldType` at line 11:

```ts
type FieldType = "name" | "tier" | "descriptor" | "focus" | "xp";
```

with

```ts
type FieldType = "name" | "tier" | "descriptor" | "focus" | "currentXp" | "totalXp";
```

Replace `openEditModal`'s value lookup at lines 101-121:

```ts
  private openEditModal(fieldType: FieldType): void {
    const currentValue =
      fieldType === "name"
        ? this.character.name
        : fieldType === "tier"
          ? this.character.tier
          : fieldType === "descriptor"
            ? this.character.descriptor
            : fieldType === "focus"
              ? this.character.focus
              : this.character.xp;

    ModalService.openEditModal({
      fieldType: fieldType as ValidationFieldType,
      currentValue,
      onConfirm: async (newValue) => {
        await this.onFieldUpdate(fieldType, newValue);
      },
      versionHistoryService: getVersionHistoryService(),
    });
  }
```

with

```ts
  private openEditModal(fieldType: FieldType): void {
    const currentValue =
      fieldType === "name"
        ? this.character.name
        : fieldType === "tier"
          ? this.character.tier
          : fieldType === "descriptor"
            ? this.character.descriptor
            : fieldType === "focus"
              ? this.character.focus
              : fieldType === "currentXp"
                ? this.character.currentXp
                : this.character.totalXp;

    ModalService.openEditModal({
      fieldType: fieldType as ValidationFieldType,
      currentValue,
      onConfirm: async (newValue) => {
        await this.onFieldUpdate(fieldType, newValue);
      },
      versionHistoryService: getVersionHistoryService(),
    });
  }
```

Replace the badge markup at lines 126-137:

```ts
        <!-- XP Badge - top-left corner -->
        <div
          class="xp-badge stat-badge editable-field"
          data-testid="xp-badge"
          @click=${() => this.openEditModal("xp")}
          role="button"
          tabindex="0"
          aria-label="Edit XP"
        >
          <span class="stat-badge-value">${this.character.xp}</span>
          <span class="stat-badge-label">${t("character.xp")}</span>
        </div>
```

with

```ts
        <!-- XP Badge - top-left corner - two independently-editable cells -->
        <div class="xp-badge" data-testid="xp-badge">
          <div
            class="xp-badge-cell editable-field"
            data-testid="xp-badge-current"
            @click=${() => this.openEditModal("currentXp")}
            role="button"
            tabindex="0"
            aria-label=${t("character.editCurrentXp")}
          >
            <span class="stat-badge-value">${this.character.currentXp}</span>
            <span class="stat-badge-label">${t("character.xpCurrent")}</span>
          </div>
          <div
            class="xp-badge-cell editable-field"
            data-testid="xp-badge-total"
            @click=${() => this.openEditModal("totalXp")}
            role="button"
            tabindex="0"
            aria-label=${t("character.editTotalXp")}
          >
            <span class="stat-badge-value">${this.character.totalXp}</span>
            <span class="stat-badge-label">${t("character.xpTotal")}</span>
          </div>
        </div>
```

- [ ] **Step 4: Update `src/styles/components/stat-badge.css`**

Replace the "Legacy support" rule at lines 57-63:

```css
/* Legacy support - XP Badge in BasicInfo */
.xp-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
}
```

with

```css
/* XP Badge in BasicInfo - rectangular, two-column current/total layout */
.xp-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
  display: flex;
  flex-direction: row;
  border: 3px solid #d4af37;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.xp-badge-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  min-width: 3.5rem;
  min-height: 3.5rem;
  transition: background-color 0.2s ease;
}

.xp-badge-cell:hover {
  background-color: rgba(212, 175, 55, 0.2);
}

.xp-badge-cell + .xp-badge-cell {
  border-left: 2px solid #d4af37;
}
```

- [ ] **Step 5: Add i18n keys**

In `src/i18n/locales/en.json`, inside the `"character"` object, replace:

```json
    "xp": "XP",
    "shins": "Shins"
```

with

```json
    "xp": "XP",
    "xpCurrent": "Current",
    "xpTotal": "Total",
    "editCurrentXp": "Edit Current XP",
    "editTotalXp": "Edit Total XP",
    "shins": "Shins"
```

In `src/i18n/locales/de.json`, inside the `"character"` object, replace:

```json
    "xp": "EP",
    "shins": "Shins"
```

with

```json
    "xp": "EP",
    "xpCurrent": "Aktuell",
    "xpTotal": "Gesamt",
    "editCurrentXp": "Aktuelle EP bearbeiten",
    "editTotalXp": "Gesamt-EP bearbeiten",
    "shins": "Shins"
```

- [ ] **Step 6: Run tests and i18n check to verify they pass**

Run: `npm run test:unit -- tests/unit/basicInfo.test.ts`
Expected: PASS

Run: `npm run check:i18n`
Expected: PASS (all new `t()` keys present in both locales)

- [ ] **Step 7: Commit**

```bash
git add src/components/BasicInfo.ts src/styles/components/stat-badge.css src/i18n/locales/en.json src/i18n/locales/de.json tests/unit/basicInfo.test.ts
git commit -m "$(cat <<'EOF'
feat(basic-info): split XP badge into current/total cells

EOF
)"
```

---

### Task 5: Generic `EditFieldModal` test fixture rename

**Files:**

- Modify: `tests/unit/editFieldModal.test.ts`

**Interfaces:**

- Consumes: `FieldType` from Task 1 (`"currentXp"` replaces the removed `"xp"` as this file's representative numeric field type — `EditFieldModal` itself is generic and doesn't know about XP specifically).

- [ ] **Step 1: Update the failing test**

`tests/unit/editFieldModal.test.ts` uses `fieldType: "xp"` 14 times (lines 23, 38, 58, 80, 124, 146, 167, 233, 257, 274, 312, 356, 379, 397) purely as a representative numeric field to exercise `EditFieldModal`'s generic behavior — none of these tests assert anything XP-specific. Replace every occurrence of:

```ts
        fieldType: "xp",
```

with

```ts
        fieldType: "currentXp",
```

(all 14 occurrences; use `replace_all` since the string and its surrounding indentation are identical at every occurrence).

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/editFieldModal.test.ts`
Expected: FAIL — `FIELD_CONFIGS["xp"]` no longer exists (removed in Task 1), so `getInputType`/`getMinValue`/etc. throw when reading `.inputType` off `undefined`.

Note: this will already be fixed by Task 1 having landed — if running tasks in order, this test is actually already broken before this task starts (its `fieldType: "xp"` references became invalid the moment Task 1's `FieldType`/`FIELD_CONFIGS` changed). Running it now should show that failure; after Step 1's edit it passes.

- [ ] **Step 3: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/editFieldModal.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add tests/unit/editFieldModal.test.ts
git commit -m "$(cat <<'EOF'
test(edit-field-modal): use currentXp as the representative numeric field

EOF
)"
```

---

### Task 6: Version-history migration fix

**Files:**

- Modify: `src/services/versionState.ts`
- Modify: `tests/unit/versionState.test.ts`

**Interfaces:**

- Consumes: `sanitizeCharacter` from Task 1 (`src/utils/unified-validation.ts`).
- Produces: `VersionState.navigateToVersion` now sanitizes/migrates the loaded snapshot before displaying it — fixes the gap noted in the design spec's "Version history compatibility" section (old IndexedDB-persisted version snapshots only have `xp`, and were previously loaded with a raw, unsanitized cast).

- [ ] **Step 1: Write the failing test**

Add this test to `tests/unit/versionState.test.ts`, inside the `describe("navigation", ...)` block (after the existing "should navigate to specific version" test, so it shares that block's `beforeEach` which seeds 3 versions — but this test needs its own version list, so model it on the `describe("restoreToLatest", ...)` tests instead, which set up their own `mockVersions` rather than relying on the shared `beforeEach`):

```ts
describe("legacy version migration", () => {
  it("should migrate a version snapshot saved before the currentXp/totalXp split", async () => {
    const legacyCharacter = { ...createMockCharacter("Legacy Character"), xp: 12 } as any;
    delete legacyCharacter.currentXp;
    delete legacyCharacter.totalXp;

    const legacyVersion = {
      id: "version-legacy",
      character: legacyCharacter,
      timestamp: Date.now(),
      description: "Old save",
      etag: "etag-legacy",
    };
    vi.mocked(mockVersionHistory.getAllVersions).mockResolvedValue([legacyVersion]);

    await versionState.init();
    await versionState.navigateToVersion(0);

    const displayed = versionState.getDisplayedCharacter();
    expect(displayed.currentXp).toBe(12);
    expect(displayed.totalXp).toBe(12);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -- tests/unit/versionState.test.ts`
Expected: FAIL — `navigateToVersion` currently does a raw cast (`version.character as Character`) with no sanitization, so `displayed.currentXp`/`.totalXp` are `undefined`.

- [ ] **Step 3: Update `src/services/versionState.ts`**

Add the import at the top of the file (after the existing imports, e.g. after line 8):

```ts
import { sanitizeCharacter } from "../utils/unified-validation.js";
```

Replace `navigateToVersion` (lines 84-100):

```ts
  async navigateToVersion(index: number): Promise<void> {
    if (index < 0 || index >= this.allVersions.length) {
      throw new Error(`Invalid version index: ${index}`);
    }

    this.currentVersionIndex = index;
    const version = this.allVersions[index];
    // Versions never store a portrait (see versionHistory.ts saveVersion),
    // so re-attach the current one rather than letting it disappear while
    // viewing an old version — and, since restoreCurrentVersion() promotes
    // displayedCharacter to latestCharacter, this also keeps a restore from
    // permanently dropping the image.
    this.displayedCharacter = {
      ...(version.character as Character),
      portrait: this.latestCharacter.portrait,
    };
  }
```

with

```ts
  async navigateToVersion(index: number): Promise<void> {
    if (index < 0 || index >= this.allVersions.length) {
      throw new Error(`Invalid version index: ${index}`);
    }

    this.currentVersionIndex = index;
    const version = this.allVersions[index];
    // Snapshots are persisted in IndexedDB and can predate later Character
    // shape changes (e.g. the xp -> currentXp/totalXp split), so sanitize
    // on the way in rather than trusting the raw stored shape.
    const { character: sanitizedCharacter } = sanitizeCharacter(version.character);
    // Versions never store a portrait (see versionHistory.ts saveVersion),
    // so re-attach the current one rather than letting it disappear while
    // viewing an old version — and, since restoreCurrentVersion() promotes
    // displayedCharacter to latestCharacter, this also keeps a restore from
    // permanently dropping the image.
    this.displayedCharacter = {
      ...sanitizedCharacter,
      portrait: this.latestCharacter.portrait,
    };
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit -- tests/unit/versionState.test.ts`
Expected: PASS

Also re-run the full file to make sure the sanitize call didn't change any existing test's expectations (they all pass full, valid `Character` objects through, which `sanitizeCharacter` should return unchanged in shape):

Run: `npm run test:unit -- tests/unit/versionState.test.ts`
Expected: all tests in the file PASS (not just the new one)

- [ ] **Step 5: Commit**

```bash
git add src/services/versionState.ts tests/unit/versionState.test.ts
git commit -m "$(cat <<'EOF'
fix(version-history): sanitize snapshots on navigate to migrate legacy xp

EOF
)"
```

---

### Task 7: Remaining unit-test fixture sweep

**Files:**

- Modify: `tests/unit/indexedDBStorageImpl.test.ts`
- Modify: `tests/unit/fileStorage.test.ts`
- Modify: `tests/unit/exportManager.test.ts`
- Modify: `tests/unit/characterSheet.test.ts`
- Modify: `tests/unit/cyphersBox.test.ts`
- Modify: `tests/unit/characterSheetLayout.test.ts`
- Modify: `tests/unit/itemsBox.test.ts`
- Modify: `tests/unit/recoveryDamageSection.test.ts`
- Modify: `tests/unit/stateManagement.test.ts`
- Modify: `tests/unit/versionHistory.test.ts`
- Modify: `tests/unit/versionHistoryServiceRefactor.test.ts`
- Modify: `tests/unit/helpers/testSetup.ts`
- Modify: `tests/unit/helpers/containerTestSuite.ts`

**Interfaces:**

- Consumes: `Character.currentXp`/`.totalXp` from Task 1. None of these files test XP-specific behavior — they build `Character` fixtures for unrelated features and must stop referencing the removed `xp` field so the fixtures stay accurate (they aren't type-checked by `tsc`, since `tests/` is excluded per `tsconfig.json`, but leaving a stale `xp:` key would be misleading dead code).

- [ ] **Step 1: `tests/unit/indexedDBStorageImpl.test.ts` — real behavioral coupling, do this one first and run it in isolation**

This file specifically round-trips an XP-like value through storage precedence logic (not XP semantics) — rename to `currentXp` throughout so the test keeps testing the same thing.

Line 13 (fixture):

```ts
  xp: 5,
```

becomes

```ts
  currentXp: 5,
  totalXp: 5,
```

Lines 130-132 and 139:

```ts
await storage.save({ ...mockCharacter, xp: 50 });
```

becomes

```ts
await storage.save({ ...mockCharacter, currentXp: 50 });
```

```ts
localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...mockCharacter, xp: 5 }));
```

becomes

```ts
localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...mockCharacter, currentXp: 5 }));
```

```ts
expect(loaded.xp).toBe(50);
```

becomes

```ts
expect(loaded.currentXp).toBe(50);
```

Run: `npm run test:unit -- tests/unit/indexedDBStorageImpl.test.ts`
Expected: PASS

- [ ] **Step 2: `tests/unit/fileStorage.test.ts` — round-trip fixtures, no field-specific assertions beyond equality**

Three occurrences of `xp: 10,` at lines 25, 130, 249 (each inside a full `Character`-shaped object used both as input and, via `toEqual`, as the expected output — safe to rename in place):

```ts
        xp: 10,
```

(line 25, 8-space indent) becomes

```ts
        currentXp: 10,
        totalXp: 10,
```

```ts
          xp: 10,
```

(line 130, 10-space indent) becomes

```ts
          currentXp: 10,
          totalXp: 10,
```

```ts
      xp: 10,
```

(line 249, 6-space indent) becomes

```ts
      currentXp: 10,
      totalXp: 10,
```

Run: `npm run test:unit -- tests/unit/fileStorage.test.ts`
Expected: PASS

- [ ] **Step 3: `tests/unit/exportManager.test.ts`**

Line 12:

```ts
  xp: 0,
```

becomes

```ts
  currentXp: 0,
  totalXp: 0,
```

Run: `npm run test:unit -- tests/unit/exportManager.test.ts`
Expected: PASS

- [ ] **Step 4: Remaining plain fixtures — one-line renames, no other changes needed in each file**

For each file below, replace the shown line with the two-line replacement (match the existing indentation exactly, shown per file):

`tests/unit/characterSheet.test.ts:28`

```ts
      xp: 0,
```

→

```ts
      currentXp: 0,
      totalXp: 0,
```

`tests/unit/cyphersBox.test.ts:29`

```ts
      xp: 0,
```

→

```ts
      currentXp: 0,
      totalXp: 0,
```

`tests/unit/characterSheetLayout.test.ts:25`

```ts
    xp: 0,
```

→

```ts
    currentXp: 0,
    totalXp: 0,
```

`tests/unit/itemsBox.test.ts:21`

```ts
      xp: 0,
```

→

```ts
      currentXp: 0,
      totalXp: 0,
```

`tests/unit/recoveryDamageSection.test.ts:24`

```ts
      xp: 0,
```

→

```ts
      currentXp: 0,
      totalXp: 0,
```

`tests/unit/stateManagement.test.ts:26`

```ts
      xp: 0,
```

→

```ts
      currentXp: 0,
      totalXp: 0,
```

`tests/unit/versionHistory.test.ts:17`

```ts
    xp: 0,
```

→

```ts
    currentXp: 0,
    totalXp: 0,
```

`tests/unit/versionHistoryServiceRefactor.test.ts:20`

```ts
      xp: 0,
```

→

```ts
      currentXp: 0,
      totalXp: 0,
```

`tests/unit/helpers/testSetup.ts:59`

```ts
    xp: 5,
```

→

```ts
    currentXp: 5,
    totalXp: 5,
```

`tests/unit/helpers/testSetup.ts:99`

```ts
    xp: 0,
```

→

```ts
    currentXp: 0,
    totalXp: 0,
```

`tests/unit/helpers/containerTestSuite.ts:16`

```ts
    xp: 0,
```

→

```ts
    currentXp: 0,
    totalXp: 0,
```

- [ ] **Step 5: Run the full unit suite**

Run: `npm run test:unit`
Expected: PASS — every test file in the project is now green.

- [ ] **Step 6: Commit**

```bash
git add tests/unit/indexedDBStorageImpl.test.ts tests/unit/fileStorage.test.ts tests/unit/exportManager.test.ts tests/unit/characterSheet.test.ts tests/unit/cyphersBox.test.ts tests/unit/characterSheetLayout.test.ts tests/unit/itemsBox.test.ts tests/unit/recoveryDamageSection.test.ts tests/unit/stateManagement.test.ts tests/unit/versionHistory.test.ts tests/unit/versionHistoryServiceRefactor.test.ts tests/unit/helpers/testSetup.ts tests/unit/helpers/containerTestSuite.ts
git commit -m "$(cat <<'EOF'
test: update remaining fixtures for currentXp/totalXp

EOF
)"
```

---

### Task 8: BDD scenarios for the two-value XP badge

**Files:**

- Modify: `tests/e2e/features/resource-tracker-editing.feature`
- Modify: `tests/e2e/step-definitions/resource-tracker-editing.steps.ts`
- Modify: `tests/e2e/step-definitions/common-steps.ts`

**Interfaces:**

- Consumes: `data-testid="xp-badge-current"` / `"xp-badge-total"` from Task 4.
- Produces: Gherkin coverage for the new behavior, replacing the 11 single-value XP scenarios that assumed one badge/one click/one modal.

- [ ] **Step 1: Rewrite the XP section of the feature file**

In `tests/e2e/features/resource-tracker-editing.feature`, replace the entire XP section (lines 9-90, from the `# XP EDITING SCENARIOS` comment through the scenario right before `# SHINS EDITING SCENARIOS`):

```gherkin
    # ============================================================================
    # XP EDITING SCENARIOS
    # ============================================================================

    Scenario: XP badge displays current value
        Given the character has 5 XP
        Then the XP badge should show "5"

    Scenario: Clicking XP badge opens edit modal
        Given the character has 5 XP
        When I click the XP badge
        Then the edit modal should open
        And the modal input should contain "5"

    Scenario: Editing XP and confirming saves changes
        Given the character has 5 XP
        When I click the XP badge
        And I type "10" in the modal input
        And I click the modal confirm button
        Then the XP badge should show "10"
        And the character data should have xp 10

    Scenario: XP changes persist after page reload
        Given the character has 5 XP
        When I click the XP badge
        And I type "15" in the modal input
        And I click the modal confirm button
        And I reload the page
        Then the XP badge should show "15"

    Scenario: Canceling XP edit discards changes
        Given the character has 5 XP
        When I click the XP badge
        And I type "20" in the modal input
        And I click the modal cancel button
        Then the XP badge should show "5"

    Scenario: Escape key cancels XP edit
        Given the character has 5 XP
        When I click the XP badge
        And I type "25" in the modal input
        And I press Escape
        Then the modal should close
        And the XP badge should show "5"

    Scenario: Enter key confirms XP edit
        Given the character has 5 XP
        When I click the XP badge
        And I type "30" in the modal input
        And I press Enter
        Then the modal should close
        And the XP badge should show "30"

    Scenario: Backdrop click cancels XP edit
        Given the character has 5 XP
        When I click the XP badge
        And I type "35" in the modal input
        And I click the modal backdrop
        Then the modal should close
        And the XP badge should show "5"

    Scenario: XP accepts zero value
        Given the character has 5 XP
        When I click the XP badge
        And I type "0" in the modal input
        And I click the modal confirm button
        Then the XP badge should show "0"

    Scenario: XP validates numeric input
        Given the character has 5 XP
        When I click the XP badge
        And I type "abc" in the modal input
        Then the modal confirm button should be disabled

    Scenario: XP on mobile devices
        Given I am using a mobile device
        And the character has 5 XP
        When I tap the XP badge
        Then the edit modal should open
        When I type "12" in the modal input
        And I tap the modal confirm button
        Then the XP badge should show "12"
```

with

```gherkin
    # ============================================================================
    # XP EDITING SCENARIOS
    # ============================================================================

    Scenario: XP badge displays current and total values independently
        Given the character has 5 current XP and 45 total XP
        Then the Current XP badge should show "5"
        And the Total XP badge should show "45"

    Scenario: Clicking the Current XP badge opens edit modal with the current value
        Given the character has 5 current XP and 45 total XP
        When I click the Current XP badge
        Then the edit modal should open
        And the modal input should contain "5"

    Scenario: Clicking the Total XP badge opens edit modal with the total value
        Given the character has 5 current XP and 45 total XP
        When I click the Total XP badge
        Then the edit modal should open
        And the modal input should contain "45"

    Scenario: Editing current XP saves the change and leaves total XP untouched
        Given the character has 5 current XP and 45 total XP
        When I click the Current XP badge
        And I type "10" in the modal input
        And I click the modal confirm button
        Then the Current XP badge should show "10"
        And the Total XP badge should show "45"
        And the character data should have currentXp 10

    Scenario: Editing total XP saves the change and leaves current XP untouched
        Given the character has 5 current XP and 45 total XP
        When I click the Total XP badge
        And I type "60" in the modal input
        And I click the modal confirm button
        Then the Total XP badge should show "60"
        And the Current XP badge should show "5"
        And the character data should have totalXp 60

    Scenario: XP changes persist after page reload
        Given the character has 5 current XP and 45 total XP
        When I click the Current XP badge
        And I type "15" in the modal input
        And I click the modal confirm button
        And I reload the page
        Then the Current XP badge should show "15"
        And the Total XP badge should show "45"

    Scenario: Canceling a Current XP edit discards changes
        Given the character has 5 current XP and 45 total XP
        When I click the Current XP badge
        And I type "20" in the modal input
        And I click the modal cancel button
        Then the Current XP badge should show "5"

    Scenario: Current XP validates numeric input
        Given the character has 5 current XP and 45 total XP
        When I click the Current XP badge
        And I type "abc" in the modal input
        Then the modal confirm button should be disabled

    Scenario: XP badges on mobile devices
        Given I am using a mobile device
        And the character has 5 current XP and 45 total XP
        When I tap the Current XP badge
        Then the edit modal should open
        When I type "12" in the modal input
        And I tap the modal confirm button
        Then the Current XP badge should show "12"

    Scenario: A character saved before the current/total split shows the same value in both cells
        Given the character was saved with a single legacy XP value of 12
        Then the Current XP badge should show "12"
        And the Total XP badge should show "12"
```

(Escape/Enter/backdrop-cancel interaction coverage for XP is dropped rather than duplicated per-cell: that generic `EditFieldModal` behavior is already covered by the Shins/Armor scenarios directly below in this same file, and by `tests/unit/editFieldModal.test.ts` at the unit level — duplicating all three per XP cell would be redundant, not additional safety.)

- [ ] **Step 2: Update `tests/e2e/step-definitions/resource-tracker-editing.steps.ts`**

Replace the legacy XP-specific `Given` at lines 127-153:

```ts
// Legacy Given steps for backward compatibility with existing feature files
Given("the character has {int} XP", async function (this: CustomWorld, xp: number) {
  const character = createCharacterState("xp", xp).character;
  const storageHelper = new TestStorageHelper(this.page!);

  // Wait before setCharacter to ensure any previous auto-save completes
  await this.page!.waitForTimeout(500);
  await storageHelper.setCharacter(character);

  // Wait for IndexedDB save to complete before reloading
  await this.page!.waitForTimeout(500);

  await this.page!.reload();
  await this.page!.waitForLoadState("networkidle");

  // Additional wait for character to load from IndexedDB
  await this.page!.waitForTimeout(200);

  // Wait for XP badge to show correct value (increased timeout for CI)
  await this.page!.waitForFunction(
    (expectedXp) => {
      const badge = document.querySelector('[data-testid="xp-badge"] .stat-badge-value');
      return badge?.textContent === String(expectedXp);
    },
    xp,
    { timeout: 10000 }
  );
});
```

with

```ts
Given(
  "the character has {int} current XP and {int} total XP",
  async function (this: CustomWorld, currentXp: number, totalXp: number) {
    const character = { ...createCharacterState("currentXp", currentXp).character, totalXp };
    const storageHelper = new TestStorageHelper(this.page!);

    // Wait before setCharacter to ensure any previous auto-save completes
    await this.page!.waitForTimeout(500);
    await storageHelper.setCharacter(character);

    // Wait for IndexedDB save to complete before reloading
    await this.page!.waitForTimeout(500);

    await this.page!.reload();
    await this.page!.waitForLoadState("networkidle");

    // Additional wait for character to load from IndexedDB
    await this.page!.waitForTimeout(200);

    // Wait for both XP cells to show the correct values (increased timeout for CI)
    await this.page!.waitForFunction(
      ({ expectedCurrent, expectedTotal }) => {
        const currentCell = document.querySelector(
          '[data-testid="xp-badge-current"] .stat-badge-value'
        );
        const totalCell = document.querySelector(
          '[data-testid="xp-badge-total"] .stat-badge-value'
        );
        return (
          currentCell?.textContent === String(expectedCurrent) &&
          totalCell?.textContent === String(expectedTotal)
        );
      },
      { expectedCurrent: currentXp, expectedTotal: totalXp },
      { timeout: 10000 }
    );
  }
);

Given(
  "the character was saved with a single legacy XP value of {int}",
  async function (this: CustomWorld, legacyXp: number) {
    const {
      currentXp: _currentXp,
      totalXp: _totalXp,
      ...rest
    } = createCharacterState("currentXp", legacyXp).character as any;
    const character = { ...rest, xp: legacyXp };
    const storageHelper = new TestStorageHelper(this.page!);

    await this.page!.waitForTimeout(500);
    await storageHelper.setCharacter(character);
    await this.page!.waitForTimeout(500);

    await this.page!.reload();
    await this.page!.waitForLoadState("networkidle");
    await this.page!.waitForTimeout(200);

    await this.page!.waitForFunction(
      ({ expectedCurrent, expectedTotal }) => {
        const currentCell = document.querySelector(
          '[data-testid="xp-badge-current"] .stat-badge-value'
        );
        const totalCell = document.querySelector(
          '[data-testid="xp-badge-total"] .stat-badge-value'
        );
        return (
          currentCell?.textContent === String(expectedCurrent) &&
          totalCell?.textContent === String(expectedTotal)
        );
      },
      { expectedCurrent: legacyXp, expectedTotal: legacyXp },
      { timeout: 10000 }
    );
  }
);
```

Update the `createCharacterState` helper's fixture at lines 86 (and the identical fixture in the `Given("the character has {string} set to {int}"...)` step at line 36) — both currently seed `xp: 0,`; replace each with:

```ts
    currentXp: 0,
    totalXp: 0,
```

Replace the XP-specific `Then` steps at lines 277-283 and 321-330:

```ts
Then(
  "the XP badge should show {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const xpBadgeValue = this.page!.locator('[data-testid="xp-badge"] .stat-badge-value');
    await expect(xpBadgeValue).toHaveText(expectedValue);
  }
);
```

with

```ts
Then(
  "the Current XP badge should show {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const currentXpValue = this.page!.locator('[data-testid="xp-badge-current"] .stat-badge-value');
    await expect(currentXpValue).toHaveText(expectedValue);
  }
);

Then(
  "the Total XP badge should show {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const totalXpValue = this.page!.locator('[data-testid="xp-badge-total"] .stat-badge-value');
    await expect(totalXpValue).toHaveText(expectedValue);
  }
);
```

and

```ts
Then(
  "the character data should have xp {int}",
  async function (this: CustomWorld, expectedXp: number) {
    await this.page!.waitForTimeout(200);
    const storageHelper = new TestStorageHelper(this.page!);
    const storedData = await storageHelper.getCharacter();
    expect(storedData).toBeTruthy();
    expect(storedData.xp).toBe(expectedXp);
  }
);
```

with

```ts
Then(
  "the character data should have currentXp {int}",
  async function (this: CustomWorld, expectedCurrentXp: number) {
    await this.page!.waitForTimeout(200);
    const storageHelper = new TestStorageHelper(this.page!);
    const storedData = await storageHelper.getCharacter();
    expect(storedData).toBeTruthy();
    expect(storedData.currentXp).toBe(expectedCurrentXp);
  }
);

Then(
  "the character data should have totalXp {int}",
  async function (this: CustomWorld, expectedTotalXp: number) {
    await this.page!.waitForTimeout(200);
    const storageHelper = new TestStorageHelper(this.page!);
    const storedData = await storageHelper.getCharacter();
    expect(storedData).toBeTruthy();
    expect(storedData.totalXp).toBe(expectedTotalXp);
  }
);
```

- [ ] **Step 3: Update `tests/e2e/step-definitions/common-steps.ts`**

Replace the resource-tracker XP entries in `FIELD_TEST_IDS` (lines 33 and 40):

```ts
  // Resource trackers (badges)
  "XP badge": "xp-badge",
  "Shins badge": "shins-badge",
  "Armor badge": "armor-badge",
  "Max Cyphers badge": "max-cyphers-badge",
  "Effort badge": "effort-badge",

  // Resource trackers (legacy - for backward compatibility)
  XP: "xp-badge",
  Shins: "shins-badge",
```

with

```ts
  // Resource trackers (badges)
  "Current XP badge": "xp-badge-current",
  "Total XP badge": "xp-badge-total",
  "Shins badge": "shins-badge",
  "Armor badge": "armor-badge",
  "Max Cyphers badge": "max-cyphers-badge",
  "Effort badge": "effort-badge",

  // Resource trackers (legacy - for backward compatibility)
  Shins: "shins-badge",
```

(Leave `Armor`, `"Max Cyphers"`, `Effort` legacy entries below this untouched.)

Replace the dedicated XP click/tap steps at lines 105-108 and 130-133:

```ts
// Individual badge click steps
When("I click the XP badge", async function (this: CustomWorld) {
  await this.page!.locator('[data-testid="xp-badge"]').click();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});
```

with

```ts
// Individual badge click steps
When("I click the Current XP badge", async function (this: CustomWorld) {
  await this.page!.locator('[data-testid="xp-badge-current"]').click();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I click the Total XP badge", async function (this: CustomWorld) {
  await this.page!.locator('[data-testid="xp-badge-total"]').click();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});
```

```ts
When("I tap the XP badge", async function (this: CustomWorld) {
  await this.page!.locator('[data-testid="xp-badge"]').tap();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});
```

with

```ts
When("I tap the Current XP badge", async function (this: CustomWorld) {
  await this.page!.locator('[data-testid="xp-badge-current"]').tap();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});
```

- [ ] **Step 4: Run the rewritten feature**

Run: `npm run test:e2e -- tests/e2e/features/resource-tracker-editing.feature`
Expected: PASS — all XP, Shins, Armor, Max Cyphers, and Effort scenarios in the file pass.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/features/resource-tracker-editing.feature tests/e2e/step-definitions/resource-tracker-editing.steps.ts tests/e2e/step-definitions/common-steps.ts
git commit -m "$(cat <<'EOF'
test(e2e): cover independent current/total XP editing and legacy migration

EOF
)"
```

---

### Task 9: Remaining e2e fixture sweep

**Files:**

- Modify: `tests/e2e/step-definitions/data-validation.steps.ts`
- Modify: `tests/e2e/step-definitions/character-file-export.steps.ts`
- Modify: `tests/e2e/step-definitions/character-file-import.steps.ts`
- Modify: `tests/e2e/support/cardTestFixtures.ts`
- Modify: `tests/e2e/step-definitions/additional-fields-editing.steps.ts`

**Interfaces:**

- Consumes: `Character.currentXp`/`.totalXp` from Task 1. These files build character fixtures for import/export/card-drag features unrelated to XP; same rationale as Task 7.

- [ ] **Step 1: `tests/e2e/step-definitions/data-validation.steps.ts`**

Line 15 (`VALID_CHARACTER` fixture):

```ts
  xp: 5,
```

becomes

```ts
  currentXp: 5,
  totalXp: 5,
```

Lines 124-125 (simulated sanitized/corrected character):

```ts
    // xp was "many" -> corrected to 0 (default)
    xp: 0,
```

becomes

```ts
    // xp was "many" -> corrected to 0 (default) for both new fields
    currentXp: 0,
    totalXp: 0,
```

- [ ] **Step 2: `tests/e2e/step-definitions/character-file-export.steps.ts`**

Line 137:

```ts
expect(character).toHaveProperty("xp");
```

becomes

```ts
expect(character).toHaveProperty("currentXp");
expect(character).toHaveProperty("totalXp");
```

- [ ] **Step 3: `tests/e2e/step-definitions/character-file-import.steps.ts`**

Line 14:

```ts
    xp: 10,
```

becomes

```ts
    currentXp: 10,
    totalXp: 10,
```

Line 66:

```ts
    xp: 5,
```

becomes

```ts
    currentXp: 5,
    totalXp: 5,
```

- [ ] **Step 4: `tests/e2e/support/cardTestFixtures.ts`**

Line 13:

```ts
  xp: 12,
```

becomes

```ts
  currentXp: 12,
  totalXp: 12,
```

Line 255 (a second, separate fixture in the same file, `createEmptyAbilitiesCharacter()`):

```ts
    xp: 0,
```

becomes

```ts
    currentXp: 0,
    totalXp: 0,
```

- [ ] **Step 5: `tests/e2e/step-definitions/additional-fields-editing.steps.ts`**

Line 29:

```ts
    xp: 0,
```

becomes

```ts
    currentXp: 0,
    totalXp: 0,
```

- [ ] **Step 6: Run the affected feature files**

Confirmed mapping: `data-validation.steps.ts` → `data-validation.feature`, `character-file-export.steps.ts` → `character-file-export.feature`, `character-file-import.steps.ts` → `character-file-import.feature`, `cardTestFixtures.ts` → consumed only by `card-creation.steps.ts` → `card-creation.feature`, `additional-fields-editing.steps.ts` → `additional-fields-editing.feature`. All five files exist under `tests/e2e/features/`.

Run: `npm run test:e2e -- tests/e2e/features/data-validation.feature tests/e2e/features/character-file-export.feature tests/e2e/features/character-file-import.feature tests/e2e/features/card-creation.feature tests/e2e/features/additional-fields-editing.feature`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add tests/e2e/step-definitions/data-validation.steps.ts tests/e2e/step-definitions/character-file-export.steps.ts tests/e2e/step-definitions/character-file-import.steps.ts tests/e2e/support/cardTestFixtures.ts tests/e2e/step-definitions/additional-fields-editing.steps.ts
git commit -m "$(cat <<'EOF'
test(e2e): update remaining fixtures for currentXp/totalXp

EOF
)"
```

---

### Task 10: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Full unit suite**

Run: `npm run test:unit`
Expected: PASS, all files.

- [ ] **Step 2: i18n coverage**

Run: `npm run check:i18n`
Expected: PASS.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: PASS (or only pre-existing warnings unrelated to this change — do not introduce new ones).

- [ ] **Step 4: Full TypeScript build**

Run: `npm run build`
Expected: PASS — this is the first point `src/` is fully type-checked against the new `Character` shape.

- [ ] **Step 5: Full e2e suite against the production build**

Run: `npm run test:e2e:prod`
Expected: PASS, all feature files — this is what the pre-push hook runs, so confirm it here before pushing.

- [ ] **Step 6: Manual smoke check (optional but recommended given the visual redesign)**

Run: `npm run dev`, open the app, and visually confirm the XP badge shows two distinct cells with "Current"/"Total" labels, both independently clickable, both persisting edits correctly.
