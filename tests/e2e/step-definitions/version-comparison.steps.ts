import { Given, When, Then, type DataTable } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";
import type { Highlight, Pane } from "../support/comparisonDriver.js";

Given("comparison view is switched on in settings", async function (this: CustomWorld) {
  await this.comparison.switchesOn();
});

When("I switch on comparison view in settings", async function (this: CustomWorld) {
  await this.comparison.switchesOn();
});

Given("I am viewing the comparison view", async function (this: CustomWorld) {
  await this.comparison.opens();
});

When(
  "I step the {pane} pane back to the previous version",
  async function (this: CustomWorld, pane: Pane) {
    await this.comparison.stepsBack(pane);
  }
);

When(
  "I step the {pane} pane forward to the next version",
  async function (this: CustomWorld, pane: Pane) {
    await this.comparison.stepsForward(pane);
  }
);

When(
  "I move the {pane} pane to version {int}",
  async function (this: CustomWorld, pane: Pane, version: number) {
    await this.comparison.movesTo(pane, version);
  }
);

When("I restore the version in the {pane} pane", async function (this: CustomWorld, pane: Pane) {
  await this.comparison.restores(pane);
});

When("I return to editing", async function (this: CustomWorld) {
  await this.comparison.exits();
});

Then("comparison view is still switched on in settings", async function (this: CustomWorld) {
  await this.comparison.expectSwitchedOn();
});

Then("the comparison view is shown", async function (this: CustomWorld) {
  await this.comparison.expectShown(true);
});

Then("the comparison view is not shown", async function (this: CustomWorld) {
  await this.comparison.expectShown(false);
});

Then(
  "the {pane} pane shows version {int}",
  async function (this: CustomWorld, pane: Pane, version: number) {
    await this.comparison.expectShowsVersion(pane, version);
  }
);

Then(
  "the {pane} pane shows my character as it was in version {int}",
  async function (this: CustomWorld, pane: Pane, version: number) {
    await this.comparison.expectShowsCharacterOfVersion(pane, version);
  }
);

Then("the {pane} pane can restore its version", async function (this: CustomWorld, pane: Pane) {
  await this.comparison.expectRestoreAvailable(pane, true);
});

Then("the {pane} pane cannot restore its version", async function (this: CustomWorld, pane: Pane) {
  await this.comparison.expectRestoreAvailable(pane, false);
});

Then(
  "my history gains a version restored from version {int}",
  async function (this: CustomWorld, version: number) {
    await this.comparison.expectNewestVersionRestoredFrom(version);
  }
);

Then(
  "the comparison header lists exactly these changes",
  async function (this: CustomWorld, changes: DataTable) {
    await this.comparison.expectHeaderLists(changes.raw().map(([change]) => change));
  }
);

Then("the comparison header says there are no differences", async function (this: CustomWorld) {
  await this.comparison.expectHeaderSaysNoDifferences();
});

Then(
  "the {word} is highlighted yellow in both panes",
  async function (this: CustomWorld, field: string) {
    await this.comparison.expectBasicInfoHighlightedInBothPanes(field);
  }
);

Then(
  "the {word} is not highlighted in either pane",
  async function (this: CustomWorld, field: string) {
    await this.comparison.expectBasicInfoHighlightedInNeitherPane(field);
  }
);

Then(
  "the cypher {string} is highlighted {colour} in the {pane} pane",
  async function (this: CustomWorld, name: string, colour: Highlight, pane: Pane) {
    await this.comparison.expectCypherHighlighted(pane, name, colour);
  }
);

Then(
  "the cypher {string} is highlighted {colour} in both panes",
  async function (this: CustomWorld, name: string, colour: Highlight) {
    await this.comparison.expectCypherHighlightedInBothPanes(name, colour);
  }
);

Then(
  "the {pane} pane does not show the cypher {string}",
  async function (this: CustomWorld, pane: Pane, name: string) {
    await this.comparison.expectCypherAbsent(pane, name);
  }
);

Then("nothing in the comparison view can be edited", async function (this: CustomWorld) {
  await this.comparison.expectReadOnly();
});
