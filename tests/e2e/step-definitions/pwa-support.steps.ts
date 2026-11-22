import { readFile, writeFile } from "node:fs/promises";
import { After, Given, When, Then } from "@cucumber/cucumber";
import { expect, type Page } from "@playwright/test";
import type { CustomWorld } from "../support/world.js";
import { waitForCharacterSheetReady } from "../support/app-ready.js";

// The preview server reads the build from disk on every request.
const SERVICE_WORKER_SCRIPT = "dist/sw.js";

interface ManifestIcon {
  sizes?: string;
  type?: string;
}

interface WebAppManifest {
  name?: string;
  short_name?: string;
  start_url?: string;
  display?: string;
  icons?: ManifestIcon[];
}

Then("the character sheet should be installable as an app", async function (this: CustomWorld) {
  const manifestLink = this.page.locator('link[rel="manifest"]');
  await expect(manifestLink).toHaveAttribute("href", /.+/);
  const manifestHref = (await manifestLink.getAttribute("href")) ?? "";
  const response = await this.page.request.get(new URL(manifestHref, this.page.url()).href);
  expect(response.ok()).toBe(true);
  const manifest = (await response.json()) as WebAppManifest;

  expect(manifest.name).toBeTruthy();
  expect(manifest.short_name).toBeTruthy();
  expect(manifest.start_url).toBeTruthy();
  expect(manifest.display).toBe("standalone");
  const pngSizes = (manifest.icons ?? [])
    .filter((icon) => icon.type === "image/png")
    .map((icon) => icon.sizes);
  expect(pngSizes).toEqual(expect.arrayContaining(["192x192", "512x512"]));

  expect(await serviceWorkerIsActive(this.page)).toBe(true);
});

Given("I have opened the character sheet before", async function (this: CustomWorld) {
  await this.character.openSheet();
  expect(await serviceWorkerIsActive(this.page)).toBe(true);
});

When("I lose my connection", async function (this: CustomWorld) {
  await this.page.context().setOffline(true);
});

Then("the character sheet should be displayed", async function (this: CustomWorld) {
  await expect(this.page.getByTestId("character-name")).toBeVisible();
  await this.page.evaluate(() => document.fonts.ready);
});

When("a newer version of the character sheet is published", async function (this: CustomWorld) {
  this.originalServiceWorkerScript = await readFile(SERVICE_WORKER_SCRIPT, "utf8");
  // Browsers compare the worker script byte for byte to detect an update.
  await writeFile(
    SERVICE_WORKER_SCRIPT,
    `${this.originalServiceWorkerScript}\n// newer version ${Date.now()}\n`
  );
});

After(async function (this: CustomWorld) {
  if (this.originalServiceWorkerScript === undefined) return;
  await writeFile(SERVICE_WORKER_SCRIPT, this.originalServiceWorkerScript);
});

Then("I should be told that a newer version is available", async function (this: CustomWorld) {
  await expect(this.page.getByTestId("update-banner")).toBeVisible();
});

When("I accept the newer version", async function (this: CustomWorld) {
  await Promise.all([
    this.page.waitForEvent("load"),
    this.page.getByTestId("update-reload-button").click(),
  ]);
  await waitForCharacterSheetReady(this.page);
});

Then(
  "the newer version of the character sheet should be running",
  async function (this: CustomWorld) {
    await expect(this.page.getByTestId("update-banner")).toBeHidden();
    const noVersionWaiting = await this.page.evaluate(async () => {
      const registration = await window.navigator.serviceWorker.ready;
      return registration.waiting === null;
    });
    expect(noVersionWaiting).toBe(true);
  }
);

/** Resolves once the worker has installed, i.e. finished precaching. */
async function serviceWorkerIsActive(page: Page): Promise<boolean> {
  return page.evaluate(async () => {
    const registration = await window.navigator.serviceWorker.ready;
    return registration.active !== null;
  });
}
