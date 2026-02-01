import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";
import { TestStorageHelper } from "../support/testStorageHelper.js";

// ============================================================================
// PRECONDITION STEPS
// ============================================================================

Given("the character has {int} cypher card", async function (this: CustomWorld, count: number) {
  // Set up character data in storage with the correct number of cyphers
  // The FULL_CHARACTER from mockCharacters.ts has 2 cyphers
  if (count === 2) {
    const storageHelper = new TestStorageHelper(this.page!);
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
    await this.page!.waitForTimeout(500);
    await storageHelper.setCharacter(FULL_CHARACTER);
    // Reload the page to apply the character data
    await this.page!.waitForTimeout(500);
    await this.page!.reload();
    await this.page!.waitForLoadState("networkidle");
    await this.page!.waitForTimeout(200);
    // Wait for cypher items to be rendered
    await this.page!.waitForSelector('[data-testid="cypher-item"]', { timeout: 5000 });
  }

  // Verify the character has the expected number of cypher cards
  const cards = this.page!.locator('[data-testid="cypher-item"]');
  await expect(cards).toHaveCount(count);
});

Given("the character has {int} cypher cards", async function (this: CustomWorld, count: number) {
  // Set up character data in storage with the correct number of cyphers
  // The FULL_CHARACTER from mockCharacters.ts has 2 cyphers
  if (count === 2) {
    const storageHelper = new TestStorageHelper(this.page!);
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
    await this.page!.waitForTimeout(500);
    await storageHelper.setCharacter(FULL_CHARACTER);
    // Reload the page to apply the character data
    await this.page!.waitForTimeout(500);
    await this.page!.reload();
    await this.page!.waitForLoadState("networkidle");
    await this.page!.waitForTimeout(200);
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
    const storageHelper = new TestStorageHelper(this.page!);
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
    await this.page!.waitForTimeout(500);
    await storageHelper.setCharacter(FULL_CHARACTER);
    await this.page!.waitForTimeout(500);
    await this.page!.reload();
    await this.page!.waitForLoadState("networkidle");
    await this.page!.waitForTimeout(200);
    await this.page!.waitForSelector('[data-testid^="equipment-item-"]', { timeout: 5000 });
  }
  const cards = this.page!.locator('[data-testid^="equipment-item-"]');
  await expect(cards).toHaveCount(count);
});

Given("the character has {int} equipment cards", async function (this: CustomWorld, count: number) {
  if (count === 4) {
    const storageHelper = new TestStorageHelper(this.page!);
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
    await this.page!.waitForTimeout(500);
    await storageHelper.setCharacter(FULL_CHARACTER);
    await this.page!.waitForTimeout(500);
    await this.page!.reload();
    await this.page!.waitForLoadState("networkidle");
    await this.page!.waitForTimeout(200);
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

// ============================================================================
// ITERATION 3: ARTIFACTS
// ============================================================================

// PRECONDITION STEPS
Given("the character has {int} artifact card", async function (this: CustomWorld, count: number) {
  if (count === 2) {
    const storageHelper = new TestStorageHelper(this.page!);
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
      artifacts: [
        { name: "Lightning Rod", level: "6", effect: "Projects lightning bolt up to long range" },
        { name: "Healing Crystal", level: "1d6+2", effect: "Heals wounds over time" },
      ],
      oddities: [],
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
    await this.page!.waitForTimeout(500);
    await storageHelper.setCharacter(FULL_CHARACTER);
    await this.page!.waitForTimeout(500);
    await this.page!.reload();
    await this.page!.waitForLoadState("networkidle");
    await this.page!.waitForTimeout(200);
    await this.page!.waitForSelector('[data-testid^="artifact-item-"]', { timeout: 5000 });
  }
  const cards = this.page!.locator('[data-testid^="artifact-item-"]');
  await expect(cards).toHaveCount(count);
});

Given("the character has {int} artifact cards", async function (this: CustomWorld, count: number) {
  if (count === 2) {
    const storageHelper = new TestStorageHelper(this.page!);
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
      artifacts: [
        { name: "Lightning Rod", level: "6", effect: "Projects lightning bolt up to long range" },
        { name: "Healing Crystal", level: "1d6+2", effect: "Heals wounds over time" },
      ],
      oddities: [],
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
    await this.page!.waitForTimeout(500);
    await storageHelper.setCharacter(FULL_CHARACTER);
    await this.page!.waitForTimeout(500);
    await this.page!.reload();
    await this.page!.waitForLoadState("networkidle");
    await this.page!.waitForTimeout(200);
    await this.page!.waitForSelector('[data-testid^="artifact-item-"]', { timeout: 5000 });
  }
  const cards = this.page!.locator('[data-testid^="artifact-item-"]');
  await expect(cards).toHaveCount(count);
});

// ADD BUTTON VISIBILITY
Then("I should see an add artifact button", async function (this: CustomWorld) {
  const button = this.page!.locator('[data-testid="add-artifact-button"]');
  await expect(button).toBeVisible();
});

// ADD BUTTON CLICK
When("I click the add artifact button", async function (this: CustomWorld) {
  const button = this.page!.locator('[data-testid="add-artifact-button"]');
  await button.click();
  await this.page!.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
});

// MODAL FIELD VERIFICATION
Then("the modal should show artifact fields", async function (this: CustomWorld) {
  const nameField = this.page!.locator('[data-testid="edit-artifact-name"]');
  const levelField = this.page!.locator('[data-testid="edit-artifact-level"]');
  const effectField = this.page!.locator('[data-testid="edit-artifact-effect"]');
  await expect(nameField).toBeVisible();
  await expect(levelField).toBeVisible();
  await expect(effectField).toBeVisible();
});

Then("all artifact fields should be empty", async function (this: CustomWorld) {
  const nameField = this.page!.locator('[data-testid="edit-artifact-name"]');
  const levelField = this.page!.locator('[data-testid="edit-artifact-level"]');
  const effectField = this.page!.locator('[data-testid="edit-artifact-effect"]');
  await expect(nameField).toHaveValue("");
  await expect(levelField).toHaveValue("");
  await expect(effectField).toHaveValue("");
});

// FIELD FILLING
When(
  "I fill in the artifact name with {string}",
  async function (this: CustomWorld, value: string) {
    const field = this.page!.locator('[data-testid="edit-artifact-name"]');
    await field.fill(value);
  }
);

When(
  "I fill in the artifact level with {string}",
  async function (this: CustomWorld, value: string) {
    const field = this.page!.locator('[data-testid="edit-artifact-level"]');
    await field.fill(value);
  }
);

When(
  "I fill in the artifact effect with {string}",
  async function (this: CustomWorld, value: string) {
    const field = this.page!.locator('[data-testid="edit-artifact-effect"]');
    await field.fill(value);
  }
);

// CARD VERIFICATION
Then("I should see {int} artifact card", async function (this: CustomWorld, count: number) {
  await this.page!.waitForTimeout(100);
  const cards = this.page!.locator('[data-testid^="artifact-item-"]');
  await expect(cards).toHaveCount(count);
});

Then("I should see {int} artifact cards", async function (this: CustomWorld, count: number) {
  await this.page!.waitForTimeout(100);
  const cards = this.page!.locator('[data-testid^="artifact-item-"]');
  await expect(cards).toHaveCount(count);
});

Then(
  "I should see an artifact card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page!.waitForTimeout(100);
    const artifactCard = this.page!.locator('[data-testid^="artifact-item-"]').filter({
      hasText: name,
    });
    await expect(artifactCard).toBeVisible();
  }
);

Then(
  "the artifact {string} should have level {string}",
  async function (this: CustomWorld, name: string, level: string) {
    const artifactCard = this.page!.locator('[data-testid^="artifact-item-"]').filter({
      hasText: name,
    });
    await expect(artifactCard).toContainText(`${level}`);
  }
);

Then(
  "the artifact {string} should have effect {string}",
  async function (this: CustomWorld, name: string, effect: string) {
    const artifactCard = this.page!.locator('[data-testid^="artifact-item-"]').filter({
      hasText: name,
    });
    await expect(artifactCard).toContainText(effect);
  }
);

// EDIT EXISTING CARD
When(
  "I click the edit button on artifact {string}",
  async function (this: CustomWorld, name: string) {
    const artifactCard = this.page!.locator('[data-testid^="artifact-item-"]').filter({
      hasText: name,
    });
    const editButton = artifactCard.locator('[data-testid^="artifact-edit-button-"]');
    await editButton.click();
    await this.page!.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
  }
);

// ============================================================================
// ITERATION 4: ODDITIES
// ============================================================================

// PRECONDITION STEPS
Given("the character has {int} oddity card", async function (this: CustomWorld, count: number) {
  if (count === 2) {
    const storageHelper = new TestStorageHelper(this.page!);
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
    await this.page!.waitForTimeout(500);
    await storageHelper.setCharacter(FULL_CHARACTER);
    await this.page!.waitForTimeout(500);
    await this.page!.reload();
    await this.page!.waitForLoadState("networkidle");
    await this.page!.waitForTimeout(200);
    await this.page!.waitForSelector('[data-testid="oddity-item"]', { timeout: 5000 });
  }
  const cards = this.page!.locator('[data-testid="oddity-item"]');
  await expect(cards).toHaveCount(count);
});

Given("the character has {int} oddity cards", async function (this: CustomWorld, count: number) {
  if (count === 2) {
    const storageHelper = new TestStorageHelper(this.page!);
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
    await this.page!.waitForTimeout(500);
    await storageHelper.setCharacter(FULL_CHARACTER);
    await this.page!.waitForTimeout(500);
    await this.page!.reload();
    await this.page!.waitForLoadState("networkidle");
    await this.page!.waitForTimeout(200);
    await this.page!.waitForSelector('[data-testid="oddity-item"]', { timeout: 5000 });
  }
  const cards = this.page!.locator('[data-testid="oddity-item"]');
  await expect(cards).toHaveCount(count);
});

// ADD BUTTON VISIBILITY
Then("I should see an add oddity button", async function (this: CustomWorld) {
  const button = this.page!.locator('[data-testid="add-oddity-button"]');
  await expect(button).toBeVisible();
});

// ADD BUTTON CLICK
When("I click the add oddity button", async function (this: CustomWorld) {
  const button = this.page!.locator('[data-testid="add-oddity-button"]');
  await button.click();
  await this.page!.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
});

// MODAL FIELD VERIFICATION
Then("the modal should show oddity fields", async function (this: CustomWorld) {
  const oddityField = this.page!.locator('[data-testid="edit-field-oddity"]');
  await expect(oddityField).toBeVisible();
});

Then("all oddity fields should be empty", async function (this: CustomWorld) {
  const oddityField = this.page!.locator('[data-testid="edit-field-oddity"]');
  await expect(oddityField).toHaveValue("");
});

// FIELD FILLING
When("I fill in the oddity text with {string}", async function (this: CustomWorld, value: string) {
  const field = this.page!.locator('[data-testid="edit-field-oddity"]');
  await field.fill(value);
});

// CARD VERIFICATION
Then("I should see {int} oddity card", async function (this: CustomWorld, count: number) {
  await this.page!.waitForTimeout(100);
  const cards = this.page!.locator('[data-testid="oddity-item"]');
  await expect(cards).toHaveCount(count);
});

Then("I should see {int} oddity cards", async function (this: CustomWorld, count: number) {
  await this.page!.waitForTimeout(100);
  const cards = this.page!.locator('[data-testid="oddity-item"]');
  await expect(cards).toHaveCount(count);
});

Then(
  "I should see an oddity card with text {string}",
  async function (this: CustomWorld, text: string) {
    await this.page!.waitForTimeout(100);
    const oddityCard = this.page!.locator('[data-testid="oddity-item"]').filter({
      hasText: text,
    });
    await expect(oddityCard).toBeVisible();
  }
);

// EDIT EXISTING CARD
When(
  "I click the edit button on oddity {string}",
  async function (this: CustomWorld, text: string) {
    const oddityCard = this.page!.locator('[data-testid="oddity-item"]').filter({
      hasText: text,
    });
    const editButton = oddityCard.locator('[data-testid^="oddity-edit-button-"]');
    await editButton.click();
    await this.page!.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
  }
);

// ============================================================================
// ITERATION 5: ATTACKS
// ============================================================================

// PRECONDITION STEPS
Given("the character has {int} attack card", async function (this: CustomWorld, count: number) {
  if (count === 2) {
    const storageHelper = new TestStorageHelper(this.page!);
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
      equipment: [],
      attacks: [
        { name: "Broadsword", damage: 6, modifier: 1, range: "Immediate", notes: undefined },
        { name: "Crossbow", damage: 4, modifier: 0, range: "Long", notes: undefined },
      ],
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
    await this.page!.waitForTimeout(500);
    await storageHelper.setCharacter(FULL_CHARACTER);
    await this.page!.waitForTimeout(500);
    await this.page!.reload();
    await this.page!.waitForLoadState("networkidle");
    await this.page!.waitForTimeout(200);
    await this.page!.waitForSelector('[data-testid^="attack-item-"]', { timeout: 5000 });
  }
  const cards = this.page!.locator('[data-testid^="attack-item-"]');
  await expect(cards).toHaveCount(count);
});

Given("the character has {int} attack cards", async function (this: CustomWorld, count: number) {
  if (count === 2) {
    const storageHelper = new TestStorageHelper(this.page!);
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
      equipment: [],
      attacks: [
        { name: "Broadsword", damage: 6, modifier: 1, range: "Immediate", notes: undefined },
        { name: "Crossbow", damage: 4, modifier: 0, range: "Long", notes: undefined },
      ],
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
    await this.page!.waitForTimeout(500);
    await storageHelper.setCharacter(FULL_CHARACTER);
    await this.page!.waitForTimeout(500);
    await this.page!.reload();
    await this.page!.waitForLoadState("networkidle");
    await this.page!.waitForTimeout(200);
    await this.page!.waitForSelector('[data-testid^="attack-item-"]', { timeout: 5000 });
  }
  const cards = this.page!.locator('[data-testid^="attack-item-"]');
  await expect(cards).toHaveCount(count);
});

// ADD BUTTON VISIBILITY
Then("I should see an add attack button", async function (this: CustomWorld) {
  const button = this.page!.locator('[data-testid="add-attack-button"]');
  await expect(button).toBeVisible();
});

// ADD BUTTON CLICK
When("I click the add attack button", async function (this: CustomWorld) {
  const button = this.page!.locator('[data-testid="add-attack-button"]');
  await button.click();
  await this.page!.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
});

// MODAL FIELD VERIFICATION
Then("the modal should show attack fields", async function (this: CustomWorld) {
  const nameField = this.page!.locator('[data-testid="edit-attack-name"]');
  const damageField = this.page!.locator('[data-testid="edit-attack-damage"]');
  const modifierField = this.page!.locator('[data-testid="edit-attack-modifier"]');
  const rangeField = this.page!.locator('[data-testid="edit-attack-range"]');
  await expect(nameField).toBeVisible();
  await expect(damageField).toBeVisible();
  await expect(modifierField).toBeVisible();
  await expect(rangeField).toBeVisible();
});

Then("all attack fields should be empty", async function (this: CustomWorld) {
  const nameField = this.page!.locator('[data-testid="edit-attack-name"]');
  const damageField = this.page!.locator('[data-testid="edit-attack-damage"]');
  const modifierField = this.page!.locator('[data-testid="edit-attack-modifier"]');
  const rangeField = this.page!.locator('[data-testid="edit-attack-range"]');
  await expect(nameField).toHaveValue("");
  await expect(damageField).toHaveValue("0");
  await expect(modifierField).toHaveValue("0");
  await expect(rangeField).toHaveValue("");
});

// FIELD FILLING
When("I fill in the attack name with {string}", async function (this: CustomWorld, value: string) {
  const field = this.page!.locator('[data-testid="edit-attack-name"]');
  await field.fill(value);
});

When(
  "I fill in the attack damage with {string}",
  async function (this: CustomWorld, value: string) {
    const field = this.page!.locator('[data-testid="edit-attack-damage"]');
    await field.fill(value);
  }
);

When(
  "I fill in the attack modifier with {string}",
  async function (this: CustomWorld, value: string) {
    const field = this.page!.locator('[data-testid="edit-attack-modifier"]');
    await field.fill(value);
  }
);

When("I fill in the attack range with {string}", async function (this: CustomWorld, value: string) {
  const field = this.page!.locator('[data-testid="edit-attack-range"]');
  await field.fill(value);
});

// CARD VERIFICATION
Then("I should see {int} attack card", async function (this: CustomWorld, count: number) {
  await this.page!.waitForTimeout(100);
  const cards = this.page!.locator('[data-testid^="attack-item-"]');
  await expect(cards).toHaveCount(count);
});

Then("I should see {int} attack cards", async function (this: CustomWorld, count: number) {
  await this.page!.waitForTimeout(100);
  const cards = this.page!.locator('[data-testid^="attack-item-"]');
  await expect(cards).toHaveCount(count);
});

Then(
  "I should see an attack card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page!.waitForTimeout(100);
    const attackCard = this.page!.locator('[data-testid^="attack-item-"]').filter({
      hasText: name,
    });
    await expect(attackCard).toBeVisible();
  }
);

Then(
  "the attack {string} should have modifier {string}",
  async function (this: CustomWorld, name: string, modifier: string) {
    const attackCard = this.page!.locator('[data-testid^="attack-item-"]').filter({
      hasText: name,
    });
    await expect(attackCard).toContainText(modifier);
  }
);

Then(
  "the attack {string} should have damage {string}",
  async function (this: CustomWorld, name: string, damage: string) {
    const attackCard = this.page!.locator('[data-testid^="attack-item-"]').filter({
      hasText: name,
    });
    await expect(attackCard).toContainText(damage);
  }
);

// EDIT EXISTING CARD
When(
  "I click the edit button on attack {string}",
  async function (this: CustomWorld, name: string) {
    const attackCard = this.page!.locator('[data-testid^="attack-item-"]').filter({
      hasText: name,
    });
    const editButton = attackCard.locator('[data-testid^="attack-edit-button-"]');
    await editButton.click();
    await this.page!.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
  }
);

// ============================================================================
// ITERATION 6: ABILITIES
// ============================================================================

// PRECONDITION STEPS
Given("the character has {int} ability card", async function (this: CustomWorld, count: number) {
  if (count === 2) {
    const storageHelper = new TestStorageHelper(this.page!);
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
      abilities: [
        { name: "Bash", cost: 1, pool: "might", description: "Strike a foe with your weapon" },
        {
          name: "Fleet of Foot",
          cost: 1,
          pool: "speed",
          description: "Move a short distance as part of another action",
        },
      ],
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
    await this.page!.waitForTimeout(500);
    await storageHelper.setCharacter(FULL_CHARACTER);
    await this.page!.waitForTimeout(500);
    await this.page!.reload();
    await this.page!.waitForLoadState("networkidle");
    await this.page!.waitForTimeout(200);
    await this.page!.waitForSelector('[data-testid^="ability-item-"]', { timeout: 5000 });
  }
  const cards = this.page!.locator('[data-testid^="ability-item-"]');
  await expect(cards).toHaveCount(count);
});

Given("the character has {int} ability cards", async function (this: CustomWorld, count: number) {
  if (count === 2) {
    const storageHelper = new TestStorageHelper(this.page!);
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
      abilities: [
        { name: "Bash", cost: 1, pool: "might", description: "Strike a foe with your weapon" },
        {
          name: "Fleet of Foot",
          cost: 1,
          pool: "speed",
          description: "Move a short distance as part of another action",
        },
      ],
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
    await this.page!.waitForTimeout(500);
    await storageHelper.setCharacter(FULL_CHARACTER);
    await this.page!.waitForTimeout(500);
    await this.page!.reload();
    await this.page!.waitForLoadState("networkidle");
    await this.page!.waitForTimeout(200);
    await this.page!.waitForSelector('[data-testid^="ability-item-"]', { timeout: 5000 });
  }
  const cards = this.page!.locator('[data-testid^="ability-item-"]');
  await expect(cards).toHaveCount(count);
});

// ADD BUTTON VISIBILITY
Then("I should see an add ability button", async function (this: CustomWorld) {
  const button = this.page!.locator('[data-testid="add-ability-button"]');
  await expect(button).toBeVisible();
});

// ADD BUTTON CLICK
When("I click the add ability button", async function (this: CustomWorld) {
  const button = this.page!.locator('[data-testid="add-ability-button"]');
  await button.click();
  await this.page!.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
});

// MODAL FIELD VERIFICATION
Then("the modal should show ability fields", async function (this: CustomWorld) {
  const nameField = this.page!.locator('[data-testid="edit-ability-name"]');
  const costField = this.page!.locator('[data-testid="edit-ability-cost"]');
  const poolField = this.page!.locator('[data-testid="edit-ability-pool"]');
  const descField = this.page!.locator('[data-testid="edit-ability-description"]');
  await expect(nameField).toBeVisible();
  await expect(costField).toBeVisible();
  await expect(poolField).toBeVisible();
  await expect(descField).toBeVisible();
});

Then("all ability fields should be empty", async function (this: CustomWorld) {
  const nameField = this.page!.locator('[data-testid="edit-ability-name"]');
  const costField = this.page!.locator('[data-testid="edit-ability-cost"]');
  const poolField = this.page!.locator('[data-testid="edit-ability-pool"]');
  const descField = this.page!.locator('[data-testid="edit-ability-description"]');
  await expect(nameField).toHaveValue("");
  await expect(costField).toHaveValue("");
  await expect(poolField).toHaveValue("");
  await expect(descField).toHaveValue("");
});

// FIELD FILLING
When("I fill in the ability name with {string}", async function (this: CustomWorld, value: string) {
  const field = this.page!.locator('[data-testid="edit-ability-name"]');
  await field.fill(value);
});

When("I fill in the ability cost with {string}", async function (this: CustomWorld, value: string) {
  const field = this.page!.locator('[data-testid="edit-ability-cost"]');
  await field.fill(value);
});

When("I fill in the ability pool with {string}", async function (this: CustomWorld, value: string) {
  const field = this.page!.locator('[data-testid="edit-ability-pool"]');
  await field.selectOption(value.toLowerCase());
});

When(
  "I fill in the ability description with {string}",
  async function (this: CustomWorld, value: string) {
    const field = this.page!.locator('[data-testid="edit-ability-description"]');
    await field.fill(value);
  }
);

// CARD VERIFICATION
Then("I should see {int} ability card", async function (this: CustomWorld, count: number) {
  await this.page!.waitForTimeout(100);
  const cards = this.page!.locator('[data-testid^="ability-item-"]');
  await expect(cards).toHaveCount(count);
});

Then("I should see {int} ability cards", async function (this: CustomWorld, count: number) {
  await this.page!.waitForTimeout(100);
  const cards = this.page!.locator('[data-testid^="ability-item-"]');
  await expect(cards).toHaveCount(count);
});

Then(
  "I should see an ability card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page!.waitForTimeout(100);
    const abilityCard = this.page!.locator('[data-testid^="ability-item-"]').filter({
      hasText: name,
    });
    await expect(abilityCard).toBeVisible();
  }
);

Then(
  "the ability {string} should have cost {string}",
  async function (this: CustomWorld, name: string, cost: string) {
    const abilityCard = this.page!.locator('[data-testid^="ability-item-"]').filter({
      hasText: name,
    });
    await expect(abilityCard).toContainText(cost);
  }
);

Then(
  "the ability {string} should have pool {string}",
  async function (this: CustomWorld, name: string, pool: string) {
    const abilityCard = this.page!.locator('[data-testid^="ability-item-"]').filter({
      hasText: name,
    });
    await expect(abilityCard).toContainText(pool);
  }
);

// EDIT EXISTING CARD
When(
  "I click the edit button on ability {string}",
  async function (this: CustomWorld, name: string) {
    const abilityCard = this.page!.locator('[data-testid^="ability-item-"]').filter({
      hasText: name,
    });
    const editButton = abilityCard.locator('[data-testid^="ability-edit-button-"]');
    await editButton.click();
    await this.page!.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
  }
);

// ============================================================================
// ITERATION 7: SPECIAL ABILITIES
// ============================================================================

// PRECONDITION STEPS
Given(
  "the character has {int} special ability card",
  async function (this: CustomWorld, count: number) {
    if (count === 2) {
      const storageHelper = new TestStorageHelper(this.page!);
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
        equipment: [],
        attacks: [],
        specialAbilities: [
          {
            name: "Practiced in Armor",
            source: "Type",
            description: "You can wear armor for long periods",
          },
          {
            name: "Fire Affinity",
            source: "Focus",
            description: "You are trained in fire-based attacks",
          },
        ],
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
      await this.page!.waitForTimeout(500);
      await storageHelper.setCharacter(FULL_CHARACTER);
      await this.page!.waitForTimeout(500);
      await this.page!.reload();
      await this.page!.waitForLoadState("networkidle");
      await this.page!.waitForTimeout(200);
      await this.page!.waitForSelector('[data-testid^="special-ability-item-"]', { timeout: 5000 });
    }
    const cards = this.page!.locator('[data-testid^="special-ability-item-"]');
    await expect(cards).toHaveCount(count);
  }
);

Given(
  "the character has {int} special ability cards",
  async function (this: CustomWorld, count: number) {
    if (count === 2) {
      const storageHelper = new TestStorageHelper(this.page!);
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
        equipment: [],
        attacks: [],
        specialAbilities: [
          {
            name: "Practiced in Armor",
            source: "Type",
            description: "You can wear armor for long periods",
          },
          {
            name: "Fire Affinity",
            source: "Focus",
            description: "You are trained in fire-based attacks",
          },
        ],
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
      await this.page!.waitForTimeout(500);
      await storageHelper.setCharacter(FULL_CHARACTER);
      await this.page!.waitForTimeout(500);
      await this.page!.reload();
      await this.page!.waitForLoadState("networkidle");
      await this.page!.waitForTimeout(200);
      await this.page!.waitForSelector('[data-testid^="special-ability-item-"]', { timeout: 5000 });
    }
    const cards = this.page!.locator('[data-testid^="special-ability-item-"]');
    await expect(cards).toHaveCount(count);
  }
);

// ADD BUTTON VISIBILITY
Then("I should see an add special ability button", async function (this: CustomWorld) {
  const button = this.page!.locator('[data-testid="add-special-ability-button"]');
  await expect(button).toBeVisible();
});

// ADD BUTTON CLICK
When("I click the add special ability button", async function (this: CustomWorld) {
  const button = this.page!.locator('[data-testid="add-special-ability-button"]');
  await button.click();
  await this.page!.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
});

// MODAL FIELD VERIFICATION
Then("the modal should show special ability fields", async function (this: CustomWorld) {
  const nameField = this.page!.locator('[data-testid="edit-special-ability-name"]');
  const sourceField = this.page!.locator('[data-testid="edit-special-ability-source"]');
  const descField = this.page!.locator('[data-testid="edit-special-ability-description"]');
  await expect(nameField).toBeVisible();
  await expect(sourceField).toBeVisible();
  await expect(descField).toBeVisible();
});

Then("all special ability fields should be empty", async function (this: CustomWorld) {
  const nameField = this.page!.locator('[data-testid="edit-special-ability-name"]');
  const sourceField = this.page!.locator('[data-testid="edit-special-ability-source"]');
  const descField = this.page!.locator('[data-testid="edit-special-ability-description"]');
  await expect(nameField).toHaveValue("");
  await expect(sourceField).toHaveValue("");
  await expect(descField).toHaveValue("");
});

// FIELD FILLING
When(
  "I fill in the special ability name with {string}",
  async function (this: CustomWorld, value: string) {
    const field = this.page!.locator('[data-testid="edit-special-ability-name"]');
    await field.fill(value);
  }
);

When(
  "I fill in the special ability source with {string}",
  async function (this: CustomWorld, value: string) {
    const field = this.page!.locator('[data-testid="edit-special-ability-source"]');
    await field.fill(value);
  }
);

When(
  "I fill in the special ability description with {string}",
  async function (this: CustomWorld, value: string) {
    const field = this.page!.locator('[data-testid="edit-special-ability-description"]');
    await field.fill(value);
  }
);

// CARD VERIFICATION
Then("I should see {int} special ability card", async function (this: CustomWorld, count: number) {
  await this.page!.waitForTimeout(100);
  const cards = this.page!.locator('[data-testid^="special-ability-item-"]');
  await expect(cards).toHaveCount(count);
});

Then("I should see {int} special ability cards", async function (this: CustomWorld, count: number) {
  await this.page!.waitForTimeout(100);
  const cards = this.page!.locator('[data-testid^="special-ability-item-"]');
  await expect(cards).toHaveCount(count);
});

Then(
  "I should see a special ability card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page!.waitForTimeout(100);
    const specialAbilityCard = this.page!.locator('[data-testid^="special-ability-item-"]').filter({
      hasText: name,
    });
    await expect(specialAbilityCard).toBeVisible();
  }
);

Then(
  "the special ability {string} should have source {string}",
  async function (this: CustomWorld, name: string, source: string) {
    const specialAbilityCard = this.page!.locator('[data-testid^="special-ability-item-"]').filter({
      hasText: name,
    });
    await expect(specialAbilityCard).toContainText(source);
  }
);

// EDIT EXISTING CARD
When(
  "I click the edit button on special ability {string}",
  async function (this: CustomWorld, name: string) {
    const specialAbilityCard = this.page!.locator('[data-testid^="special-ability-item-"]').filter({
      hasText: name,
    });
    const editButton = specialAbilityCard.locator('[data-testid^="special-ability-edit-button-"]');
    await editButton.click();
    await this.page!.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
  }
);
