import { expect } from "@playwright/test";
import type { CustomWorld } from "./world.js";
import { DOMHelpers } from "./dom-helpers.js";

/**
 * Open the settings panel via the header gear icon and wait for it to become
 * visible. Also waits for the panel's document click-outside listener, which
 * is attached with setTimeout(0), so a step immediately clicking outside the
 * panel doesn't race it.
 */
export async function openSettingsPanel(world: CustomWorld): Promise<void> {
  const dom = new DOMHelpers(world.page);
  await dom.getByTestId("settings-gear-button").click();
  await expect(dom.getByTestId("settings-panel")).toBeVisible();
  await world.page.waitForTimeout(50);
}
