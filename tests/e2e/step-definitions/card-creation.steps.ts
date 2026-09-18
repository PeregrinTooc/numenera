import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";
import { CARD_CONFIGS } from "../support/cardTestFixtures.js";

// ============================================================================
// PARAMETERIZED PRECONDITION STEPS
// ============================================================================

// Helper for Given steps
async function givenCharacterHasCards(
  world: CustomWorld,
  cardType: string,
  count: number
): Promise<void> {
  await world.cards.setupWithCount(cardType, count);
  await world.cards.expectHasCount(cardType, count);
}

// Cypher cards
Given("the character has {int} cypher cards", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "cypher", count);
});

// Equipment cards
Given("the character has {int} equipment cards", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "equipment", count);
});

// Artifact cards
Given("the character has {int} artifact cards", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "artifact", count);
});

// Oddity cards
Given("the character has {int} oddity cards", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "oddity", count);
});

// Attack cards
Given("the character has {int} attack cards", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "attack", count);
});

// Ability cards
Given("the character has {int} ability cards", async function (this: CustomWorld, count: number) {
  await givenCharacterHasCards(this, "ability", count);
});

// Special ability cards
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
  await expect(this.page.locator(CARD_CONFIGS.cypher.addButtonTestId)).toBeVisible();
});

Then("I should see an add equipment button", async function (this: CustomWorld) {
  await expect(this.page.locator(CARD_CONFIGS.equipment.addButtonTestId)).toBeVisible();
});

Then("I should see an add artifact button", async function (this: CustomWorld) {
  await expect(this.page.locator(CARD_CONFIGS.artifact.addButtonTestId)).toBeVisible();
});

Then("I should see an add oddity button", async function (this: CustomWorld) {
  await expect(this.page.locator(CARD_CONFIGS.oddity.addButtonTestId)).toBeVisible();
});

Then("I should see an add attack button", async function (this: CustomWorld) {
  await expect(this.page.locator(CARD_CONFIGS.attack.addButtonTestId)).toBeVisible();
});

Then(
  "the add attack button should have a non-transparent background",
  async function (this: CustomWorld) {
    // Tailwind only generates CSS for class names it finds as literal text
    // during its build-time scan, so a `bg-${colorTheme}-100`-style
    // interpolated class silently produces no rule and the button renders
    // fully transparent - a plain "is the class present" check can't catch
    // this, only the actual computed style can.
    const button = this.page.locator(CARD_CONFIGS.attack.addButtonTestId);
    const bgColor = await button.evaluate(
      (el: HTMLElement) => window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(bgColor).not.toBe("transparent");
  }
);

Then("I should see an add ability button", async function (this: CustomWorld) {
  await expect(this.page.locator(CARD_CONFIGS.ability.addButtonTestId)).toBeVisible();
});

Then("I should see an add special ability button", async function (this: CustomWorld) {
  await expect(this.page.locator(CARD_CONFIGS["special-ability"].addButtonTestId)).toBeVisible();
});

// ============================================================================
// ADD BUTTON CLICK STEPS
// ============================================================================

When("I click the add cypher button", async function (this: CustomWorld) {
  await this.cards.clickAddButton("cypher");
});

When("I click the add equipment button", async function (this: CustomWorld) {
  await this.cards.clickAddButton("equipment");
});

When("I click the add artifact button", async function (this: CustomWorld) {
  await this.cards.clickAddButton("artifact");
});

When("I click the add oddity button", async function (this: CustomWorld) {
  await this.cards.clickAddButton("oddity");
});

When("I click the add attack button", async function (this: CustomWorld) {
  await this.cards.clickAddButton("attack");
});

When("I click the add ability button", async function (this: CustomWorld) {
  await this.cards.clickAddButton("ability");
});

When("I click the add special ability button", async function (this: CustomWorld) {
  await this.cards.clickAddButton("special-ability");
});

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

// ============================================================================
// CARD COUNT VERIFICATION STEPS
// ============================================================================

// Cypher cards (singular and plural)
Then("I should see {int} cypher card(s)", async function (this: CustomWorld, count: number) {
  await this.cards.expectVisibleCount("cypher", count);
});

// Equipment cards
Then("I should see {int} equipment cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectVisibleCount("equipment", count);
});

// Artifact cards
Then("I should see {int} artifact cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectVisibleCount("artifact", count);
});

// Oddity cards
Then("I should see {int} oddity cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectVisibleCount("oddity", count);
});

// Attack cards
Then("I should see {int} attack cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectVisibleCount("attack", count);
});

// Ability cards
Then("I should see {int} ability cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectVisibleCount("ability", count);
});

// Special ability cards
Then("I should see {int} special ability cards", async function (this: CustomWorld, count: number) {
  await this.cards.expectVisibleCount("special-ability", count);
});

// ============================================================================
// CARD CONTENT VERIFICATION STEPS
// ============================================================================

Then(
  "I should see a cypher card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page.waitForTimeout(100);
    const card = this.page.locator(CARD_CONFIGS.cypher.itemTestId).filter({ hasText: name });
    await expect(card).toBeVisible();
  }
);

Then(
  "the cypher {string} should have level {string}",
  async function (this: CustomWorld, name: string, level: string) {
    const card = this.page.locator(CARD_CONFIGS.cypher.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(level);
  }
);

Then(
  "the cypher {string} should have effect {string}",
  async function (this: CustomWorld, name: string, effect: string) {
    const card = this.page.locator(CARD_CONFIGS.cypher.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(effect);
  }
);

Then(
  "I should see an equipment card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page.waitForTimeout(100);
    const card = this.page.locator(CARD_CONFIGS.equipment.itemTestId).filter({ hasText: name });
    await expect(card).toBeVisible();
  }
);

Then(
  "the equipment {string} should have description {string}",
  async function (this: CustomWorld, name: string, description: string) {
    const card = this.page.locator(CARD_CONFIGS.equipment.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(description);
  }
);

Then(
  "I should see an artifact card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page.waitForTimeout(100);
    const card = this.page.locator(CARD_CONFIGS.artifact.itemTestId).filter({ hasText: name });
    await expect(card).toBeVisible();
  }
);

Then(
  "the artifact {string} should have level {string}",
  async function (this: CustomWorld, name: string, level: string) {
    const card = this.page.locator(CARD_CONFIGS.artifact.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(level);
  }
);

Then(
  "the artifact {string} should have effect {string}",
  async function (this: CustomWorld, name: string, effect: string) {
    const card = this.page.locator(CARD_CONFIGS.artifact.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(effect);
  }
);

Then(
  "I should see an oddity card with text {string}",
  async function (this: CustomWorld, text: string) {
    await this.page.waitForTimeout(100);
    const card = this.page.locator(CARD_CONFIGS.oddity.itemTestId).filter({ hasText: text });
    await expect(card).toBeVisible();
  }
);

Then(
  "I should see an attack card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page.waitForTimeout(100);
    const card = this.page.locator(CARD_CONFIGS.attack.itemTestId).filter({ hasText: name });
    await expect(card).toBeVisible();
  }
);

Then(
  "the attack {string} should have modifier {string}",
  async function (this: CustomWorld, name: string, modifier: string) {
    const card = this.page.locator(CARD_CONFIGS.attack.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(modifier);
  }
);

Then(
  "the attack {string} should have damage {string}",
  async function (this: CustomWorld, name: string, damage: string) {
    const card = this.page.locator(CARD_CONFIGS.attack.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(damage);
  }
);

Then(
  "I should see an ability card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page.waitForTimeout(100);
    const card = this.page.locator(CARD_CONFIGS.ability.itemTestId).filter({ hasText: name });
    await expect(card).toBeVisible();
  }
);

Then(
  "the ability {string} should have cost {string}",
  async function (this: CustomWorld, name: string, cost: string) {
    const card = this.page.locator(CARD_CONFIGS.ability.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(cost);
  }
);

Then(
  "the ability {string} should have pool {string}",
  async function (this: CustomWorld, name: string, pool: string) {
    const card = this.page.locator(CARD_CONFIGS.ability.itemTestId).filter({ hasText: name });
    await expect(card).toContainText(pool);
  }
);

Then(
  "I should see a special ability card with name {string}",
  async function (this: CustomWorld, name: string) {
    await this.page.waitForTimeout(100);
    const card = this.page.locator(CARD_CONFIGS["special-ability"].itemTestId).filter({
      hasText: name,
    });
    await expect(card).toBeVisible();
  }
);

Then(
  "the special ability {string} should have source {string}",
  async function (this: CustomWorld, name: string, source: string) {
    const card = this.page.locator(CARD_CONFIGS["special-ability"].itemTestId).filter({
      hasText: name,
    });
    await expect(card).toContainText(source);
  }
);

// ============================================================================
// MODAL INTERACTION STEPS
// ============================================================================

When("I confirm the card edit modal", async function (this: CustomWorld) {
  await this.page.locator('[data-testid="card-modal-confirm"]').click();
  await this.page
    .waitForSelector('[data-testid="card-edit-modal"]', {
      state: "hidden",
      timeout: 2000,
    })
    .catch(() => {});
  await this.page.waitForTimeout(200);
});

When("I cancel the card edit modal", async function (this: CustomWorld) {
  await this.page.locator('[data-testid="card-modal-cancel"]').click();
  await this.page
    .waitForSelector('[data-testid="card-edit-modal"]', {
      state: "hidden",
      timeout: 2000,
    })
    .catch(() => {});
});

Then("the card edit modal should be open", async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="card-edit-modal"]')).toBeVisible();

  // openCardEditModal() defers its auto-focus via setTimeout(0)
  // (ModalContainer.focusElement in modalBehavior.ts) so it doesn't fight
  // the click that opened the modal. The modal's own Escape/Tab handling
  // is a @keydown listener on its backdrop element, which only ever sees
  // the event if it bubbles up from something focused inside the modal.
  // A keyboard step run right after this one can otherwise race that
  // deferred focus and land on whatever was focused before the modal
  // opened, silently missing the modal's listener entirely.
  await this.page.waitForFunction(() => {
    const modal = document.querySelector('[data-testid="card-edit-modal"]');
    return !!modal && modal.contains(document.activeElement);
  });
});

// ============================================================================
// EDIT EXISTING CARD STEPS
// ============================================================================

When(
  "I click the edit button on cypher {string}",
  async function (this: CustomWorld, name: string) {
    await this.cards.clickEditButton("cypher", name);
  }
);

When(
  "I click the edit button on equipment {string}",
  async function (this: CustomWorld, name: string) {
    await this.cards.clickEditButton("equipment", name);
  }
);

When(
  "I click the edit button on artifact {string}",
  async function (this: CustomWorld, name: string) {
    await this.cards.clickEditButton("artifact", name);
  }
);

When(
  "I click the edit button on oddity {string}",
  async function (this: CustomWorld, text: string) {
    await this.cards.clickEditButton("oddity", text);
  }
);

When(
  "I click the edit button on attack {string}",
  async function (this: CustomWorld, name: string) {
    await this.cards.clickEditButton("attack", name);
  }
);

When(
  "I click the edit button on ability {string}",
  async function (this: CustomWorld, name: string) {
    await this.cards.clickEditButton("ability", name);
  }
);

When(
  "I click the edit button on special ability {string}",
  async function (this: CustomWorld, name: string) {
    await this.cards.clickEditButton("special-ability", name);
  }
);
