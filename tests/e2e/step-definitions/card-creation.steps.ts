import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";

// ============================================================================
// PRECONDITION STEPS
// ============================================================================

Given("the character has {int} cypher card", async function (this: CustomWorld, count: number) {
  // Set up character data in localStorage with the correct number of cyphers
  // The FULL_CHARACTER from mockCharacters.ts has 2 cyphers
  if (count === 2) {
    // Load FULL_CHARACTER which has 2 cyphers
    await this.page!.evaluate(() => {
      const FULL_CHARACTER = {
        name: "Kael the Wanderer",
        tier: 3,
        type: "Glaive",
        descriptor: "Strong",
        focus: "Bears a Halo of Fire",
        xp: 12,
        shins: 47,
        armor: 2,
        effort: 3,
        maxCyphers: 4,
        stats: {
          might: { pool: 15, edge: 2, current: 12 },
          speed: { pool: 12, edge: 1, current: 12 },
          intellect: { pool: 10, edge: 0, current: 8 },
        },
        cyphers: [
          { name: "Detonation (Cell)", level: "1d6+2", effect: "Explodes in an immediate radius" },
          { name: "Stim (Injector)", level: "1d6", effect: "Restores 1d6 + 2 points to one Pool" },
        ],
        artifacts: [
          { name: "Lightning Rod", level: "6", effect: "Projects lightning bolt up to long range" },
        ],
        oddities: [
          "A glowing cube that hums when near water",
          "A piece of transparent metal that's always cold",
        ],
        abilities: [],
        equipment: [],
        attacks: [],
        specialAbilities: [],
        recoveryRolls: {
          action: false,
          tenMinutes: false,
          oneHour: false,
          tenHours: false,
          modifier: 0,
        },
        damageTrack: { impairment: "healthy" },
        textFields: { background: "", notes: "" },
      };
      localStorage.setItem("numenera-character", JSON.stringify(FULL_CHARACTER));
    });
    // Reload the page to apply the character data
    await this.page!.reload({ waitUntil: "load" });
    // Wait for cypher items to be rendered
    await this.page!.waitForSelector('[data-testid="cypher-item"]', { timeout: 5000 });
  }

  // Verify the character has the expected number of cypher cards
  const cards = this.page!.locator('[data-testid="cypher-item"]');
  await expect(cards).toHaveCount(count);
});

Given("the character has {int} cypher cards", async function (this: CustomWorld, count: number) {
  // Set up character data in localStorage with the correct number of cyphers
  // The FULL_CHARACTER from mockCharacters.ts has 2 cyphers
  if (count === 2) {
    // Load FULL_CHARACTER which has 2 cyphers
    await this.page!.evaluate(() => {
      const FULL_CHARACTER = {
        name: "Kael the Wanderer",
        tier: 3,
        type: "Glaive",
        descriptor: "Strong",
        focus: "Bears a Halo of Fire",
        xp: 12,
        shins: 47,
        armor: 2,
        effort: 3,
        maxCyphers: 4,
        stats: {
          might: { pool: 15, edge: 2, current: 12 },
          speed: { pool: 12, edge: 1, current: 12 },
          intellect: { pool: 10, edge: 0, current: 8 },
        },
        cyphers: [
          { name: "Detonation (Cell)", level: "1d6+2", effect: "Explodes in an immediate radius" },
          { name: "Stim (Injector)", level: "1d6", effect: "Restores 1d6 + 2 points to one Pool" },
        ],
        artifacts: [
          { name: "Lightning Rod", level: "6", effect: "Projects lightning bolt up to long range" },
        ],
        oddities: [
          "A glowing cube that hums when near water",
          "A piece of transparent metal that's always cold",
        ],
        abilities: [],
        equipment: [],
        attacks: [],
        specialAbilities: [],
        recoveryRolls: {
          action: false,
          tenMinutes: false,
          oneHour: false,
          tenHours: false,
          modifier: 0,
        },
        damageTrack: { impairment: "healthy" },
        textFields: { background: "", notes: "" },
      };
      localStorage.setItem("numenera-character", JSON.stringify(FULL_CHARACTER));
    });
    // Reload the page to apply the character data
    await this.page!.reload({ waitUntil: "load" });
    // Wait for cypher items to be rendered
    await this.page!.waitForSelector('[data-testid="cypher-item"]', { timeout: 5000 });
  }

  // Verify the character has the expected number of cypher cards
  const cards = this.page!.locator('[data-testid="cypher-item"]');
  await expect(cards).toHaveCount(count);
});

// ============================================================================
// ADD BUTTON VISIBILITY STEPS
// ============================================================================

Then("I should see an add cypher button", async function (this: CustomWorld) {
  const button = this.page!.locator('[data-testid="add-cypher-button"]');
  await expect(button).toBeVisible();
});

// ============================================================================
// ADD BUTTON CLICK STEPS
// ============================================================================

When("I click the add cypher button", async function (this: CustomWorld) {
  const button = this.page!.locator('[data-testid="add-cypher-button"]');
  await button.click();
  // Wait for card edit modal to be visible
  await this.page!.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
});

// ============================================================================
// MODAL FIELD VERIFICATION STEPS
// ============================================================================

Then("the modal should show cypher fields", async function (this: CustomWorld) {
  // Verify cypher-specific fields are present
  const nameField = this.page!.locator('[data-testid="edit-cypher-name"]');
  const levelField = this.page!.locator('[data-testid="edit-cypher-level"]');
  const effectField = this.page!.locator('[data-testid="edit-cypher-effect"]');

  await expect(nameField).toBeVisible();
  await expect(levelField).toBeVisible();
  await expect(effectField).toBeVisible();
});

Then("all cypher fields should be empty", async function (this: CustomWorld) {
  // Verify all cypher fields are empty
  const nameField = this.page!.locator('[data-testid="edit-cypher-name"]');
  const levelField = this.page!.locator('[data-testid="edit-cypher-level"]');
  const effectField = this.page!.locator('[data-testid="edit-cypher-effect"]');

  await expect(nameField).toHaveValue("");
  await expect(levelField).toHaveValue("");
  await expect(effectField).toHaveValue("");
});

// ============================================================================
// FIELD FILLING STEPS
// ============================================================================

When("I fill in the cypher name with {string}", async function (this: CustomWorld, value: string) {
  const field = this.page!.locator('[data-testid="edit-cypher-name"]');
  await field.fill(value);
});

When("I fill in the cypher level with {string}", async function (this: CustomWorld, value: string) {
  const field = this.page!.locator('[data-testid="edit-cypher-level"]');
  await field.fill(value);
});

When(
  "I fill in the cypher effect with {string}",
  async function (this: CustomWorld, value: string) {
    const field = this.page!.locator('[data-testid="edit-cypher-effect"]');
    await field.fill(value);
  }
);

// ============================================================================
// CARD VERIFICATION STEPS
// ============================================================================

Then("I should see {int} cypher card", async function (this: CustomWorld, count: number) {
  // Wait a moment for cards to render
  await this.page!.waitForTimeout(100);

  const cards = this.page!.locator('[data-testid="cypher-item"]');
  await expect(cards).toHaveCount(count);
});

Then("I should see {int} cypher cards", async function (this: CustomWorld, count: number) {
  // Wait a moment for cards to render
  await this.page!.waitForTimeout(100);

  const cards = this.page!.locator('[data-testid="cypher-item"]');
  await expect(cards).toHaveCount(count);
});

Then(
  "I should see a cypher card with name {string}",
  async function (this: CustomWorld, name: string) {
    // Wait a moment for the card to render
    await this.page!.waitForTimeout(100);

    // Look for a cypher card containing this name
    const cypherCard = this.page!.locator('[data-testid="cypher-item"]').filter({
      hasText: name,
    });
    await expect(cypherCard).toBeVisible();
  }
);

Then(
  "the cypher {string} should have level {string}",
  async function (this: CustomWorld, name: string, level: string) {
    // Find the cypher card by name and verify its level
    const cypherCard = this.page!.locator('[data-testid="cypher-item"]').filter({
      hasText: name,
    });
    await expect(cypherCard).toContainText(`${level}`);
  }
);

Then(
  "the cypher {string} should have effect {string}",
  async function (this: CustomWorld, name: string, effect: string) {
    // Find the cypher card by name and verify its effect
    const cypherCard = this.page!.locator('[data-testid="cypher-item"]').filter({
      hasText: name,
    });
    await expect(cypherCard).toContainText(effect);
  }
);

// ============================================================================
// MODAL INTERACTION STEPS
// ============================================================================

When("I confirm the card edit modal", async function (this: CustomWorld) {
  const confirmButton = this.page!.locator('[data-testid="card-modal-confirm"]');
  await confirmButton.click();
  // Wait for modal to close
  await this.page!.waitForSelector('[data-testid="card-edit-modal"]', {
    state: "hidden",
    timeout: 2000,
  }).catch(() => {
    // Modal might already be hidden
  });
  // Wait a moment for the re-render to complete
  await this.page!.waitForTimeout(200);
});

When("I cancel the card edit modal", async function (this: CustomWorld) {
  const cancelButton = this.page!.locator('[data-testid="card-modal-cancel"]');
  await cancelButton.click();
  // Wait for modal to close
  await this.page!.waitForSelector('[data-testid="card-edit-modal"]', {
    state: "hidden",
    timeout: 2000,
  }).catch(() => {
    // Modal might already be hidden
  });
});

Then("the card edit modal should be open", async function (this: CustomWorld) {
  const modal = this.page!.locator('[data-testid="card-edit-modal"]');
  await expect(modal).toBeVisible();
});

// ============================================================================
// EDIT EXISTING CARD STEPS
// ============================================================================

When(
  "I click the edit button on cypher {string}",
  async function (this: CustomWorld, name: string) {
    // Find the cypher card by name
    const cypherCard = this.page!.locator('[data-testid="cypher-item"]').filter({
      hasText: name,
    });

    // Find and click the edit button within that card
    const editButton = cypherCard.locator('[data-testid^="cypher-edit-button-"]');
    await editButton.click();

    // Wait for modal to open
    await this.page!.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
  }
);

// ============================================================================
// ITERATION 2: EQUIPMENT
// ============================================================================

// PRECONDITION STEPS
Given("the character has {int} equipment card", async function (this: CustomWorld, count: number) {
  if (count === 4) {
    await this.page!.evaluate(() => {
      const FULL_CHARACTER = {
        name: "Kael the Wanderer",
        tier: 3,
        type: "Glaive",
        descriptor: "Strong",
        focus: "Bears a Halo of Fire",
        xp: 12,
        shins: 47,
        armor: 2,
        effort: 3,
        maxCyphers: 4,
        stats: {
          might: { pool: 15, edge: 2, current: 12 },
          speed: { pool: 12, edge: 1, current: 12 },
          intellect: { pool: 10, edge: 0, current: 8 },
        },
        cyphers: [],
        artifacts: [],
        oddities: [],
        abilities: [],
        equipment: [
          { name: "Medium armor", description: "Provides protection without hindering movement" },
          { name: "Broadsword", description: "Heavy melee weapon" },
          { name: "Explorer's pack", description: undefined },
          { name: "50 feet of rope", description: undefined },
        ],
        attacks: [],
        specialAbilities: [],
        recoveryRolls: {
          action: false,
          tenMinutes: false,
          oneHour: false,
          tenHours: false,
          modifier: 0,
        },
        damageTrack: { impairment: "healthy" },
        textFields: { background: "", notes: "" },
      };
      localStorage.setItem("numenera-character", JSON.stringify(FULL_CHARACTER));
    });
    await this.page!.reload({ waitUntil: "load" });
    await this.page!.waitForSelector('[data-testid^="equipment-item-"]', { timeout: 5000 });
  }
  const cards = this.page!.locator('[data-testid^="equipment-item-"]');
  await expect(cards).toHaveCount(count);
});

Given("the character has {int} equipment cards", async function (this: CustomWorld, count: number) {
  if (count === 4) {
    await this.page!.evaluate(() => {
      const FULL_CHARACTER = {
        name: "Kael the Wanderer",
        tier: 3,
        type: "Glaive",
        descriptor: "Strong",
        focus: "Bears a Halo of Fire",
        xp: 12,
        shins: 47,
        armor: 2,
        effort: 3,
        maxCyphers: 4,
        stats: {
          might: { pool: 15, edge: 2, current: 12 },
          speed: { pool: 12, edge: 1, current: 12 },
          intellect: { pool: 10, edge: 0, current: 8 },
        },
        cyphers: [],
        artifacts: [],
        oddities: [],
        abilities: [],
        equipment: [
          { name: "Medium armor", description: "Provides protection without hindering movement" },
          { name: "Broadsword", description: "Heavy melee weapon" },
          { name: "Explorer's pack", description: undefined },
          { name: "50 feet of rope", description: undefined },
        ],
        attacks: [],
        specialAbilities: [],
        recoveryRolls: {
          action: false,
          tenMinutes: false,
          oneHour: false,
          tenHours: false,
          modifier: 0,
        },
        damageTrack: { impairment: "healthy" },
        textFields: { background: "", notes: "" },
      };
      localStorage.setItem("numenera-character", JSON.stringify(FULL_CHARACTER));
    });
    await this.page!.reload({ waitUntil: "load" });
    await this.page!.waitForSelector('[data-testid^="equipment-item-"]', { timeout: 5000 });
  }
  const cards = this.page!.locator('[data-testid^="equipment-item-"]');
  await expect(cards).toHaveCount(count);
});

// ADD BUTTON VISIBILITY
Then("I should see an add equipment button", async function (this: CustomWorld) {
  const button = this.page!.locator('[data-testid="add-equipment-button"]');
  await expect(button).toBeVisible();
});

// ADD BUTTON CLICK
When("I click the add equipment button", async function (this: CustomWorld) {
  const button = this.page!.locator('[data-testid="add-equipment-button"]');
  await button.click();
  await this.page!.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
});

// MODAL FIELD VERIFICATION
Then("the modal should show equipment fields", async function (this: CustomWorld) {
  const nameField = this.page!.locator('[data-testid="edit-field-name"]');
  const descField = this.page!.locator('[data-testid="edit-field-description"]');
  await expect(nameField).toBeVisible();
  await expect(descField).toBeVisible();
});

Then("all equipment fields should be empty", async function (this: CustomWorld) {
  const nameField = this.page!.locator('[data-testid="edit-field-name"]');
  const descField = this.page!.locator('[data-testid="edit-field-description"]');
  await expect(nameField).toHaveValue("");
  await expect(descField).toHaveValue("");
});

// FIELD FILLING
When(
  "I fill in the equipment name with {string}",
  async function (this: CustomWorld, value: string) {
    const field = this.page!.locator('[data-testid="edit-field-name"]');
    await field.fill(value);
  }
);

When(
  "I fill in the equipment description with {string}",
  async function (this: CustomWorld, value: string) {
    const field = this.page!.locator('[data-testid="edit-field-description"]');
    await field.fill(value);
  }
);

// CARD VERIFICATION
Then("I should see {int} equipment card", async function (this: CustomWorld, count: number) {
  await this.page!.waitForTimeout(100);
  const cards = this.page!.locator('[data-testid^="equipment-item-"]');
  await expect(cards).toHaveCount(count);
});

Then("I should see {int} equipment cards", async function (this: CustomWorld, count: number) {
  await this.page!.waitForTimeout(100);
  const cards = this.page!.locator('[data-testid^="equipment-item-"]');
  await expect(cards).toHaveCount(count);
});

Then(
  "I should see an equipment card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page!.waitForTimeout(100);
    const equipmentCard = this.page!.locator('[data-testid^="equipment-item-"]').filter({
      hasText: name,
    });
    await expect(equipmentCard).toBeVisible();
  }
);

Then(
  "the equipment {string} should have description {string}",
  async function (this: CustomWorld, name: string, description: string) {
    const equipmentCard = this.page!.locator('[data-testid^="equipment-item-"]').filter({
      hasText: name,
    });
    await expect(equipmentCard).toContainText(description);
  }
);

// EDIT EXISTING CARD
When(
  "I click the edit button on equipment {string}",
  async function (this: CustomWorld, name: string) {
    const equipmentCard = this.page!.locator('[data-testid^="equipment-item-"]').filter({
      hasText: name,
    });
    const editButton = equipmentCard.locator('[data-testid^="equipment-edit-button-"]');
    await editButton.click();
    await this.page!.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
  }
);
