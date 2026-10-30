import { Given, When } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

declare global {
  interface Window {
    __releaseVersionSave?: () => void;
    __heldSquash?: Promise<void>;
  }
}

// The service keeps its VersionHistoryManager private; the race needs a save
// that stays pending, so these steps reach in and gate saveVersion.
interface GatedManager {
  saveVersion: (...args: unknown[]) => Promise<unknown>;
}

Given("version saves are held", async function (this: CustomWorld) {
  await this.page.evaluate(() => {
    const service = window.__versionHistoryService as unknown as { manager: GatedManager };
    const manager = service.manager;
    const save = manager.saveVersion.bind(manager);
    const gate = new Promise<void>((resolve) => {
      window.__releaseVersionSave = resolve;
    });
    manager.saveVersion = async (...args: unknown[]) => {
      await gate;
      return save(...args);
    };
  });
});

When("the squash starts while version saves are held", async function (this: CustomWorld) {
  await this.page.evaluate(() => {
    const service = window.__versionHistoryService;
    if (!service) {
      throw new Error("Version history service not available. Make sure the app has loaded.");
    }
    // Deliberately not awaited: the squash stays suspended on the held save.
    window.__heldSquash = service.forceSquash();
  });
});

When("the held version save is released", async function (this: CustomWorld) {
  await this.page.evaluate(async () => {
    window.__releaseVersionSave?.();
    await window.__heldSquash;
  });
});
