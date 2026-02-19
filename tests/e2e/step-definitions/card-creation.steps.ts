import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";
import { TestStorageHelper } from "../support/testStorageHelper.js";
import {
  CARD_CONFIGS,
  createTestCharacterWithCardCount,
  createEmptyAbilitiesCharacter,
} from "../support/cardTestFixtures.js";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sets up character with specified card count and waits for render
 */
async function setupCharacterWithCards(
  world: CustomWorld,
  cardType: string,
  count: number
): Promise<void> {
  const config = CARD_CONFIGS[cardType];
  if (!config) {
    throw new Error(`Unknown card type: ${cardType}`);
  }

  // Special case for ability 0 count
  if (cardType === "ability" && count === 0) {
    const storageHelper = new TestStorageHelper(world.page!);
    await world.page!.evaluate(() => localStorage.clear());
    await storageHelper.clearVersions();
    await storageHelper.setCharacter(createEmptyAbilitiesCharacter());
    await world.page!.reload();
    await world.page!.waitForLoadState("networkidle");
    await world.page!.waitForTimeout(500);
    return;
  }

  // Check if we have enough sample cards for the requested count
  if (count > config.sampleCards.length) {
    throw new Error(
      `Requested ${count} ${cardType} cards but only ${config.sampleCards.length} sample cards available`
    );
  }

  // Only set up storage if we need cards
  if (count > 0) {
    const storageHelper = new TestStorageHelper(world.page!);
    const character = createTestCharacterWithCardCount(cardType, count);

    await world.page!.waitForTimeout(500);
    await storageHelper.setCharacter(character);
    await world.page!.waitForTimeout(500);
    await world.page!.reload();
    await world.page!.waitForLoadState("networkidle");
    await world.page!.waitForTimeout(200);
    await world.page!.waitForSelector(config.itemTestId, { timeout: 5000 });
  }
}

// ============================================================================
// PARAMETERIZED PRECONDITION STEPS
// ============================================================================

// Helper for Given steps
async function givenCharacterHasCards(
  world: CustomWorld,
  cardType: string,
  count: number
): Promise<void> {
  await setupCharacterWithCards(world, cardType, count);
  const config = CARD_CONFIGS[cardType];
  const cards = world.page!.locator(config.itemTestId);
  await expect(cards).toHaveCount(count);
}

// Cypher cards (singular and plural)
Given("the character has {int} cypher card", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "cypher", count);
});
Given("the character has {int} cypher cards", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "cypher", count);
});

// Equipment cards (singular and plural)
Given("the character has {int} equipment card", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "equipment", count);
});
Given("the character has {int} equipment cards", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "equipment", count);
});

// Artifact cards (singular and plural)
Given("the character has {int} artifact card", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "artifact", count);
});
Given("the character has {int} artifact cards", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "artifact", count);
});

// Oddity cards (singular and plural)
Given("the character has {int} oddity card", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "oddity", count);
});
Given("the character has {int} oddity cards", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "oddity", count);
});

// Attack cards (singular and plural)
Given("the character has {int} attack card", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "attack", count);
});
Given("the character has {int} attack cards", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "attack", count);
});

// Ability cards (singular and plural)
Given("the character has {int} ability card", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "ability", count);
});
Given("the character has {int} ability cards", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "ability", count);
});

// Special ability cards (singular and plural)
Given(
  "the character has {int} special ability card",
  async function (this: CustomWorld, count: number) {
    await givenCharacterHasCards(this, "special-ability", count);
  }
);
Given(
  "the character has {int} special ability cards",
  async function (this: CustomWorld, count: number) {
    await givenCharacterHasCards(this, "special-ability", count);
  }
);

// ============================================================================
// ADD BUTTON VISIBILITY STEPS
// ============================================================================

Then("I should see an add cypher button", async function (this: CustomWorld) {
  await expect(this.page!.locator(CARD_CONFIGS.cypher.addButtonTestId)).toBeVisible();
});

Then("I should see an add equipment button", async function (this: CustomWorld) {
  await expect(this.page!.locator(CARD_CONFIGS.equipment.addButtonTestId)).toBeVisible();
});

Then("I should see an add artifact button", async function (this: CustomWorld) {
  await expect(this.page!.locator(CARD_CONFIGS.artifact.addButtonTestId)).toBeVisible();
});

Then("I should see an add oddity button", async function (this: CustomWorld) {
  await expect(this.page!.locator(CARD_CONFIGS.oddity.addButtonTestId)).toBeVisible();
});

Then("I should see an add attack button", async function (this: CustomWorld) {
  await expect(this.page!.locator(CARD_CONFIGS.attack.addButtonTestId)).toBeVisible();
});

Then("I should see an add ability button", async function (this: CustomWorld) {
  await expect(this.page!.locator(CARD_CONFIGS.ability.addButtonTestId)).toBeVisible();
});

Then("I should see an add special ability button", async function (this: CustomWorld) {
  await expect(this.page!.locator(CARD_CONFIGS["special-ability"].addButtonTestId)).toBeVisible();
});

// ============================================================================
// ADD BUTTON CLICK STEPS
// ============================================================================

async function clickAddButton(world: CustomWorld, cardType: string): Promise<void> {
  const config = CARD_CONFIGS[cardType];
  await world.page!.locator(config.addButtonTestId).click();
  await world.page!.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
}

When("I click the add cypher button", async function (this: CustomWorld) {
  await clickAddButton(this, "cypher");
});

When("I click the add equipment button", async function (this: CustomWorld) {
  await clickAddButton(this, "equipment");
});

When("I click the add artifact button", async function (this: CustomWorld) {
  await clickAddButton(this, "artifact");
});

When("I click the add oddity button", async function (this: CustomWorld) {
  await clickAddButton(this, "oddity");
});

When("I click the add attack button", async function (this: CustomWorld) {
  await clickAddButton(this, "attack");
});

When("I click the add ability button", async function (this: CustomWorld) {
  await clickAddButton(this, "ability");
});

When("I click the add special ability button", async function (this: CustomWorld) {
  await clickAddButton(this, "special-ability");
});

// ============================================================================
// MODAL FIELD VERIFICATION STEPS
// ============================================================================

Then("the modal should show cypher fields", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.cypher.fieldTestIds;
  await expect(this.page!.locator(fields.name)).toBeVisible();
  await expect(this.page!.locator(fields.level)).toBeVisible();
  await expect(this.page!.locator(fields.effect)).toBeVisible();
});

Then("all cypher fields should be empty", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.cypher.fieldTestIds;
  await expect(this.page!.locator(fields.name)).toHaveValue("");
  await expect(this.page!.locator(fields.level)).toHaveValue("");
  await expect(this.page!.locator(fields.effect)).toHaveValue("");
});

Then("the modal should show equipment fields", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.equipment.fieldTestIds;
  await expect(this.page!.locator(fields.name)).toBeVisible();
  await expect(this.page!.locator(fields.description)).toBeVisible();
});

Then("all equipment fields should be empty", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.equipment.fieldTestIds;
  await expect(this.page!.locator(fields.name)).toHaveValue("");
  await expect(this.page!.locator(fields.description)).toHaveValue("");
});

Then("the modal should show artifact fields", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.artifact.fieldTestIds;
  await expect(this.page!.locator(fields.name)).toBeVisible();
  await expect(this.page!.locator(fields.level)).toBeVisible();
  await expect(this.page!.locator(fields.effect)).toBeVisible();
});

Then("all artifact fields should be empty", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.artifact.fieldTestIds;
  await expect(this.page!.locator(fields.name)).toHaveValue("");
  await expect(this.page!.locator(fields.level)).toHaveValue("");
  await expect(this.page!.locator(fields.effect)).toHaveValue("");
});

Then("the modal should show oddity fields", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.oddity.fieldTestIds;
  await expect(this.page!.locator(fields.oddity)).toBeVisible();
});

Then("all oddity fields should be empty", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.oddity.fieldTestIds;
  await expect(this.page!.locator(fields.oddity)).toHaveValue("");
});

Then("the modal should show attack fields", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.attack.fieldTestIds;
  await expect(this.page!.locator(fields.name)).toBeVisible();
  await expect(this.page!.locator(fields.damage)).toBeVisible();
  await expect(this.page!.locator(fields.modifier)).toBeVisible();
  await expect(this.page!.locator(fields.range)).toBeVisible();
});

Then("all attack fields should be empty", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.attack.fieldTestIds;
  await expect(this.page!.locator(fields.name)).toHaveValue("");
  await expect(this.page!.locator(fields.damage)).toHaveValue("0");
  await expect(this.page!.locator(fields.modifier)).toHaveValue("0");
  await expect(this.page!.locator(fields.range)).toHaveValue("");
});

Then("the modal should show ability fields", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.ability.fieldTestIds;
  await expect(this.page!.locator(fields.name)).toBeVisible();
  await expect(this.page!.locator(fields.cost)).toBeVisible();
  await expect(this.page!.locator(fields.pool)).toBeVisible();
  await expect(this.page!.locator(fields.description)).toBeVisible();
});

Then("all ability fields should be empty", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.ability.fieldTestIds;
  await expect(this.page!.locator(fields.name)).toHaveValue("");
  await expect(this.page!.locator(fields.cost)).toHaveValue("");
  await expect(this.page!.locator(fields.pool)).toHaveValue("");
  await expect(this.page!.locator(fields.description)).toHaveValue("");
});

Then("the modal should show special ability fields", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS["special-ability"].fieldTestIds;
  await expect(this.page!.locator(fields.name)).toBeVisible();
  await expect(this.page!.locator(fields.source)).toBeVisible();
  await expect(this.page!.locator(fields.description)).toBeVisible();
});

Then("all special ability fields should be empty", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS["special-ability"].fieldTestIds;
  await expect(this.page!.locator(fields.name)).toHaveValue("");
  await expect(this.page!.locator(fields.source)).toHaveValue("");
  await expect(this.page!.locator(fields.description)).toHaveValue("");
});

// ============================================================================
// FIELD FILLING STEPS
// ============================================================================

// Cypher fields
When("I fill in the cypher name with {string}", async function (this: CustomWorld, value: string) {
  await this.page!.locator(CARD_CONFIGS.cypher.fieldTestIds.name).fill(value);
});

When("I fill in the cypher level with {string}", async function (this: CustomWorld, value: string) {
  await this.page!.locator(CARD_CONFIGS.cypher.fieldTestIds.level).fill(value);
});

When(
  "I fill in the cypher effect with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page!.locator(CARD_CONFIGS.cypher.fieldTestIds.effect).fill(value);
  }
);

// Equipment fields
When(
  "I fill in the equipment name with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page!.locator(CARD_CONFIGS.equipment.fieldTestIds.name).fill(value);
  }
);

When(
  "I fill in the equipment description with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page!.locator(CARD_CONFIGS.equipment.fieldTestIds.description).fill(value);
  }
);

// Artifact fields
When(
  "I fill in the artifact name with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page!.locator(CARD_CONFIGS.artifact.fieldTestIds.name).fill(value);
  }
);

When(
  "I fill in the artifact level with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page!.locator(CARD_CONFIGS.artifact.fieldTestIds.level).fill(value);
  }
);

When(
  "I fill in the artifact effect with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page!.locator(CARD_CONFIGS.artifact.fieldTestIds.effect).fill(value);
  }
);

// Oddity fields
When("I fill in the oddity text with {string}", async function (this: CustomWorld, value: string) {
  await this.page!.locator(CARD_CONFIGS.oddity.fieldTestIds.oddity).fill(value);
});

// Attack fields
When("I fill in the attack name with {string}", async function (this: CustomWorld, value: string) {
  await this.page!.locator(CARD_CONFIGS.attack.fieldTestIds.name).fill(value);
});

When(
  "I fill in the attack damage with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page!.locator(CARD_CONFIGS.attack.fieldTestIds.damage).fill(value);
  }
);

When(
  "I fill in the attack modifier with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page!.locator(CARD_CONFIGS.attack.fieldTestIds.modifier).fill(value);
  }
);

When("I fill in the attack range with {string}", async function (this: CustomWorld, value: string) {
  await this.page!.locator(CARD_CONFIGS.attack.fieldTestIds.range).fill(value);
});

// Ability fields
When("I fill in the ability name with {string}", async function (this: CustomWorld, value: string) {
  await this.page!.locator(CARD_CONFIGS.ability.fieldTestIds.name).fill(value);
});

When("I fill in the ability cost with {string}", async function (this: CustomWorld, value: string) {
  await this.page!.locator(CARD_CONFIGS.ability.fieldTestIds.cost).fill(value);
});

When("I fill in the ability pool with {string}", async function (this: CustomWorld, value: string) {
  await this.page!.locator(CARD_CONFIGS.ability.fieldTestIds.pool).selectOption(
    value.toLowerCase()
  );
});

When(
  "I fill in the ability description with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page!.locator(CARD_CONFIGS.ability.fieldTestIds.description).fill(value);
  }
);

// Special ability fields
When(
  "I fill in the special ability name with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page!.locator(CARD_CONFIGS["special-ability"].fieldTestIds.name).fill(value);
  }
);

When(
  "I fill in the special ability source with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page!.locator(CARD_CONFIGS["special-ability"].fieldTestIds.source).fill(value);
  }
);

When(
  "I fill in the special ability description with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page!.locator(CARD_CONFIGS["special-ability"].fieldTestIds.description).fill(value);
  }
);

// ============================================================================
// CARD COUNT VERIFICATION STEPS
// ============================================================================

// Helper for Then steps
async function thenShouldSeeCards(
  world: CustomWorld,
  cardType: string,
  count: number
): Promise<void> {
  await world.page!.waitForTimeout(100);
  const config = CARD_CONFIGS[cardType];
  await expect(world.page!.locator(config.itemTestId)).toHaveCount(count);
}

// Cypher cards (singular and plural)
Then("I should see {int} cypher card", async function (this: CustomWorld, count: number) {
  await thenShouldSeeCards(this, "cypher", count);
});
Then("I should see {int} cypher cards", async function (this: CustomWorld, count: number) {
  await thenShouldSeeCards(this, "cypher", count);
});

// Equipment cards (singular and plural)
Then("I should see {int} equipment card", async function (this: CustomWorld, count: number) {
  await thenShouldSeeCards(this, "equipment", count);
});
Then("I should see {int} equipment cards", async function (this: CustomWorld, count: number) {
  await thenShouldSeeCards(this, "equipment", count);
});

// Artifact cards (singular and plural)
Then("I should see {int} artifact card", async function (this: CustomWorld, count: number) {
  await thenShouldSeeCards(this, "artifact", count);
});
Then("I should see {int} artifact cards", async function (this: CustomWorld, count: number) {
  await thenShouldSeeCards(this, "artifact", count);
});

// Oddity cards (singular and plural)
Then("I should see {int} oddity card", async function (this: CustomWorld, count: number) {
  await thenShouldSeeCards(this, "oddity", count);
});
Then("I should see {int} oddity cards", async function (this: CustomWorld, count: number) {
  await thenShouldSeeCards(this, "oddity", count);
});

// Attack cards (singular and plural)
Then("I should see {int} attack card", async function (this: CustomWorld, count: number) {
  await thenShouldSeeCards(this, "attack", count);
});
Then("I should see {int} attack cards", async function (this: CustomWorld, count: number) {
  await thenShouldSeeCards(this, "attack", count);
});

// Ability cards (singular and plural)
Then("I should see {int} ability card", async function (this: CustomWorld, count: number) {
  await thenShouldSeeCards(this, "ability", count);
});
Then("I should see {int} ability cards", async function (this: CustomWorld, count: number) {
  await thenShouldSeeCards(this, "ability", count);
});

// Special ability cards (singular and plural)
Then("I should see {int} special ability card", async function (this: CustomWorld, count: number) {
  await thenShouldSeeCards(this, "special-ability", count);
});
Then("I should see {int} special ability cards", async function (this: CustomWorld, count: number) {
  await thenShouldSeeCards(this, "special-ability", count);
});

// ============================================================================
// CARD CONTENT VERIFICATION STEPS
// ============================================================================

Then(
  "I should see a cypher card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page!.waitForTimeout(100);
    const card = this.page!.locator(CARD_CONFIGS.cypher.itemTestId).filter({ hasText: name });
    await expect(card).toBeVisible();
  }
);

Then(
  "the cypher {string} should have level {string}",
  async function (this: CustomWorld, name: string, level: string) {
    const card = this.page!.locator(CARD_CONFIGS.cypher.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(level);
  }
);

Then(
  "the cypher {string} should have effect {string}",
  async function (this: CustomWorld, name: string, effect: string) {
    const card = this.page!.locator(CARD_CONFIGS.cypher.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(effect);
  }
);

Then(
  "I should see an equipment card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page!.waitForTimeout(100);
    const card = this.page!.locator(CARD_CONFIGS.equipment.itemTestId).filter({ hasText: name });
    await expect(card).toBeVisible();
  }
);

Then(
  "the equipment {string} should have description {string}",
  async function (this: CustomWorld, name: string, description: string) {
    const card = this.page!.locator(CARD_CONFIGS.equipment.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(description);
  }
);

Then(
  "I should see an artifact card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page!.waitForTimeout(100);
    const card = this.page!.locator(CARD_CONFIGS.artifact.itemTestId).filter({ hasText: name });
    await expect(card).toBeVisible();
  }
);

Then(
  "the artifact {string} should have level {string}",
  async function (this: CustomWorld, name: string, level: string) {
    const card = this.page!.locator(CARD_CONFIGS.artifact.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(level);
  }
);

Then(
  "the artifact {string} should have effect {string}",
  async function (this: CustomWorld, name: string, effect: string) {
    const card = this.page!.locator(CARD_CONFIGS.artifact.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(effect);
  }
);

Then(
  "I should see an oddity card with text {string}",
  async function (this: CustomWorld, text: string) {
    await this.page!.waitForTimeout(100);
    const card = this.page!.locator(CARD_CONFIGS.oddity.itemTestId).filter({ hasText: text });
    await expect(card).toBeVisible();
  }
);

Then(
  "I should see an attack card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page!.waitForTimeout(100);
    const card = this.page!.locator(CARD_CONFIGS.attack.itemTestId).filter({ hasText: name });
    await expect(card).toBeVisible();
  }
);

Then(
  "the attack {string} should have modifier {string}",
  async function (this: CustomWorld, name: string, modifier: string) {
    const card = this.page!.locator(CARD_CONFIGS.attack.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(modifier);
  }
);

Then(
  "the attack {string} should have damage {string}",
  async function (this: CustomWorld, name: string, damage: string) {
    const card = this.page!.locator(CARD_CONFIGS.attack.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(damage);
  }
);

Then(
  "I should see an ability card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page!.waitForTimeout(100);
    const card = this.page!.locator(CARD_CONFIGS.ability.itemTestId).filter({ hasText: name });
    await expect(card).toBeVisible();
  }
);

Then(
  "the ability {string} should have cost {string}",
  async function (this: CustomWorld, name: string, cost: string) {
    const card = this.page!.locator(CARD_CONFIGS.ability.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(cost);
  }
);

Then(
  "the ability {string} should have pool {string}",
  async function (this: CustomWorld, name: string, pool: string) {
    const card = this.page!.locator(CARD_CONFIGS.ability.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(pool);
  }
);

Then(
  "I should see a special ability card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page!.waitForTimeout(100);
    const card = this.page!.locator(CARD_CONFIGS["special-ability"].itemTestId).filter({
      hasText: name,
    });
    await expect(card).toBeVisible();
  }
);

Then(
  "the special ability {string} should have source {string}",
  async function (this: CustomWorld, name: string, source: string) {
    const card = this.page!.locator(CARD_CONFIGS["special-ability"].itemTestId).filter({
      hasText: name,
    });
    await expect(card).toContainText(source);
  }
);

// ============================================================================
// MODAL INTERACTION STEPS
// ============================================================================

When("I confirm the card edit modal", async function (this: CustomWorld) {
  await this.page!.locator('[data-testid="card-modal-confirm"]').click();
  await this.page!.waitForSelector('[data-testid="card-edit-modal"]', {
    state: "hidden",
    timeout: 2000,
  }).catch(() => {});
  await this.page!.waitForTimeout(200);
});

When("I cancel the card edit modal", async function (this: CustomWorld) {
  await this.page!.locator('[data-testid="card-modal-cancel"]').click();
  await this.page!.waitForSelector('[data-testid="card-edit-modal"]', {
    state: "hidden",
    timeout: 2000,
  }).catch(() => {});
});

Then("the card edit modal should be open", async function (this: CustomWorld) {
  await expect(this.page!.locator('[data-testid="card-edit-modal"]')).toBeVisible();
});

// ============================================================================
// EDIT EXISTING CARD STEPS
// ============================================================================

async function clickEditButton(
  world: CustomWorld,
  cardType: string,
  identifier: string
): Promise<void> {
  const config = CARD_CONFIGS[cardType];
  const card = world.page!.locator(config.itemTestId).filter({ hasText: identifier });
  const editButton = card.locator(`[data-testid^="${config.editButtonPrefix}"]`);
  await editButton.click();
  await world.page!.waitForSelector('[data-testid="card-edit-modal"]', { timeout: 5000 });
}

When(
  "I click the edit button on cypher {string}",
  async function (this: CustomWorld, name: string) {
    await clickEditButton(this, "cypher", name);
  }
);

When(
  "I click the edit button on equipment {string}",
  async function (this: CustomWorld, name: string) {
    await clickEditButton(this, "equipment", name);
  }
);

When(
  "I click the edit button on artifact {string}",
  async function (this: CustomWorld, name: string) {
    await clickEditButton(this, "artifact", name);
  }
);

When(
  "I click the edit button on oddity {string}",
  async function (this: CustomWorld, text: string) {
    await clickEditButton(this, "oddity", text);
  }
);

When(
  "I click the edit button on attack {string}",
  async function (this: CustomWorld, name: string) {
    await clickEditButton(this, "attack", name);
  }
);

When(
  "I click the edit button on ability {string}",
  async function (this: CustomWorld, name: string) {
    await clickEditButton(this, "ability", name);
  }
);

When(
  "I click the edit button on special ability {string}",
  async function (this: CustomWorld, name: string) {
    await clickEditButton(this, "special-ability", name);
  }
);
