import { Given, Then, When, type DataTable } from "@cucumber/cucumber";
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

Then("the sheet shows these texts:", async function (this: CustomWorld, table: DataTable) {
  await this.language.expectShowsAll(table.hashes().map(({ part, text }) => ({ part, text })));
});

Then(
  "the page should declare its language as {string}",
  async function (this: CustomWorld, language: string) {
    await this.language.expectDeclaredLanguage(language);
  }
);
