import { Given, When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

Given("my character has no history yet", async function (this: CustomWorld) {
  await this.history.startsWithNoHistory();
});

Given(
  "my character has a history of {int} versions",
  async function (this: CustomWorld, count: number) {
    await this.history.hasVersions(count);
  }
);

Given(
  "my character has a history of {int} versions with different data",
  async function (this: CustomWorld, count: number) {
    await this.history.hasVersionsWithDifferentData(count);
  }
);

Given(
  "my Might pool went from {int} to {int} to {int}",
  async function (this: CustomWorld, first: number, second: number, third: number) {
    await this.history.hasMightPoolHistory([first, second, third]);
  }
);

Given("my character has a portrait", async function (this: CustomWorld) {
  await this.history.hasPortrait();
});

When("I go to version {int}", async function (this: CustomWorld, version: number) {
  await this.history.goesToVersion(version);
});

When("I go to the oldest version", async function (this: CustomWorld) {
  await this.history.goesToOldestVersion();
});

When("I step back to the previous version", async function (this: CustomWorld) {
  await this.history.stepsBack();
});

When("I step forward to the next version", async function (this: CustomWorld) {
  await this.history.stepsForward();
});

When(
  "I step back {int} times in quick succession",
  async function (this: CustomWorld, times: number) {
    await this.history.stepsBackInQuickSuccession(times);
  }
);

When("I restore this version", async function (this: CustomWorld) {
  await this.history.restores();
});

When("I return to the latest version", async function (this: CustomWorld) {
  await this.history.returnsToLatest();
});

When("my edits have settled into a version", async function (this: CustomWorld) {
  await this.history.editsHaveSettled();
});

When("I undo with Ctrl+Z", async function (this: CustomWorld) {
  await this.history.undoes();
});

When("I redo with Ctrl+Y", async function (this: CustomWorld) {
  await this.history.redoes();
});

When("I redo with Ctrl+Shift+Z", async function (this: CustomWorld) {
  await this.history.redoesWithShift();
});

When("I reopen my character", async function (this: CustomWorld) {
  await this.history.reopens();
});

When("I export what I am viewing", async function (this: CustomWorld) {
  await this.history.exports();
});

Then("the navigator is hidden", async function (this: CustomWorld) {
  await this.history.expectNavigatorHidden();
});

Then("I can import a character", async function (this: CustomWorld) {
  await this.history.expectImportAvailable(true);
});

Then("I cannot import a character", async function (this: CustomWorld) {
  await this.history.expectImportAvailable(false);
});

Then("my character sheet shows my original name", async function (this: CustomWorld) {
  await this.history.expectOriginalName();
});

Then("I can edit my character", async function (this: CustomWorld) {
  await this.history.expectEditable();
});

Then(
  "the navigator shows version {int} of {int}",
  async function (this: CustomWorld, current: number, total: number) {
    await this.history.expectPosition(current, total);
  }
);

Then("the back control is available", async function (this: CustomWorld) {
  await this.history.expectBackAvailable(true);
});

Then("the back control is unavailable", async function (this: CustomWorld) {
  await this.history.expectBackAvailable(false);
});

Then("the forward control is available", async function (this: CustomWorld) {
  await this.history.expectForwardAvailable(true);
});

Then("the forward control is unavailable", async function (this: CustomWorld) {
  await this.history.expectForwardAvailable(false);
});

Then("I am warned that I am viewing an old version", async function (this: CustomWorld) {
  await this.history.expectOldVersionWarning();
});

Then("I am not warned about an old version", async function (this: CustomWorld) {
  await this.history.expectNoOldVersionWarning();
});

Then("I can restore this version", async function (this: CustomWorld) {
  await this.history.expectRestoreOffered();
});

Then("I am on the latest version", async function (this: CustomWorld) {
  await this.history.expectOnLatestVersion();
});

Then("the navigator describes this version", async function (this: CustomWorld) {
  await this.history.expectDescribed();
});

Then(
  "the navigator describes this version as {string}",
  async function (this: CustomWorld, text: string) {
    await this.history.expectDescribedAs(text);
  }
);

Then("the navigator dates this version", async function (this: CustomWorld) {
  await this.history.expectDated();
});

Then(
  "the navigator gives the age of this version in relative terms",
  async function (this: CustomWorld) {
    await this.history.expectAgeInRelativeTerms();
  }
);

Then(
  "I see my character as it was in version {int}",
  async function (this: CustomWorld, version: number) {
    await this.history.expectCharacterAsOfVersion(version);
  }
);

Then("the original version has been dropped", async function (this: CustomWorld) {
  await this.history.expectOriginalVersionDropped();
});

Then("my portrait is unchanged", async function (this: CustomWorld) {
  await this.history.expectPortraitUnchanged();
});

Then(
  "the export holds version {int} of my character",
  function (this: CustomWorld, version: number) {
    this.history.expectExportHoldsVersion(version);
  }
);

Then("the export carries no version history", function (this: CustomWorld) {
  this.history.expectExportWithoutHistory();
});

Then("the export keeps my current portrait", function (this: CustomWorld) {
  this.history.expectExportKeepsPortrait();
});
