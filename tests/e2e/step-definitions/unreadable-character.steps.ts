import { Given, When, Then } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world.js";

Given(
  "the stored character data is the unreadable text {string}",
  async function (this: CustomWorld, text: string) {
    await this.unreadableCharacter.hasStoredUnreadableText(text);
  }
);

Given(
  "the browser holds the unparseable character text {string}",
  async function (this: CustomWorld, text: string) {
    await this.unreadableCharacter.browserHoldsUnparseableText(text);
  }
);

Then(
  "I should be asked what to do with the unreadable character",
  async function (this: CustomWorld) {
    await this.unreadableCharacter.expectAsked();
  }
);

Then("I should not be asked about an unreadable character", async function (this: CustomWorld) {
  await this.unreadableCharacter.expectNotAsked();
});

When(
  "I choose {string} for the unreadable character",
  async function (this: CustomWorld, label: string) {
    await this.unreadableCharacter.chooses(label);
  }
);

When("I download the unreadable character", async function (this: CustomWorld) {
  await this.unreadableCharacter.downloads();
});

Then(
  "the downloaded file should be named like {string}",
  function (this: CustomWorld, pattern: string) {
    this.unreadableCharacter.expectDownloadNamedLike(pattern);
  }
);

Then(
  "the downloaded file should contain exactly {string}",
  function (this: CustomWorld, content: string) {
    this.unreadableCharacter.expectDownloadContains(content);
  }
);

Then(
  "the kept unreadable data should be {string}",
  async function (this: CustomWorld, content: string) {
    await this.unreadableCharacter.expectKeptData(content);
  }
);

Then("no unreadable data should be kept", async function (this: CustomWorld) {
  await this.unreadableCharacter.expectNoDataKept();
});
