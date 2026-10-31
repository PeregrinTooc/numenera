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
