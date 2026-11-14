import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";
import { forceSquash } from "../support/versionHistoryHelpers.js";

Then(
  "the undo buffer should contain exactly {int} changes",
  async function (this: CustomWorld, expectedLength: number) {
    const bufferLength = await this.page.evaluate(() => {
      const service = window.__versionHistoryService;
      return service ? service.getBufferLength() : -1;
    });
    expect(bufferLength).toBe(expectedLength);
  }
);

When("the squash timer has completed", async function (this: CustomWorld) {
  await forceSquash(this.page);
});

When("I press {string}", async function (this: CustomWorld, keyCombo: string) {
  // We dispatch on document.body to ensure e.target is an HTMLElement
  if (keyCombo === "Control+Z") {
    await this.page.evaluate(() => {
      const event = new KeyboardEvent("keydown", {
        key: "z",
        code: "KeyZ",
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        bubbles: true,
        cancelable: true,
        composed: true,
      });

      // Dispatch on body (not document) so e.target is an HTMLElement
      // The event will bubble up to document where our listener is attached
      document.body.dispatchEvent(event);
    });
  } else if (keyCombo === "Control+Y") {
    await this.page.evaluate(() => {
      const event = new KeyboardEvent("keydown", {
        key: "y",
        code: "KeyY",
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        bubbles: true,
        cancelable: true,
        composed: true,
      });

      document.body.dispatchEvent(event);
    });
  } else if (keyCombo === "Control+Shift+Z") {
    await this.page.evaluate(() => {
      // Browsers report KeyboardEvent.key as "Z" (uppercase) when Shift is
      // held, not "z" - match that here rather than the lowercase used for
      // plain Ctrl+Z above.
      const event = new KeyboardEvent("keydown", {
        key: "Z",
        code: "KeyZ",
        ctrlKey: true,
        metaKey: false,
        shiftKey: true,
        bubbles: true,
        cancelable: true,
        composed: true,
      });

      document.body.dispatchEvent(event);
    });
  }
});
