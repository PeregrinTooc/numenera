import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";

// ============================================================================
// GIVEN STEPS - Setup character state
// ============================================================================

Given("the character data is loaded", async function (this: CustomWorld) {
  // Just wait for the page to be loaded - character data is already in localStorage
  await this.page!.waitForLoadState("domcontentloaded");
});

// ============================================================================
// WHEN STEPS - User actions for clicking stat pool values
// ============================================================================

// Might Pool actions
When("I click on the Might Pool value", async function (this: CustomWorld) {
  const mightPool = this.page!.locator('[data-testid="stat-might-pool"]');
  await mightPool.click();
});

When("I tap on the Might Pool value", async function (this: CustomWorld) {
  const mightPool = this.page!.locator('[data-testid="stat-might-pool"]');
  await mightPool.tap();
});

// Might Edge actions
When("I click on the Might Edge value", async function (this: CustomWorld) {
  const mightEdge = this.page!.locator('[data-testid="stat-might-edge"]');
  await mightEdge.click();
});

When("I tap on the Might Edge value", async function (this: CustomWorld) {
  const mightEdge = this.page!.locator('[data-testid="stat-might-edge"]');
  await mightEdge.tap();
});

// Might Current actions
When("I click on the Might Current value", async function (this: CustomWorld) {
  const mightCurrent = this.page!.locator('[data-testid="stat-might-current"]');
  await mightCurrent.click();
});

When("I tap on the Might Current value", async function (this: CustomWorld) {
  const mightCurrent = this.page!.locator('[data-testid="stat-might-current"]');
  await mightCurrent.tap();
});

// Speed Pool actions
When("I click on the Speed Pool value", async function (this: CustomWorld) {
  const speedPool = this.page!.locator('[data-testid="stat-speed-pool"]');
  await speedPool.click();
});

When("I tap on the Speed Pool value", async function (this: CustomWorld) {
  const speedPool = this.page!.locator('[data-testid="stat-speed-pool"]');
  await speedPool.tap();
});

// Speed Edge actions
When("I click on the Speed Edge value", async function (this: CustomWorld) {
  const speedEdge = this.page!.locator('[data-testid="stat-speed-edge"]');
  await speedEdge.click();
});

When("I tap on the Speed Edge value", async function (this: CustomWorld) {
  const speedEdge = this.page!.locator('[data-testid="stat-speed-edge"]');
  await speedEdge.tap();
});

// Speed Current actions
When("I click on the Speed Current value", async function (this: CustomWorld) {
  const speedCurrent = this.page!.locator('[data-testid="stat-speed-current"]');
  await speedCurrent.click();
});

When("I tap on the Speed Current value", async function (this: CustomWorld) {
  const speedCurrent = this.page!.locator('[data-testid="stat-speed-current"]');
  await speedCurrent.tap();
});

// Intellect Pool actions
When("I click on the Intellect Pool value", async function (this: CustomWorld) {
  const intellectPool = this.page!.locator('[data-testid="stat-intellect-pool"]');
  await intellectPool.click();
});

When("I tap on the Intellect Pool value", async function (this: CustomWorld) {
  const intellectPool = this.page!.locator('[data-testid="stat-intellect-pool"]');
  await intellectPool.tap();
});

// Intellect Edge actions
When("I click on the Intellect Edge value", async function (this: CustomWorld) {
  const intellectEdge = this.page!.locator('[data-testid="stat-intellect-edge"]');
  await intellectEdge.click();
});

When("I tap on the Intellect Edge value", async function (this: CustomWorld) {
  const intellectEdge = this.page!.locator('[data-testid="stat-intellect-edge"]');
  await intellectEdge.tap();
});

// Intellect Current actions
When("I click on the Intellect Current value", async function (this: CustomWorld) {
  const intellectCurrent = this.page!.locator('[data-testid="stat-intellect-current"]');
  await intellectCurrent.click();
});

When("I tap on the Intellect Current value", async function (this: CustomWorld) {
  const intellectCurrent = this.page!.locator('[data-testid="stat-intellect-current"]');
  await intellectCurrent.tap();
});

// ============================================================================
// THEN STEPS - Assertions for display
// ============================================================================

// Might Pool assertions
Then("I should see the Might Pool value displayed", async function (this: CustomWorld) {
  const mightPool = this.page!.locator('[data-testid="stat-might-pool"]');
  await expect(mightPool).toBeVisible();
});

Then(
  "the Might Pool value should display {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const mightPool = this.page!.locator('[data-testid="stat-might-pool"]');
    await expect(mightPool).toHaveText(expectedValue);
  }
);

Then("the Might Pool value should not have changed", async function (this: CustomWorld) {
  // Get the original value that was displayed before the edit attempt
  const mightPool = this.page!.locator('[data-testid="stat-might-pool"]');
  const currentValue = await mightPool.textContent();

  // Verify it matches the expected default from FULL_CHARACTER (17)
  expect(currentValue).toBe("17");
});

// Might Edge assertions
Then("I should see the Might Edge value displayed", async function (this: CustomWorld) {
  const mightEdge = this.page!.locator('[data-testid="stat-might-edge"]');
  await expect(mightEdge).toBeVisible();
});

Then(
  "the Might Edge value should display {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const mightEdge = this.page!.locator('[data-testid="stat-might-edge"]');
    await expect(mightEdge).toHaveText(expectedValue);
  }
);

Then("the Might Edge value should not have changed", async function (this: CustomWorld) {
  const mightEdge = this.page!.locator('[data-testid="stat-might-edge"]');
  const currentValue = await mightEdge.textContent();
  expect(currentValue).toBe("1");
});

// Might Current assertions
Then("I should see the Might Current value displayed", async function (this: CustomWorld) {
  const mightCurrent = this.page!.locator('[data-testid="stat-might-current"]');
  await expect(mightCurrent).toBeVisible();
});

Then(
  "the Might Current value should display {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const mightCurrent = this.page!.locator('[data-testid="stat-might-current"]');
    await expect(mightCurrent).toHaveText(expectedValue);
  }
);

Then("the Might Current value should not have changed", async function (this: CustomWorld) {
  const mightCurrent = this.page!.locator('[data-testid="stat-might-current"]');
  const currentValue = await mightCurrent.textContent();
  expect(currentValue).toBe("17");
});

// Speed Pool assertions
Then("I should see the Speed Pool value displayed", async function (this: CustomWorld) {
  const speedPool = this.page!.locator('[data-testid="stat-speed-pool"]');
  await expect(speedPool).toBeVisible();
});

Then(
  "the Speed Pool value should display {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const speedPool = this.page!.locator('[data-testid="stat-speed-pool"]');
    await expect(speedPool).toHaveText(expectedValue);
  }
);

Then("the Speed Pool value should not have changed", async function (this: CustomWorld) {
  const speedPool = this.page!.locator('[data-testid="stat-speed-pool"]');
  const currentValue = await speedPool.textContent();
  expect(currentValue).toBe("14");
});

// Speed Edge assertions
Then("I should see the Speed Edge value displayed", async function (this: CustomWorld) {
  const speedEdge = this.page!.locator('[data-testid="stat-speed-edge"]');
  await expect(speedEdge).toBeVisible();
});

Then(
  "the Speed Edge value should display {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const speedEdge = this.page!.locator('[data-testid="stat-speed-edge"]');
    await expect(speedEdge).toHaveText(expectedValue);
  }
);

Then("the Speed Edge value should not have changed", async function (this: CustomWorld) {
  const speedEdge = this.page!.locator('[data-testid="stat-speed-edge"]');
  const currentValue = await speedEdge.textContent();
  expect(currentValue).toBe("1");
});

// Speed Current assertions
Then("I should see the Speed Current value displayed", async function (this: CustomWorld) {
  const speedCurrent = this.page!.locator('[data-testid="stat-speed-current"]');
  await expect(speedCurrent).toBeVisible();
});

Then(
  "the Speed Current value should display {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const speedCurrent = this.page!.locator('[data-testid="stat-speed-current"]');
    await expect(speedCurrent).toHaveText(expectedValue);
  }
);

Then("the Speed Current value should not have changed", async function (this: CustomWorld) {
  const speedCurrent = this.page!.locator('[data-testid="stat-speed-current"]');
  const currentValue = await speedCurrent.textContent();
  expect(currentValue).toBe("14");
});

// Intellect Pool assertions
Then("I should see the Intellect Pool value displayed", async function (this: CustomWorld) {
  const intellectPool = this.page!.locator('[data-testid="stat-intellect-pool"]');
  await expect(intellectPool).toBeVisible();
});

Then(
  "the Intellect Pool value should display {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const intellectPool = this.page!.locator('[data-testid="stat-intellect-pool"]');
    await expect(intellectPool).toHaveText(expectedValue);
  }
);

Then("the Intellect Pool value should not have changed", async function (this: CustomWorld) {
  const intellectPool = this.page!.locator('[data-testid="stat-intellect-pool"]');
  const currentValue = await intellectPool.textContent();
  expect(currentValue).toBe("12");
});

// Intellect Edge assertions
Then("I should see the Intellect Edge value displayed", async function (this: CustomWorld) {
  const intellectEdge = this.page!.locator('[data-testid="stat-intellect-edge"]');
  await expect(intellectEdge).toBeVisible();
});

Then(
  "the Intellect Edge value should display {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const intellectEdge = this.page!.locator('[data-testid="stat-intellect-edge"]');
    await expect(intellectEdge).toHaveText(expectedValue);
  }
);

Then("the Intellect Edge value should not have changed", async function (this: CustomWorld) {
  const intellectEdge = this.page!.locator('[data-testid="stat-intellect-edge"]');
  const currentValue = await intellectEdge.textContent();
  expect(currentValue).toBe("1");
});

// Intellect Current assertions
Then("I should see the Intellect Current value displayed", async function (this: CustomWorld) {
  const intellectCurrent = this.page!.locator('[data-testid="stat-intellect-current"]');
  await expect(intellectCurrent).toBeVisible();
});

Then(
  "the Intellect Current value should display {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const intellectCurrent = this.page!.locator('[data-testid="stat-intellect-current"]');
    await expect(intellectCurrent).toHaveText(expectedValue);
  }
);

Then("the Intellect Current value should not have changed", async function (this: CustomWorld) {
  const intellectCurrent = this.page!.locator('[data-testid="stat-intellect-current"]');
  const currentValue = await intellectCurrent.textContent();
  expect(currentValue).toBe("12");
});

// ============================================================================
// THEN STEPS - Modal assertions
// ============================================================================

Then(
  "the input field should contain the current Might Pool value",
  async function (this: CustomWorld) {
    const input = this.page!.locator('[data-testid="edit-modal-input"]');
    await expect(input).toHaveValue("17");
  }
);

Then(
  "the input field should contain the current Might Edge value",
  async function (this: CustomWorld) {
    const input = this.page!.locator('[data-testid="edit-modal-input"]');
    await expect(input).toHaveValue("1");
  }
);

Then(
  "the input field should contain the current Might Current value",
  async function (this: CustomWorld) {
    const input = this.page!.locator('[data-testid="edit-modal-input"]');
    await expect(input).toHaveValue("17");
  }
);

Then(
  "the input field should contain the current Speed Pool value",
  async function (this: CustomWorld) {
    const input = this.page!.locator('[data-testid="edit-modal-input"]');
    await expect(input).toHaveValue("14");
  }
);

Then(
  "the input field should contain the current Speed Edge value",
  async function (this: CustomWorld) {
    const input = this.page!.locator('[data-testid="edit-modal-input"]');
    await expect(input).toHaveValue("1");
  }
);

Then(
  "the input field should contain the current Speed Current value",
  async function (this: CustomWorld) {
    const input = this.page!.locator('[data-testid="edit-modal-input"]');
    await expect(input).toHaveValue("14");
  }
);

Then(
  "the input field should contain the current Intellect Pool value",
  async function (this: CustomWorld) {
    const input = this.page!.locator('[data-testid="edit-modal-input"]');
    await expect(input).toHaveValue("12");
  }
);

Then(
  "the input field should contain the current Intellect Edge value",
  async function (this: CustomWorld) {
    const input = this.page!.locator('[data-testid="edit-modal-input"]');
    await expect(input).toHaveValue("1");
  }
);

Then(
  "the input field should contain the current Intellect Current value",
  async function (this: CustomWorld) {
    const input = this.page!.locator('[data-testid="edit-modal-input"]');
    await expect(input).toHaveValue("12");
  }
);
