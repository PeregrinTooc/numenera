#!/usr/bin/env node

/**
 * Step Catalog
 *
 * Reads every Cucumber step definition under tests/e2e/step-definitions/ and
 * every step line under tests/e2e/features/, matches them against each other,
 * and:
 *
 *   node scripts/step-catalog.js           writes tests/e2e/STEP_CATALOG.md —
 *                                          the reference for feature-file
 *                                          authors (every phrase, how often it
 *                                          is used, where it is defined)
 *   node scripts/step-catalog.js --check   exits 1 if any step definition is
 *                                          matched by no feature line (dead
 *                                          step) or if STEP_CATALOG.md is out
 *                                          of date — for pre-commit / CI
 *
 * Matching converts each Cucumber expression to a regex: {string}, {int},
 * {float}, {word}, {} and custom {types} become wildcards, "(s)" optional
 * text and "a/b" alternation are honoured, and Scenario Outline placeholders
 * (<name>) are accepted wherever a parameter is expected.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const STEP_DIR = path.join(projectRoot, "tests/e2e/step-definitions");
const FEATURE_DIR = path.join(projectRoot, "tests/e2e/features");
const OUTPUT = path.join(projectRoot, "tests/e2e/STEP_CATALOG.md");

const CHECK = process.argv.includes("--check");

// ---------------------------------------------------------------------------
// Parse step definitions
// ---------------------------------------------------------------------------

/** Matches `Given("…"`, `When('…'`, `Then(\n  "…"` — the string is group 3. */
const STEP_DEF_RE = /^\s*(Given|When|Then)\(\s*\n?\s*(["'`])((?:\\.|(?!\2).)*)\2/gm;

function readStepDefinitions() {
  const defs = [];
  for (const file of fs
    .readdirSync(STEP_DIR)
    .filter((f) => f.endsWith(".ts"))
    .sort()) {
    const src = fs.readFileSync(path.join(STEP_DIR, file), "utf8");
    let m;
    while ((m = STEP_DEF_RE.exec(src))) {
      const line = src.slice(0, m.index).split("\n").length;
      // Unescape the JS string literal: "\\(" in source is "\(" to Cucumber.
      const expression = m[3].replace(/\\(.)/g, "$1");
      defs.push({ file, line, keyword: m[1], expression, uses: 0 });
    }
  }
  return defs;
}

// ---------------------------------------------------------------------------
// Parse feature files
// ---------------------------------------------------------------------------

const STEP_LINE_RE = /^\s*(Given|When|Then|And|But)\s+(.*?)\s*$/;

function readFeatureSteps() {
  const steps = [];
  for (const file of fs
    .readdirSync(FEATURE_DIR)
    .filter((f) => f.endsWith(".feature"))
    .sort()) {
    const lines = fs.readFileSync(path.join(FEATURE_DIR, file), "utf8").split(/\r?\n/);
    lines.forEach((raw, i) => {
      const m = STEP_LINE_RE.exec(raw);
      if (m) steps.push({ file, line: i + 1, text: m[2] });
    });
  }
  return steps;
}

// ---------------------------------------------------------------------------
// Cucumber expression → RegExp
// ---------------------------------------------------------------------------

const OUTLINE = "<[^>]+>"; // Scenario Outline placeholder
const PARAM = {
  string: `(?:"[^"]*"|'[^']*'|${OUTLINE})`,
  int: `(?:-?\\d+|${OUTLINE})`,
  float: `(?:-?\\d+(?:\\.\\d+)?|${OUTLINE})`,
  word: `(?:\\S+|${OUTLINE})`,
  "": ".*",
  ...readCustomParamTypes(),
};

/**
 * Custom parameter types (defineParameterType({ name, regexp })) can match
 * more than a single word — {badge} includes "Total XP", {cardType} includes
 * "special ability" — so falling back to a single-run-of-non-whitespace
 * wildcard for them, as an unrecognised type would, wrongly reports their
 * multi-word feature lines as undefined. Reading each one's actual regexp
 * out of parameterTypes.ts keeps this script's matching in sync with what
 * Cucumber itself will match at runtime.
 */
function readCustomParamTypes() {
  const file = path.join(projectRoot, "tests/e2e/support/parameterTypes.ts");
  const custom = {};
  if (!fs.existsSync(file)) return custom;
  const src = fs.readFileSync(file, "utf8");
  const re = /defineParameterType\(\{\s*name:\s*["'`]([^"'`]+)["'`][\s\S]*?regexp:\s*\/((?:\\.|[^\\/])*)\//g;
  let m;
  while ((m = re.exec(src))) {
    const [, name, pattern] = m;
    custom[name] = `(?:${pattern})`;
  }
  return custom;
}

function expressionToRegExp(expression) {
  let out = "";
  let i = 0;
  while (i < expression.length) {
    const c = expression[i];
    if (c === "\\") {
      // Escaped literal: "\(" or "\{" — emit the next char literally.
      out += escapeRegExp(expression[i + 1] ?? "");
      i += 2;
    } else if (c === "{") {
      const end = expression.indexOf("}", i);
      const name = expression.slice(i + 1, end);
      out += PARAM[name] ?? `(?:[^\\s"]+|"[^"]*"|${OUTLINE})`; // custom parameter type
      i = end + 1;
    } else if (c === "(") {
      const end = expression.indexOf(")", i);
      out += `(?:${escapeRegExp(expression.slice(i + 1, end))})?`;
      i = end + 1;
    } else if (c === "/") {
      // Alternation: previous word / next word. Rebuild the last word.
      const prev = /(\S+)$/.exec(out);
      const next = /^(\S+)/.exec(expression.slice(i + 1));
      const prevWord = prev ? prev[1] : "";
      const nextWord = next ? next[1] : "";
      out = out.slice(0, out.length - prevWord.length);
      out += `(?:${prevWord}|${escapeRegExp(nextWord)})`;
      i += 1 + nextWord.length;
    } else {
      out += escapeRegExp(c);
      i += 1;
    }
  }
  return new RegExp(`^${out}$`);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ---------------------------------------------------------------------------
// Match
// ---------------------------------------------------------------------------

const defs = readStepDefinitions();
const featureSteps = readFeatureSteps();

for (const def of defs) {
  def.regexp = expressionToRegExp(def.expression);
  def.uses = featureSteps.filter((s) => def.regexp.test(s.text)).length;
}

const undefinedSteps = featureSteps.filter((s) => !defs.some((d) => d.regexp.test(s.text)));
const deadDefs = defs.filter((d) => d.uses === 0);

// ---------------------------------------------------------------------------
// Catalog output
// ---------------------------------------------------------------------------

function md(s) {
  return s.replace(/\|/g, "\\|");
}

const byFile = new Map();
for (const d of defs) {
  if (!byFile.has(d.file)) byFile.set(d.file, []);
  byFile.get(d.file).push(d);
}

const lines = [];
lines.push("# Step Catalog");
lines.push("");
lines.push("<!-- GENERATED FILE — do not edit by hand. Regenerate with: npm run docs:steps -->");
lines.push("");
lines.push("Every Cucumber step phrase the E2E suite understands, with how many feature");
lines.push("lines use it and where it is implemented. **Search here before writing a new");
lines.push("step in a `.feature` file** — if a phrase already exists, reuse it exactly.");
lines.push("");
lines.push("## How to use this catalog");
lines.push("");
lines.push("- `Ctrl+F` for the thing you want to do (`badge`, `modal`, `cypher card`, …).");
lines.push('- `{string}` takes a quoted value: `I click on the "Shins" value`.');
lines.push("- `{int}` takes a number: `the character has 47 shins`.");
lines.push("- `(s)` is optional text; `a/b` means either word.");
lines.push("- **Uses** is how many feature lines already use the phrase — prefer the");
lines.push("  higher-count phrasing when two look alike. `0` means nothing uses it yet;");
lines.push("  such steps are scheduled for deletion (see `tests/implementation-plan.md`");
lines.push("  Phase 1), so do not build on them.");
lines.push("- `Given`/`When`/`Then` in the table is where the step was registered;");
lines.push("  Cucumber matches `And`/`But` and any keyword interchangeably.");
lines.push("- Generic steps (modal buttons, typing, badges, page reload) live in");
lines.push("  `common-steps.ts`. Feature-specific steps live in the file named after");
lines.push("  the feature.");
lines.push("- If no phrase fits, add the step definition to the matching file and run");
lines.push("  `npm run docs:steps` so this catalog stays current.");
lines.push("");
lines.push("## Summary");
lines.push("");
lines.push(`- Step definitions: **${defs.length}** in ${byFile.size} files`);
lines.push(`- Feature step lines: **${featureSteps.length}**`);
lines.push(`- Definitions with no feature usage: **${deadDefs.length}**`);
lines.push(`- Feature lines matching no definition: **${undefinedSteps.length}**`);
lines.push("");
lines.push("| Step file | Definitions | Unused |");
lines.push("| --- | ---: | ---: |");
for (const [file, list] of byFile) {
  lines.push(
    `| [${file}](#${anchor(file)}) | ${list.length} | ${list.filter((d) => d.uses === 0).length} |`
  );
}
lines.push("");

if (undefinedSteps.length) {
  lines.push("## ⚠️ Feature lines with no matching step definition");
  lines.push("");
  lines.push("These would be reported as *undefined* by Cucumber (or are matched by a");
  lines.push("pattern this script does not understand):");
  lines.push("");
  for (const s of undefinedSteps) lines.push(`- \`${s.file}:${s.line}\` — ${md(s.text)}`);
  lines.push("");
}

for (const [file, list] of byFile) {
  lines.push(`## ${file}`);
  lines.push("");
  lines.push("| Keyword | Phrase | Uses | Line |");
  lines.push("| --- | --- | ---: | ---: |");
  for (const d of [...list].sort((a, b) => a.expression.localeCompare(b.expression))) {
    const uses = d.uses === 0 ? "**0**" : String(d.uses);
    lines.push(`| ${d.keyword} | \`${md(d.expression)}\` | ${uses} | ${d.line} |`);
  }
  lines.push("");
}

function anchor(file) {
  return file.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const catalog = lines.join("\n") + "\n";
const relOutput = path.relative(projectRoot, OUTPUT).replace(/\\/g, "/");

// ---------------------------------------------------------------------------
// --check mode: dead steps and a stale catalog both fail
// ---------------------------------------------------------------------------

if (CHECK) {
  let failed = false;
  if (deadDefs.length > 0) {
    failed = true;
    console.error(
      `❌ ${deadDefs.length} of ${defs.length} step definitions match no feature line:\n`
    );
    for (const d of deadDefs) {
      console.error(
        `  tests/e2e/step-definitions/${d.file}:${d.line}  ${d.keyword} ${d.expression}`
      );
    }
    console.error("\nDelete them, or add the scenario that needs them.\n");
  }
  const existing = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, "utf8") : "";
  if (existing !== catalog) {
    failed = true;
    console.error(`❌ ${relOutput} is out of date. Run: npm run docs:steps`);
  }
  if (failed) process.exit(1);
  console.log(`✅ All ${defs.length} step definitions are used and ${relOutput} is current.`);
  process.exit(0);
}

fs.writeFileSync(OUTPUT, catalog);
console.log(
  `📖 Wrote ${relOutput}: ${defs.length} step definitions, ` +
    `${deadDefs.length} unused, ${undefinedSteps.length} undefined feature lines.`
);
