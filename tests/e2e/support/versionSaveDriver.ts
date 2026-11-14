import type { Page } from "@playwright/test";
import { waitForSaveComplete } from "./save.js";

const VERSION_COUNTER = '[data-testid="version-counter"]';

declare global {
  interface Window {
    __releaseVersionSave?: () => void;
    __heldSquash?: Promise<void>;
  }
}

// The service keeps its VersionHistoryManager private; the race needs a save
// that stays pending, so the driver reaches in and gates saveVersion.
interface GatedManager {
  saveVersion: (...args: unknown[]) => Promise<unknown>;
}

/** When edits become a saved version, and holding that save back to provoke a race. */
export interface VersionSaveDriver {
  settleEdits(): Promise<void>;
  holdVersionSaves(): Promise<void>;
  beginSavingVersion(): Promise<void>;
  releaseHeldVersionSave(): Promise<void>;
}

export class PlaywrightVersionSaveDriver implements VersionSaveDriver {
  constructor(private page: Page) {}

  /**
   * Resolves once a forced squash has been persisted and the app has finished
   * reacting to it. The app rebuilds the version navigator as the last step of
   * handling "version-squashed", so a counter element without the pre-squash
   * mark means that handling is done. An empty buffer squashes nothing and
   * emits no event. A still-pending auto-save is flushed first: its completion
   * handler reloads the version list and would otherwise jump the navigator to
   * the latest version after the squash.
   */
  async settleEdits(): Promise<void> {
    await waitForSaveComplete(this.page);
    const squashes = await this.page.evaluate(async (counterSelector) => {
      const service = window.__versionHistoryService;
      if (!service) {
        throw new Error("Version history service not available. Make sure the app has loaded.");
      }
      const hasBufferedChanges = service.getBufferLength() > 0;
      document.querySelector(counterSelector)?.setAttribute("data-pre-squash", "");
      await service.forceSquash();
      return hasBufferedChanges;
    }, VERSION_COUNTER);
    if (squashes) {
      await this.page.waitForSelector(`${VERSION_COUNTER}:not([data-pre-squash])`);
    }
  }

  async holdVersionSaves(): Promise<void> {
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
  }

  async beginSavingVersion(): Promise<void> {
    await this.page.evaluate(() => {
      const service = window.__versionHistoryService;
      if (!service) {
        throw new Error("Version history service not available. Make sure the app has loaded.");
      }
      // Deliberately not awaited: the squash stays suspended on the held save.
      window.__heldSquash = service.forceSquash();
    });
  }

  async releaseHeldVersionSave(): Promise<void> {
    await this.page.evaluate(async () => {
      window.__releaseVersionSave?.();
      await window.__heldSquash;
    });
  }
}
