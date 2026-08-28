// Vitest setup file
// Runs before each test file

import { beforeAll } from "vitest";
import { initI18n } from "../../src/i18n/index.js";
import "fake-indexeddb/auto";

// Initialize i18n before all tests
beforeAll(async () => {
  await initI18n();
});

// jsdom doesn't implement matchMedia at all. Default it to "matches" (i.e.
// desktop-width) so any component calling isPhoneViewport() (src/utils/
// viewport.ts) renders sensibly in tests that aren't specifically about
// viewport behaviour, instead of throwing "matchMedia is not a function".
// Tests that care about the phone/desktop distinction override this
// themselves (see tests/unit/viewport.test.ts).
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: true,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
