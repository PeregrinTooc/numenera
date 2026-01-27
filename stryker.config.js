// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress"],
  testRunner: "command",
  commandRunner: {
    command: "npm test",
  },
  coverageAnalysis: "perTest",
  mutate: [
    "src/components/**/*.ts",
    "src/utils/**/*.ts",
    "src/storage/**/*.ts",
    "src/services/**/*.ts",
    "!src/**/*.test.ts",
    "!src/main.ts",
  ],
  timeoutMS: 60000,
  concurrency: 1,
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",
  ignoreStatic: true,
  tempDirName: "stryker-tmp",
  cleanTempDir: true,
};

export default config;
