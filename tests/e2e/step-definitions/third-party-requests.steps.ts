import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world.js";
import { waitForCharacterSheetReady } from "../support/app-ready.js";

When("I open the character sheet and watch its requests", async function (this: CustomWorld) {
  const requestedUrls: string[] = [];
  this.requestedUrls = requestedUrls;
  this.page.on("request", (request) => requestedUrls.push(request.url()));
  await this.page.goto(this.getBaseUrl());
  await waitForCharacterSheetReady(this.page);
  // Fonts are only requested once text needs them
  await this.page.evaluate(() => document.fonts.ready);
});

Then("nothing should have been requested from another site", function (this: CustomWorld) {
  const ownOrigin = new URL(this.getBaseUrl()).origin;
  const elsewhere = (this.requestedUrls ?? []).filter(
    (url) => /^https?:/.test(url) && new URL(url).origin !== ownOrigin
  );
  expect(elsewhere).toEqual([]);
});

Then(
  "the {string} and {string} fonts should be loaded",
  async function (this: CustomWorld, first: string, second: string) {
    const loaded = await this.page.evaluate(() =>
      [...document.fonts]
        .filter((face) => face.status === "loaded")
        .map((face) => face.family.replace(/"/g, ""))
    );
    expect(loaded).toEqual(expect.arrayContaining([first, second]));
  }
);
