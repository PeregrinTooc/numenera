// Step definitions for card deletion feature
import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";

// Visibility steps
When("I look at a cypher card", async function (this: CustomWorld) {
  // Just verify cypher section exists
  await expect(this.page.locator('[data-testid="cyphers-section"]')).toBeVisible();
});

When("I look at an equipment card", async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="items-section"]')).toBeVisible();
});

When("I look at an artifact card", async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="items-section"]')).toBeVisible();
});

When("I look at an oddity card", async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="items-section"]')).toBeVisible();
});

When("I look at an attack card", async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="attacks-section"]')).toBeVisible();
});

When("I look at an ability card", async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="abilities-section"]')).toBeVisible();
});

When("I look at a special ability card", async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="special-abilities-section"]')).toBeVisible();
});

// The fixed " card" suffix is uniform across all 7 types (unlike "removed
// from the DOM" and "remaining" below, where "equipment item" and irregular
// plurals break a single {cardType} pattern), so this family collapses cleanly.
Then(
  "I should see a delete button on the {cardType} card",
  async function (this: CustomWorld, cardType: string) {
    await expect(this.cards.deleteButtonLocator(cardType)).toBeVisible();
  }
);

// Setup steps for multiple cards. Each phrasing pluralises differently
// ("equipment items", "abilities", "special abilities" vs. plain "artifact")
// so this stays 7 registrations; each now shares this.cards.count() instead
// of a local selector-string lookup.
Given("I have {int} cyphers", async function (this: CustomWorld, count: number) {
  // This assumes the character data already has the required number
  // If not, we'd need to manipulate the character data
  const actualCount = await this.cards.count("cypher");
  if (actualCount < count) {
    throw new Error(`Expected ${count} cyphers but found ${actualCount}`);
  }
});

Given("I have {int} equipment items", async function (this: CustomWorld, count: number) {
  const actualCount = await this.cards.count("equipment");
  if (actualCount < count) {
    throw new Error(`Expected ${count} equipment items but found ${actualCount}`);
  }
});

Given("I have {int} artifact", async function (this: CustomWorld, count: number) {
  const actualCount = await this.cards.count("artifact");
  if (actualCount < count) {
    throw new Error(`Expected ${count} artifact but found ${actualCount}`);
  }
});

Given("I have {int} oddities", async function (this: CustomWorld, count: number) {
  const actualCount = await this.cards.count("oddity");
  if (actualCount < count) {
    throw new Error(`Expected ${count} oddities but found ${actualCount}`);
  }
});

Given("I have {int} attacks", async function (this: CustomWorld, count: number) {
  const actualCount = await this.cards.count("attack");
  if (actualCount < count) {
    throw new Error(`Expected ${count} attacks but found ${actualCount}`);
  }
});

Given("I have {int} abilities", async function (this: CustomWorld, count: number) {
  const actualCount = await this.cards.count("ability");
  if (actualCount < count) {
    throw new Error(`Expected ${count} abilities but found ${actualCount}`);
  }
});

Given("I have {int} special abilities", async function (this: CustomWorld, count: number) {
  const actualCount = await this.cards.count("special-ability");
  if (actualCount < count) {
    throw new Error(`Expected ${count} special abilities but found ${actualCount}`);
  }
});

// Deletion action steps
async function clickFirstCypherDelete(this: CustomWorld): Promise<void> {
  await this.cards.clickDeleteButton("cypher");
}
When("I click the delete button on the first cypher", clickFirstCypherDelete);
When("I click the delete button on the first cypher again", clickFirstCypherDelete);

When("I click the delete button on the first equipment item", async function (this: CustomWorld) {
  await this.cards.clickDeleteButton("equipment");
});

When("I click the delete button on the first artifact", async function (this: CustomWorld) {
  await this.cards.clickDeleteButton("artifact");
});

When("I click the delete button on the first oddity", async function (this: CustomWorld) {
  await this.cards.clickDeleteButton("oddity");
});

When("I click the delete button on the first attack", async function (this: CustomWorld) {
  await this.cards.clickDeleteButton("attack");
});

When("I click the delete button on the first ability", async function (this: CustomWorld) {
  await this.cards.clickDeleteButton("ability");
});

When("I click the delete button on the first special ability", async function (this: CustomWorld) {
  await this.cards.clickDeleteButton("special-ability");
});

// Verification steps. "equipment item" carries an extra word {cardType}
// doesn't, so this stays 7 registrations, each now delegating to
// this.cards.expectRemoved() instead of a local selector-map lookup.
Then("the cypher should be removed from the DOM", async function (this: CustomWorld) {
  await this.cards.expectRemoved("cypher");
});

Then("the equipment item should be removed from the DOM", async function (this: CustomWorld) {
  await this.cards.expectRemoved("equipment");
});

Then("the artifact should be removed from the DOM", async function (this: CustomWorld) {
  await this.cards.expectRemoved("artifact");
});

Then("the oddity should be removed from the DOM", async function (this: CustomWorld) {
  await this.cards.expectRemoved("oddity");
});

Then("the attack should be removed from the DOM", async function (this: CustomWorld) {
  await this.cards.expectRemoved("attack");
});

Then("the ability should be removed from the DOM", async function (this: CustomWorld) {
  await this.cards.expectRemoved("ability");
});

Then("the special ability should be removed from the DOM", async function (this: CustomWorld) {
  await this.cards.expectRemoved("special-ability");
});

// Count verification steps - singular. Irregular plurals (oddities,
// abilities) and the "equipment item(s)" extra word mean {cardType} can't
// cover every phrasing here, so these stay individually registered; each
// now shares this.cards.count() instead of a local selector-map lookup.
Then("I should have {int} cypher(s) remaining", async function (this: CustomWorld, count: number) {
  const actualCount = await this.cards.count("cypher");
  expect(actualCount).toBe(count);
});

Then("I should have {int} oddity remaining", async function (this: CustomWorld, count: number) {
  const actualCount = await this.cards.count("oddity");
  expect(actualCount).toBe(count);
});

Then("I should have {int} attack remaining", async function (this: CustomWorld, count: number) {
  const actualCount = await this.cards.count("attack");
  expect(actualCount).toBe(count);
});

Then(
  "I should have {int} special ability remaining",
  async function (this: CustomWorld, count: number) {
    const actualCount = await this.cards.count("special-ability");
    expect(actualCount).toBe(count);
  }
);

// Count verification steps - plural
Then(
  "I should have {int} equipment items remaining",
  async function (this: CustomWorld, count: number) {
    const actualCount = await this.cards.count("equipment");
    expect(actualCount).toBe(count);
  }
);

Then("I should have {int} artifacts remaining", async function (this: CustomWorld, count: number) {
  const actualCount = await this.cards.count("artifact");
  expect(actualCount).toBe(count);
});

Then("I should have {int} abilities remaining", async function (this: CustomWorld, count: number) {
  const actualCount = await this.cards.count("ability");
  expect(actualCount).toBe(count);
});

// Position verification
Then(
  "the delete button should be in the top-left corner of the card",
  async function (this: CustomWorld) {
    const deleteButton = this.cards.deleteButtonLocator("cypher");
    await expect(deleteButton).toBeVisible();

    // Check if the button has the correct positioning classes
    const classes = await deleteButton.getAttribute("class");
    expect(classes).toContain("absolute");
    expect(classes).toContain("top-2");
    expect(classes).toContain("left-2");
  }
);

// No confirmation dialog
Then("the cypher should be removed immediately", async function (this: CustomWorld) {
  // This is tested by the fact that it's removed without needing additional interaction
  await this.page.waitForTimeout(100);
});

Then("I should not see a confirmation dialog", async function (this: CustomWorld) {
  // Check that no modal or dialog is visible
  const modal = this.page.locator('[data-testid="card-modal-backdrop"]');
  await expect(modal).not.toBeVisible();
});
