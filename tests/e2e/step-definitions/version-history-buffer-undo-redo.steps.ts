import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";

Then(
  "I should see {int} versions in history",
  async function (this: CustomWorld, expectedCount: number) {
    const versions = await this.storageHelper.getAllVersions();
    expect(versions.length).toBe(expectedCount);
  }
);
