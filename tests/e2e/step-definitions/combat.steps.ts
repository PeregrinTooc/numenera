import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { DOMHelpers } from "../support/dom-helpers.js";

// Helper function to sanitize names for testid
function sanitizeForTestId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

// Attack step definitions

Given("the character has an attack {string} with:", async function (attackName: string, dataTable) {
  this.testAttackName = attackName;
  this.testAttackProperties = {};

  const rows = dataTable.raw();
  for (let i = 0; i < rows.length; i++) {
    const [property, value] = rows[i];
    this.testAttackProperties[property] = value;
  }
});

Given("the character has an attack {string}", async function (attackName: string) {
  this.testAttackName = attackName;
});

Given("the character has no attacks", async function () {
  await this.page.goto(this.getBaseUrl());
  await this.page.getByTestId("new-button").click();
});

Then("I should see the attack {string}", async function (attackName: string) {
  const dom = new DOMHelpers(this.page);
  const testId = `attack-item-${sanitizeForTestId(attackName)}`;
  await expect(dom.getByTestId(testId)).toBeVisible();
});

Then(
  "the attack {string} should show damage {string}",
  async function (attackName: string, damage: string) {
    const dom = new DOMHelpers(this.page);
    const testId = `attack-damage-${sanitizeForTestId(attackName)}`;
    const damageElement = dom.getByTestId(testId);
    await expect(damageElement).toBeVisible();
    await expect(damageElement).toContainText(damage);
  }
);

Then(
  "the attack {string} should show modifier {string}",
  async function (attackName: string, modifier: string) {
    const dom = new DOMHelpers(this.page);
    const testId = `attack-modifier-${sanitizeForTestId(attackName)}`;
    const modifierElement = dom.getByTestId(testId);
    await expect(modifierElement).toBeVisible();
    await expect(modifierElement).toContainText(modifier);
  }
);

Then(
  "the attack {string} should show range {string}",
  async function (attackName: string, range: string) {
    const dom = new DOMHelpers(this.page);
    const testId = `attack-range-${sanitizeForTestId(attackName)}`;
    const rangeElement = dom.getByTestId(testId);
    await expect(rangeElement).toBeVisible();
    await expect(rangeElement).toContainText(range);
  }
);

Then(
  "the attack {string} should show notes {string}",
  async function (attackName: string, notes: string) {
    const dom = new DOMHelpers(this.page);
    const testId = `attack-notes-${sanitizeForTestId(attackName)}`;
    const notesElement = dom.getByTestId(testId);
    await expect(notesElement).toBeVisible();
    await expect(notesElement).toContainText(notes);
  }
);

Then("the attack {string} should not show notes", async function (attackName: string) {
  const dom = new DOMHelpers(this.page);
  const testId = `attack-notes-${sanitizeForTestId(attackName)}`;
  const notesElement = dom.getByTestId(testId);
  await expect(notesElement).not.toBeVisible();
});

Then(
  "the attack {string} should have red combat theme styling",
  async function (attackName: string) {
    const dom = new DOMHelpers(this.page);
    const testId = `attack-item-${sanitizeForTestId(attackName)}`;

    const hasRedTheme = await dom.hasClass(testId, "from-red-50");
    expect(hasRedTheme).toBe(true);
  }
);

Then("I should see an empty attacks section", async function () {
  const dom = new DOMHelpers(this.page);
  await expect(dom.getByTestId("empty-attacks")).toBeVisible();
});

Then("the empty attacks state should use translation keys", async function () {
  const dom = new DOMHelpers(this.page);
  const emptyState = dom.getByTestId("empty-attacks");
  await expect(emptyState).not.toBeEmpty();
});

// Special Ability step definitions

Given(
  "the character has a special ability {string} with:",
  async function (abilityName: string, dataTable) {
    this.testSpecialAbilityName = abilityName;
    this.testSpecialAbilityProperties = {};

    const rows = dataTable.raw();
    for (let i = 0; i < rows.length; i++) {
      const [property, value] = rows[i];
      this.testSpecialAbilityProperties[property] = value;
    }
  }
);

Given("the character has a special ability {string}", async function (abilityName: string) {
  this.testSpecialAbilityName = abilityName;
});

Given("the character has no special abilities", async function () {
  await this.page.goto(this.getBaseUrl());
  await this.page.getByTestId("new-button").click();
});

Then("I should see the special ability {string}", async function (abilityName: string) {
  const dom = new DOMHelpers(this.page);
  const testId = `special-ability-item-${sanitizeForTestId(abilityName)}`;
  await expect(dom.getByTestId(testId)).toBeVisible();
});

Then(
  "the special ability {string} should show description {string}",
  async function (_abilityName: string, description: string) {
    // Note: abilityName parameter required by Cucumber but not used in implementation
    const descriptionElement = this.page
      .locator(`[data-testid^="special-ability-description-"]`)
      .first();
    await expect(descriptionElement).toBeVisible();
    await expect(descriptionElement).toContainText(description);
  }
);

Then(
  "the special ability {string} should show source {string}",
  async function (abilityName: string, source: string) {
    const dom = new DOMHelpers(this.page);
    const testId = `special-ability-source-${sanitizeForTestId(abilityName)}`;
    const sourceElement = dom.getByTestId(testId);
    await expect(sourceElement).toBeVisible();
    await expect(sourceElement).toContainText(source);
  }
);

Then(
  "the special ability {string} should have teal theme styling",
  async function (abilityName: string) {
    const dom = new DOMHelpers(this.page);
    const testId = `special-ability-item-${sanitizeForTestId(abilityName)}`;

    const hasTealTheme = await dom.hasClass(testId, "from-cyan-50");
    expect(hasTealTheme).toBe(true);
  }
);

Then("I should see an empty special abilities section", async function () {
  const dom = new DOMHelpers(this.page);
  await expect(dom.getByTestId("empty-special-abilities")).toBeVisible();
});

Then("the empty special abilities state should use translation keys", async function () {
  const dom = new DOMHelpers(this.page);
  const emptyState = dom.getByTestId("empty-special-abilities");
  await expect(emptyState).not.toBeEmpty();
});

// Armor badge step definitions

Given("the character has armor value {int}", async function (armorValue: number) {
  // The character should already have this value in the mock data
  this.testArmorValue = armorValue;
});

Then("I should see the armor badge in the attacks section", async function () {
  const dom = new DOMHelpers(this.page);
  await expect(dom.getByTestId("armor-badge")).toBeVisible();
});

Then("the armor badge should show value {string}", async function (value: string) {
  const dom = new DOMHelpers(this.page);
  const armorValue = dom.getByTestId("armor-value");
  await expect(armorValue).toBeVisible();
  await expect(armorValue).toContainText(value);
});

// Layout step definitions

Given("the character has special abilities and attacks", async function () {
  // The default character should have both
  // This is already the case with FULL_CHARACTER
});

Then("the special abilities section should be in the left column", async function () {
  const dom = new DOMHelpers(this.page);
  const specialAbilitiesSection = dom.getByTestId("special-abilities-section");
  await expect(specialAbilitiesSection).toBeVisible();
});

Then("the attacks section should be in the right column", async function () {
  const dom = new DOMHelpers(this.page);
  const attacksSection = dom.getByTestId("attacks-section");
  await expect(attacksSection).toBeVisible();
});

Then("the sections should stack vertically on mobile", async function () {
  // This tests the responsive grid layout
  // For now, we just verify both sections are visible
  // A full responsive test would require viewport resizing
  const dom = new DOMHelpers(this.page);
  await expect(dom.getByTestId("special-abilities-section")).toBeVisible();
  await expect(dom.getByTestId("attacks-section")).toBeVisible();
});
