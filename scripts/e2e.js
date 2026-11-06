// Runs Cucumber against a Vite server this script owns. Vite is started in
// process with strictPort, so the run only proceeds once *our* server is bound:
// a port already in use fails the run instead of silently testing whatever else
// answers on it, and parallel worktrees can run E2E at the same time.
//
// Usage: node scripts/e2e.js [--prod] [cucumber-js arguments...]
// E2E_PORT pins the port; otherwise the OS picks a free one.
// E2E_SHARD="2/4" runs only the second of four slices of the given feature files.
import { spawn } from "node:child_process";
import { createServer as createProbe } from "node:net";
import { loadConfiguration, loadSources } from "@cucumber/cucumber/api";
import { createServer, preview } from "vite";
import { parseShard, scenariosInShard } from "../tests/e2e/support/shard.ts";

const CUCUMBER = "node_modules/@cucumber/cucumber/bin/cucumber.js";

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createProbe().once("error", reject);
    // "localhost", as Vite binds it: on some machines that is IPv6 only.
    probe.listen(0, "localhost", () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

async function startServer(prod, port) {
  if (prod) return preview({ preview: { port, strictPort: true } });
  const server = await createServer({ server: { port, strictPort: true } });
  return server.listen();
}

function runCucumber(args, port) {
  return new Promise((resolve) => {
    spawn(process.execPath, [CUCUMBER, ...args], {
      stdio: "inherit",
      env: { ...process.env, E2E_PORT: String(port) },
    }).on("exit", (code) => resolve(code ?? 1));
  });
}

/**
 * The arguments with the feature paths replaced by this shard's scenarios, as
 * file:line. Cucumber's own plan picks them, so the device's tag filter in
 * cucumber.cjs applies before the scenarios are dealt out.
 */
async function shardArgs(args, shard) {
  const isFeaturePath = (arg) => arg.endsWith(".feature");
  const { runConfiguration } = await loadConfiguration({
    provided: { paths: args.filter(isFeaturePath) },
  });
  const { plan } = await loadSources(runConfiguration.sources);
  const scenarios = scenariosInShard(plan, shard);
  console.log(
    `E2E shard ${shard.index}/${shard.total}: ${scenarios.length} of ${plan.length} scenarios`
  );
  return [
    ...args.filter((arg) => !isFeaturePath(arg)),
    ...scenarios.map(({ uri, location }) => `${uri}:${location.line}`),
  ];
}

const argv = process.argv.slice(2);
const prod = argv[0] === "--prod";
const shard = parseShard(process.env.E2E_SHARD);
const cucumberArgs = prod ? argv.slice(1) : argv;
const args = shard ? await shardArgs(cucumberArgs, shard) : cucumberArgs;
const port = Number(process.env.E2E_PORT ?? (await freePort()));

let server;
try {
  server = await startServer(prod, port);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const code = await runCucumber(args, port);
await server.close();
process.exit(code);
