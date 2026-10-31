import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";
import { CARD_CONFIGS } from "../support/cardTestFixtures.js";

// ============================================================================
// MODAL FIELD VERIFICATION STEPS
// ============================================================================

Then("the modal should show cypher fields", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.cypher.fieldTestIds;
  await expect(this.page.locator(fields.name)).toBeVisible();
  await expect(this.page.locator(fields.level)).toBeVisible();
  await expect(this.page.locator(fields.effect)).toBeVisible();
});

Then("all cypher fields should be empty", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.cypher.fieldTestIds;
  await expect(this.page.locator(fields.name)).toHaveValue("");
  await expect(this.page.locator(fields.level)).toHaveValue("");
  await expect(this.page.locator(fields.effect)).toHaveValue("");
});

Then("the modal should show equipment fields", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.equipment.fieldTestIds;
  await expect(this.page.locator(fields.name)).toBeVisible();
  await expect(this.page.locator(fields.description)).toBeVisible();
});

Then("all equipment fields should be empty", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.equipment.fieldTestIds;
  await expect(this.page.locator(fields.name)).toHaveValue("");
  await expect(this.page.locator(fields.description)).toHaveValue("");
});

Then("the modal should show artifact fields", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.artifact.fieldTestIds;
  await expect(this.page.locator(fields.name)).toBeVisible();
  await expect(this.page.locator(fields.level)).toBeVisible();
  await expect(this.page.locator(fields.effect)).toBeVisible();
});

Then("all artifact fields should be empty", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.artifact.fieldTestIds;
  await expect(this.page.locator(fields.name)).toHaveValue("");
  await expect(this.page.locator(fields.level)).toHaveValue("");
  await expect(this.page.locator(fields.effect)).toHaveValue("");
});

Then("the modal should show oddity fields", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.oddity.fieldTestIds;
  await expect(this.page.locator(fields.oddity)).toBeVisible();
});

Then("all oddity fields should be empty", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.oddity.fieldTestIds;
  await expect(this.page.locator(fields.oddity)).toHaveValue("");
});

Then("the modal should show attack fields", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.attack.fieldTestIds;
  await expect(this.page.locator(fields.name)).toBeVisible();
  await expect(this.page.locator(fields.damage)).toBeVisible();
  await expect(this.page.locator(fields.modifier)).toBeVisible();
  await expect(this.page.locator(fields.range)).toBeVisible();
});

Then("all attack fields should be empty", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.attack.fieldTestIds;
  await expect(this.page.locator(fields.name)).toHaveValue("");
  await expect(this.page.locator(fields.damage)).toHaveValue("0");
  await expect(this.page.locator(fields.modifier)).toHaveValue("0");
  await expect(this.page.locator(fields.range)).toHaveValue("");
});

Then("the modal should show ability fields", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.ability.fieldTestIds;
  await expect(this.page.locator(fields.name)).toBeVisible();
  await expect(this.page.locator(fields.cost)).toBeVisible();
  await expect(this.page.locator(fields.pool)).toBeVisible();
  await expect(this.page.locator(fields.description)).toBeVisible();
});

Then("all ability fields should be empty", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS.ability.fieldTestIds;
  await expect(this.page.locator(fields.name)).toHaveValue("");
  await expect(this.page.locator(fields.cost)).toHaveValue("");
  await expect(this.page.locator(fields.pool)).toHaveValue("");
  await expect(this.page.locator(fields.description)).toHaveValue("");
});

Then("the modal should show special ability fields", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS["special-ability"].fieldTestIds;
  await expect(this.page.locator(fields.name)).toBeVisible();
  await expect(this.page.locator(fields.source)).toBeVisible();
  await expect(this.page.locator(fields.description)).toBeVisible();
});

Then("all special ability fields should be empty", async function (this: CustomWorld) {
  const fields = CARD_CONFIGS["special-ability"].fieldTestIds;
  await expect(this.page.locator(fields.name)).toHaveValue("");
  await expect(this.page.locator(fields.source)).toHaveValue("");
  await expect(this.page.locator(fields.description)).toHaveValue("");
});

// ============================================================================
// FIELD FILLING STEPS
// ============================================================================

// Cypher fields
When("I fill in the cypher name with {string}", async function (this: CustomWorld, value: string) {
  await this.page.locator(CARD_CONFIGS.cypher.fieldTestIds.name).fill(value);
});

When("I fill in the cypher level with {string}", async function (this: CustomWorld, value: string) {
  await this.page.locator(CARD_CONFIGS.cypher.fieldTestIds.level).fill(value);
});

When(
  "I fill in the cypher effect with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS.cypher.fieldTestIds.effect).fill(value);
  }
);

// Equipment fields
When(
  "I fill in the equipment name with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS.equipment.fieldTestIds.name).fill(value);
  }
);

When(
  "I fill in the equipment description with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS.equipment.fieldTestIds.description).fill(value);
  }
);

// Artifact fields
When(
  "I fill in the artifact name with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS.artifact.fieldTestIds.name).fill(value);
  }
);

When(
  "I fill in the artifact level with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS.artifact.fieldTestIds.level).fill(value);
  }
);

When(
  "I fill in the artifact effect with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS.artifact.fieldTestIds.effect).fill(value);
  }
);

// Oddity fields
When("I fill in the oddity text with {string}", async function (this: CustomWorld, value: string) {
  await this.page.locator(CARD_CONFIGS.oddity.fieldTestIds.oddity).fill(value);
});

// Attack fields
When("I fill in the attack name with {string}", async function (this: CustomWorld, value: string) {
  await this.page.locator(CARD_CONFIGS.attack.fieldTestIds.name).fill(value);
});

When(
  "I fill in the attack damage with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS.attack.fieldTestIds.damage).fill(value);
  }
);

When(
  "I fill in the attack modifier with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS.attack.fieldTestIds.modifier).fill(value);
  }
);

// Ability fields
When("I fill in the ability name with {string}", async function (this: CustomWorld, value: string) {
  await this.page.locator(CARD_CONFIGS.ability.fieldTestIds.name).fill(value);
});

When("I fill in the ability cost with {string}", async function (this: CustomWorld, value: string) {
  await this.page.locator(CARD_CONFIGS.ability.fieldTestIds.cost).fill(value);
});

When("I fill in the ability pool with {string}", async function (this: CustomWorld, value: string) {
  await this.page.locator(CARD_CONFIGS.ability.fieldTestIds.pool).selectOption(value.toLowerCase());
});

When(
  "I fill in the ability description with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS.ability.fieldTestIds.description).fill(value);
  }
);

// Special ability fields
When(
  "I fill in the special ability name with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS["special-ability"].fieldTestIds.name).fill(value);
  }
);

When(
  "I fill in the special ability source with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS["special-ability"].fieldTestIds.source).fill(value);
  }
);

When(
  "I fill in the special ability description with {string}",
  async function (this: CustomWorld, value: string) {
    await this.page.locator(CARD_CONFIGS["special-ability"].fieldTestIds.description).fill(value);
  }
);
