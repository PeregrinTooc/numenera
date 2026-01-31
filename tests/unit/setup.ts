// Vitest setup file
// Runs before each test file

import { beforeAll } from "vitest";
import { initI18n } from "../../src/i18n/index.js";
import "fake-indexeddb/auto";

// Initialize i18n before all tests
beforeAll(async () => {
  await initI18n();
});
