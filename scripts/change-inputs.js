// Tells the git hooks and CI whether anything that matters changed, so a push
// of documentation alone runs no tests. The rules live in changeInputs.ts.
//
// Usage:
//   node scripts/change-inputs.js fingerprint [--app]
//       prints the fingerprint of HEAD; --app leaves out the tooling too, so
//       it changes only when the deployed app does
//   node scripts/change-inputs.js staged-inert
//       exits 0 when every staged change is inert
//   node scripts/change-inputs.js pre-push
//       the pre-push hook: runs the E2E suite unless every pushed commit has
//       the fingerprint of the last green run, which it then records
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fingerprint, isInert, isOutsideApp, pushedRevisions } from "./changeInputs.ts";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" });
const paths = (output) => output.split("\0").filter(Boolean);
const inputsOf = (revision, ignore = isInert) =>
  fingerprint(git("ls-tree", "-r", "-z", revision), ignore);

function stagedInert() {
  return paths(git("diff", "--cached", "--name-only", "-z")).every(isInert);
}

/** The E2E suite runs on the working tree, which is HEAD only if nothing that matters differs. */
function workingTreeIsHead() {
  const changed = paths(git("diff", "--name-only", "-z", "HEAD"));
  const untracked = paths(git("ls-files", "--others", "--exclude-standard", "-z"));
  return [...changed, ...untracked].every(isInert);
}

function prePush() {
  const verifiedFile = path.join(git("rev-parse", "--git-common-dir").trim(), "verified-inputs");
  let verified = "";
  try {
    verified = readFileSync(verifiedFile, "utf8").trim();
  } catch {
    // No green run recorded yet.
  }

  const pushed = pushedRevisions(readFileSync(0, "utf8"));
  if (pushed.every((revision) => inputsOf(revision) === verified)) {
    console.log("✅ Nothing but inert files changed since the last green E2E run; skipping it.");
    return 0;
  }

  const { status } = spawnSync("npm run test:e2e:prod", { stdio: "inherit", shell: true });
  if (status !== 0) return status ?? 1;
  if (workingTreeIsHead()) writeFileSync(verifiedFile, `${inputsOf("HEAD")}\n`);
  return 0;
}

const [command, ...args] = process.argv.slice(2);
switch (command) {
  case "fingerprint":
    console.log(inputsOf("HEAD", args.includes("--app") ? isOutsideApp : isInert));
    break;
  case "staged-inert":
    process.exit(stagedInert() ? 0 : 1);
    break;
  case "pre-push":
    process.exit(prePush());
    break;
  default:
    console.error(`Unknown command "${command}"; see the usage at the top of this script.`);
    process.exit(2);
}
