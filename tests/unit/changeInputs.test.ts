import { describe, it, expect } from "vitest";
import { fingerprint, isInert, isOutsideApp, pushedRevisions } from "../../scripts/changeInputs";

describe("pushedRevisions", () => {
  const zero = "0".repeat(40);

  it("lists the local commit of every pushed ref but the deleted ones", () => {
    const stdin = [
      `refs/heads/main ${"a".repeat(40)} refs/heads/main ${"b".repeat(40)}`,
      `(delete) ${zero} refs/heads/old ${"c".repeat(40)}`,
      "",
    ].join("\n");

    expect(pushedRevisions(stdin)).toEqual(["a".repeat(40)]);
  });
});

/** `git ls-tree -r -z` output for the given path → blob pairs. */
function tree(blobs: Record<string, string>): string {
  return Object.entries(blobs)
    .map(([path, blob]) => `100644 blob ${blob}\t${path}\0`)
    .join("");
}

describe("fingerprint", () => {
  it("ignores changes to paths it is told to ignore", () => {
    const before = tree({ "src/main.ts": "aaa", "docs/TODO.md": "bbb" });
    const after = tree({ "src/main.ts": "aaa", "docs/TODO.md": "ccc" });

    expect(fingerprint(after, isInert)).toBe(fingerprint(before, isInert));
  });

  it("changes when an input's content changes", () => {
    const before = tree({ "src/main.ts": "aaa" });
    const after = tree({ "src/main.ts": "abc" });

    expect(fingerprint(after, isInert)).not.toBe(fingerprint(before, isInert));
  });

  it("changes when an input is renamed", () => {
    const before = tree({ "src/a.ts": "aaa" });
    const after = tree({ "src/b.ts": "aaa" });

    expect(fingerprint(after, isInert)).not.toBe(fingerprint(before, isInert));
  });
});

describe("isOutsideApp", () => {
  it("puts the tests outside the deployed app", () => {
    expect(isOutsideApp("tests/e2e/features/some.feature")).toBe(true);
  });

  it.each([
    "scripts/e2e.js",
    ".github/workflows/deploy.yml",
    ".husky/pre-push",
    "cucumber.cjs",
    "playwright.config.ts",
    "playwright.prod.config.ts",
    "vitest.config.ts",
    "stryker.config.js",
    "tsconfig.test.json",
    "eslint.config.js",
    ".prettierrc",
    ".prettierignore",
  ])("puts the tooling file %s outside the deployed app", (path) => {
    expect(isOutsideApp(path)).toBe(true);
  });

  it.each([
    "src/main.ts",
    "public/icon.png",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
  ])("keeps %s, which shapes the build, inside the deployed app", (path) => {
    expect(isOutsideApp(path)).toBe(false);
  });
});

describe("isInert", () => {
  it("counts documentation as inert", () => {
    expect(isInert("docs/rules/git.md")).toBe(true);
  });

  it.each(["README.md", "CLAUDE.md"])("counts the root document %s as inert", (path) => {
    expect(isInert(path)).toBe(true);
  });

  it("counts assistant files, worktrees among them, as inert", () => {
    expect(isInert(".claude/worktrees/some-task/")).toBe(true);
  });

  it.each(["src/main.ts", "index.html", "some-new.config.ts"])(
    "counts %s, like any path it does not know, as an input",
    (path) => {
      expect(isInert(path)).toBe(false);
    }
  );

  it("does not count the generated step catalog as inert: check:steps compares it with the steps", () => {
    expect(isInert("tests/e2e/STEP_CATALOG.md")).toBe(false);
  });
});
