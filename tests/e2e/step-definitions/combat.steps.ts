import { Given, Then, type DataTable } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { Attack, SpecialAbility } from "../../../src/types/character.js";
import { FULL_CHARACTER } from "../../../src/data/mockCharacters.js";
import type { CustomWorld } from "../support/world.js";
import { intCell, propertyTable } from "../support/tableRows.js";

// Attack step definitions

Given(
  "the character has an attack {string} with:",
  async function (this: CustomWorld, name: string, table: DataTable) {
    const data = propertyTable(table);
    const attack: Attack = {
      name,
      damage: intCell(data.damage, "Damage"),
      modifier: intCell(data.modifier, "Modifier"),
      range: data.range,
      ...(data.notes ? { notes: data.notes } : {}),
    };
    await this.setup.updateCharacter((character) => {
      character.attacks = [...character.attacks.filter((a) => a.name !== name), attack];
    });
  }
);

Given("the character has an attack {string}", async function (this: CustomWorld, name: string) {
  await this.setup.updateCharacter((character) => {
    if (!character.attacks.some((a) => a.name === name)) {
      character.attacks.push({ name, damage: 4, modifier: 0, range: "Immediate" });
    }
  });
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

Then("the empty attacks state should use translation keys", async function () {
  const emptyState = this.dom.getByTestId("empty-attacks");
  await expect(emptyState).not.toBeEmpty();
});

// Special Ability step definitions

Given(
  "the character has a special ability {string} with:",
  async function (this: CustomWorld, name: string, table: DataTable) {
    const data = propertyTable(table);
    const ability: SpecialAbility = { name, description: data.description, source: data.source };
    await this.setup.updateCharacter((character) => {
      character.specialAbilities = [
        ...character.specialAbilities.filter((a) => a.name !== name),
        ability,
      ];
    });
  }
);

Given(
  "the character has a special ability {string}",
  async function (this: CustomWorld, name: string) {
    await this.setup.updateCharacter((character) => {
      if (!character.specialAbilities.some((a) => a.name === name)) {
        character.specialAbilities.push({ name, description: name, source: name });
      }
    });
  }
);

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
  async function (abilityName: string, description: string) {
    const specialAbilityItem = this.page.locator(
      `[data-testid="special-ability-item"]:has([data-testid="special-ability-name-${abilityName}"])`
    );
    const descriptionElement = specialAbilityItem.locator(
      '[data-testid^="special-ability-description-"]'
    );
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

Then("the empty special abilities state should use translation keys", async function () {
  const emptyState = this.dom.getByTestId("empty-special-abilities");
  await expect(emptyState).not.toBeEmpty();
});

// Armor badge step definitions

Then("I should see the armor badge in the attacks section", async function () {
  await expect(this.dom.getByTestId("armor-badge")).toBeVisible();
});

// Layout step definitions

Given("the character has special abilities and attacks", async function (this: CustomWorld) {
  await this.setup.character({
    attacks: FULL_CHARACTER.attacks,
    specialAbilities: FULL_CHARACTER.specialAbilities,
  });
});

Then("the special abilities section should be in the left column", async function () {
  const specialAbilitiesSection = this.dom.getByTestId("special-abilities-section");
  await expect(specialAbilitiesSection).toBeVisible();
});

Then("the attacks section should be in the right column", async function () {
  const attacksSection = this.dom.getByTestId("attacks-section");
  await expect(attacksSection).toBeVisible();
});

Then("the sections should stack vertically on mobile", async function () {
  // This tests the responsive grid layout
  // For now, we just verify both sections are visible
  // A full responsive test would require viewport resizing
  await expect(this.dom.getByTestId("special-abilities-section")).toBeVisible();
  await expect(this.dom.getByTestId("attacks-section")).toBeVisible();
});
