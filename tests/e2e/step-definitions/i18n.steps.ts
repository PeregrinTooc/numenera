import { Given, Then, When } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

Given("the language is set to {string}", async function (this: CustomWorld, language: string) {
  await this.language.opensTheSheetInLanguage(language);
});

Given(
  "I am on the character sheet page with {string}",
  async function (this: CustomWorld, queryString: string) {
    await this.language.opensTheSheetWith(queryString);
  }
);

When(
  "I navigate to the page with {string}",
  async function (this: CustomWorld, queryString: string) {
    await this.language.opensTheSheetWith(queryString);
  }
);

Then("the page title should be in English", async function (this: CustomWorld) {
  await this.language.expectTitleInEnglish();
});

Then("the language should remain German", async function (this: CustomWorld) {
  await this.language.expectTitleInGerman();
});

Then("the page title should be {string}", async function (this: CustomWorld, expectedText: string) {
  await this.language.expectShows("page title", expectedText);
});

Then(
  "the load button should display {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectShows("load button", expectedText);
  }
);

Then(
  "the new button should display {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectShows("new button", expectedText);
  }
);

Then(
  "the stats heading should be {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectShows("stats heading", expectedText);
  }
);

Then(
  "the might stat should display {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectShows("might stat", expectedText);
  }
);

Then(
  "the speed stat should display {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectShows("speed stat", expectedText);
  }
);

Then(
  "the intellect stat should display {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectShows("intellect stat", expectedText);
  }
);

Then(
  "the cyphers heading should be {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectShows("cyphers heading", expectedText);
  }
);

Then(
  "the artifacts heading should be {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectShows("artifacts heading", expectedText);
  }
);

Then(
  "the oddities heading should be {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectShows("oddities heading", expectedText);
  }
);

Then(
  "the background field label should be {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectShows("background label", expectedText);
  }
);

Then(
  "the notes field label should be {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectShows("notes label", expectedText);
  }
);

Then(
  "the empty cyphers message should be {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectShows("empty cyphers message", expectedText);
  }
);

Then(
  "the empty artifacts message should be {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectShows("empty artifacts message", expectedText);
  }
);

Then(
  "the empty oddities message should be {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectShows("empty oddities message", expectedText);
  }
);

Then(
  "the empty equipment message should be {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectShows("empty equipment message", expectedText);
  }
);

Then(
  "the empty abilities message should be {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectShows("empty abilities message", expectedText);
  }
);

Then(
  "the stat pool label should be {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectStatsSectionMentions(expectedText);
  }
);

Then(
  "the stat edge label should be {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectStatsLabel(expectedText);
  }
);

Then(
  "the stat current label should be {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectStatsLabel(expectedText);
  }
);

Then(
  "cypher level labels should display {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectLevelLabel("cypher", expectedText);
  }
);

Then(
  "artifact level labels should display {string}",
  async function (this: CustomWorld, expectedText: string) {
    await this.language.expectLevelLabel("artifact", expectedText);
  }
);

Then(
  "the page should declare its language as {string}",
  async function (this: CustomWorld, language: string) {
    await this.language.expectDeclaredLanguage(language);
  }
);
