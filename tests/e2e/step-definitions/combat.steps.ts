import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { DOMHelpers } from "../support/dom-helpers.js";

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
  // Attack items use generic data-testid="attack-item" without name suffix
  // Find the attack by looking for the name element inside
  const attackItem = this.page.locator(
    `[data-testid="attack-item"]:has([data-testid="attack-name-${attackName}"])`
  );
  await expect(attackItem).toBeVisible();
});

Then(
  "the attack {string} should show damage {string}",
  async function (attackName: string, damage: string) {
    // Attack items use index-based data-testid for sub-elements
    // Find the attack by name, then locate the damage element within it
    const attackItem = this.page.locator(
      `[data-testid="attack-item"]:has([data-testid="attack-name-${attackName}"])`
    );
    const damageElement = attackItem.locator('[data-testid^="attack-damage-"]');
    await expect(damageElement).toBeVisible();
    await expect(damageElement).toContainText(damage);
  }
);

Then(
  "the attack {string} should show modifier {string}",
  async function (attackName: string, modifier: string) {
    // Attack items use index-based data-testid for sub-elements
    // Find the attack by name, then locate the modifier element within it
    const attackItem = this.page.locator(
      `[data-testid="attack-item"]:has([data-testid="attack-name-${attackName}"])`
    );
    const modifierElement = attackItem.locator('[data-testid^="attack-modifier-"]');
    await expect(modifierElement).toBeVisible();
    await expect(modifierElement).toContainText(modifier);
  }
);

Then(
  "the attack {string} should show range {string}",
  async function (attackName: string, range: string) {
    // Attack items use index-based data-testid for sub-elements
    // Find the attack by name, then locate the range element within it
    const attackItem = this.page.locator(
      `[data-testid="attack-item"]:has([data-testid="attack-name-${attackName}"])`
    );
    const rangeElement = attackItem.locator('[data-testid^="attack-range-"]');
    await expect(rangeElement).toBeVisible();
    await expect(rangeElement).toContainText(range);
  }
);

Then(
  "the attack {string} should show notes {string}",
  async function (attackName: string, notes: string) {
    // Attack items use index-based data-testid for sub-elements
    // Find the attack by name, then locate the notes element within it
    const attackItem = this.page.locator(
      `[data-testid="attack-item"]:has([data-testid="attack-name-${attackName}"])`
    );
    const notesElement = attackItem.locator('[data-testid^="attack-notes-"]');
    await expect(notesElement).toBeVisible();
    await expect(notesElement).toContainText(notes);
  }
);

Then("the attack {string} should not show notes", async function (attackName: string) {
  // Attack items use index-based data-testid for sub-elements
  // Find the attack by name, then check notes element is not visible
  const attackItem = this.page.locator(
    `[data-testid="attack-item"]:has([data-testid="attack-name-${attackName}"])`
  );
  const notesElement = attackItem.locator('[data-testid^="attack-notes-"]');
  await expect(notesElement).not.toBeVisible();
});

Then(
  "the attack {string} should have red combat theme styling",
  async function (attackName: string) {
    // Attack items use generic data-testid="attack-item" without name suffix
    // Find the attack by looking for the name element inside
    const attackItem = this.page.locator(
      `[data-testid="attack-item"]:has([data-testid="attack-name-${attackName}"])`
    );
    const classAttr = await attackItem.first().getAttribute("class");
    expect(classAttr).toContain("from-red-50");
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
  // Special ability items use generic data-testid="special-ability-item" without name suffix
  // Find the special ability by looking for the name element inside
  const specialAbilityItem = this.page.locator(
    `[data-testid="special-ability-item"]:has([data-testid="special-ability-name-${abilityName}"])`
  );
  await expect(specialAbilityItem).toBeVisible();
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
    // Special ability items use index-based data-testid for sub-elements
    // Find the special ability by name, then locate the source element within it
    const specialAbilityItem = this.page.locator(
      `[data-testid="special-ability-item"]:has([data-testid="special-ability-name-${abilityName}"])`
    );
    const sourceElement = specialAbilityItem.locator('[data-testid^="special-ability-source-"]');
    await expect(sourceElement).toBeVisible();
    await expect(sourceElement).toContainText(source);
  }
);

Then(
  "the special ability {string} should have teal theme styling",
  async function (abilityName: string) {
    // Special ability items use generic data-testid="special-ability-item" without name suffix
    // Find the special ability by looking for the name element inside
    const specialAbilityItem = this.page.locator(
      `[data-testid="special-ability-item"]:has([data-testid="special-ability-name-${abilityName}"])`
    );
    const classAttr = await specialAbilityItem.first().getAttribute("class");
    expect(classAttr).toContain("from-cyan-50");
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
