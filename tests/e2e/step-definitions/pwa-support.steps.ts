import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
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

  const workerIsActive = await this.page.evaluate(async () => {
    const registration = await window.navigator.serviceWorker.ready;
    return registration.active !== null;
  });
  expect(workerIsActive).toBe(true);
});
