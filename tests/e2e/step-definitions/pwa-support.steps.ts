import { Given, When, Then } from "@cucumber/cucumber";
import { expect, type Page } from "@playwright/test";
import type { CustomWorld } from "../support/world.js";

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

/** Resolves once the worker has installed, i.e. finished precaching. */
async function serviceWorkerIsActive(page: Page): Promise<boolean> {
  return page.evaluate(async () => {
    const registration = await window.navigator.serviceWorker.ready;
    return registration.active !== null;
  });
}
