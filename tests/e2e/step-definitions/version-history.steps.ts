import { Given, When, Then, type DataTable } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";
import { propertyTable } from "../support/tableRows.js";

Given("my character has no history yet", async function (this: CustomWorld) {
  await this.historySeed.startsWithNoHistory();
});

// Every version is saved through the app, which re-reads the whole history per save:
// 99 versions take about 6 s alone on WebKit and several times that on a loaded machine.
Given(
  "my character has a history of {int} versions",
  { timeout: 120000 },
  async function (this: CustomWorld, count: number) {
    await this.historySeed.hasVersions(count);
  }
);

Given(
  "my character has a history of {int} versions with different data",
  async function (this: CustomWorld, count: number) {
    await this.historySeed.hasVersionsWithDifferentData(count);
  }
);

Given(
  "my Might pool went from {int} to {int} to {int}",
  async function (this: CustomWorld, first: number, second: number, third: number) {
    await this.historySeed.hasMightPoolHistory([first, second, third]);
  }
);

Given(
  "my history holds an old version recorded as {string} for an added cypher",
  async function (this: CustomWorld, description: string) {
    await this.historySeed.hasOldVersionRecordedAs(description, "added cypher");
  }
);

Given(
  "my history holds an old version recorded as {string} for a name change and an added ability",
  async function (this: CustomWorld, description: string) {
    await this.historySeed.hasOldVersionRecordedAs(description, "name change and added ability");
  }
);

Given("saving a version is held up", async function (this: CustomWorld) {
  await this.history.holdsVersionSaves();
});

Given("my character has a portrait", async function (this: CustomWorld) {
  await this.historySeed.hasPortrait();
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

When("my edits start to be saved as a version", async function (this: CustomWorld) {
  await this.history.beginsSavingVersion();
});

When("the held-up save goes through", async function (this: CustomWorld) {
  await this.history.releasesHeldVersionSave();
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

Then(
  "my character sheet shows the name it had before my edits",
  async function (this: CustomWorld) {
    await this.history.expectNameBeforeEdits();
  }
);

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

Given(
  "my history has a version in which I changed",
  async function (this: CustomWorld, changes: DataTable) {
    await this.historySeed.hasVersionChangingBasicInfo(propertyTable(changes));
  }
);

Given(
  "my history has a version in which I changed my name to {string}, followed by one in which I changed my tier to {int}",
  async function (this: CustomWorld, name: string, tier: number) {
    await this.historySeed.hasVersionsChangingNameThenTier(name, tier);
  }
);

Given(
  "my history has a version in which I added the cypher {string}",
  async function (this: CustomWorld, name: string) {
    await this.historySeed.hasVersionAddingCypher(name);
  }
);

Given(
  "my history has a version in which I removed the cypher {string}",
  async function (this: CustomWorld, name: string) {
    await this.historySeed.hasVersionRemovingCypher(name);
  }
);

Given(
  "my history has a version in which I changed the effect of the cypher {string}",
  async function (this: CustomWorld, name: string) {
    await this.historySeed.hasVersionChangingCypherEffect(name);
  }
);

Given(
  "my history has a version in which I renamed the cypher {string} to {string}",
  async function (this: CustomWorld, name: string, newName: string) {
    await this.historySeed.hasVersionRenamingCypher(name, newName);
  }
);
