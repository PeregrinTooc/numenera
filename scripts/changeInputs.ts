import { createHash } from "node:crypto";

/**
 * A hash of a commit's files, read from `git ls-tree -r -z`, leaving out the
 * ignored paths. Equal fingerprints mean equal content wherever it matters.
 */
export function fingerprint(lsTree: string, ignore: (path: string) => boolean): string {
  const hash = createHash("sha256");
  for (const entry of lsTree.split("\0")) {
    const path = entry.slice(entry.indexOf("\t") + 1);
    if (entry && !ignore(path)) hash.update(`${entry}\0`);
  }
  return hash.digest("hex");
}

const INERT: RegExp[] = [/^docs\//, /^[^/]+\.md$/, /^\.claude\//];

export function isInert(path: string): boolean {
  return INERT.some((pattern) => pattern.test(path));
}

const TOOLING: RegExp[] = [
  /^(tests|scripts|\.github|\.husky)\//,
  /^cucumber\.cjs$/,
  /^playwright(\.prod)?\.config\.ts$/,
  /^(vitest|stryker|eslint)\.config\.(ts|js)$/,
  /^tsconfig\.test\.json$/,
  /^\.prettier(rc|ignore)$/,
];

export function isOutsideApp(path: string): boolean {
  return isInert(path) || TOOLING.some((pattern) => pattern.test(path));
}

/** The local commits a push sends, read from the pre-push hook's standard input. */
export function pushedRevisions(prePushInput: string): string[] {
  return prePushInput
    .split("\n")
    .map((line) => line.split(" ")[1])
    .filter((revision): revision is string => !!revision && !/^0+$/.test(revision));
}
