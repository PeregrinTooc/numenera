import { Then, When } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

Then(
  "the {string} section should show its cards in {int} column\\(s)",
  async function (this: CustomWorld, section: string, columns: number) {
    await this.sectionColumns.expectShownInColumns(section, columns);
  }
);

Then(
  "the {word} pane should show its cyphers in {int} column\\(s)",
  async function (this: CustomWorld, side: string, columns: number) {
    await this.sectionColumns.expectComparePaneCyphersInColumns(side, columns);
  }
);

When(
  "I switch the {string} section to {int} column\\(s)",
  async function (this: CustomWorld, section: string, columns: number) {
    await this.sectionColumns.switchTo(section, columns);
  }
);

Then(
  "the {string} section should offer a column switch",
  async function (this: CustomWorld, section: string) {
    await this.sectionColumns.expectSwitchOffered(section);
  }
);

Then(
  "the {string} section should offer no column switch",
  async function (this: CustomWorld, section: string) {
    await this.sectionColumns.expectNoSwitchOffered(section);
  }
);

Then(
  "the max cyphers badge should be left of the {string} heading",
  async function (this: CustomWorld, section: string) {
    await this.sectionColumns.expectMaxCyphersBadgeLeftOfHeading(section);
  }
);

Then(
  "the shins badge should be left of the {string} heading",
  async function (this: CustomWorld, section: string) {
    await this.sectionColumns.expectShinsBadgeLeftOfHeading(section);
  }
);

Then("the armor badge should not cover the add attack button", async function (this: CustomWorld) {
  await this.sectionColumns.expectArmorBadgeClearOfAddAttack();
});

Then(
  "the {string} heading row should stay inside its frame",
  async function (this: CustomWorld, section: string) {
    await this.sectionColumns.expectHeadingRowInsideFrame(section);
  }
);

Then("every ability card's badges should stay inside the card", async function (this: CustomWorld) {
  await this.sectionColumns.expectAbilityBadgesInsideCards();
});
