import { When, Then, Given } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";
import { waitForSaveComplete } from "../support/save.js";

Given("the character has the following data:", async function (this: CustomWorld, dataTable) {
  const rows = dataTable.raw();
  const data: Record<string, string> = {};

  for (let i = 1; i < rows.length; i++) {
    const [field, value] = rows[i];
    data[field] = value;
  }

  const overrides: Record<string, unknown> = {
    textFields: {
      background: data.background || "",
      notes: data.notes || "",
    },
  };
  // Omit rather than pass undefined, so an unspecified name/type falls
  // through to this.setup.character's own default instead of overwriting it.
  if (data.name) overrides.name = data.name;
  if (data.type) overrides.type = data.type;

  await this.setup.character(overrides);
});

When("I select {string} from the type dropdown", async function (this: CustomWorld, type: string) {
  const select = this.page.locator('[data-testid="character-type-select"]');
  await select.selectOption(type);
});

Then(
  "the type dropdown should show {string} as selected",
  async function (this: CustomWorld, type: string) {
    const select = this.page.locator('[data-testid="character-type-select"]');
    await expect(select).toHaveValue(type);
  }
);

Then(
  "the type dropdown should have {int} options",
  async function (this: CustomWorld, count: number) {
    const select = this.page.locator('[data-testid="character-type-select"]');
    const options = await select.locator("option").count();
    expect(options).toBe(count);
  }
);

Then(
  "the type dropdown options should be {string}, {string}, {string}",
  async function (this: CustomWorld, option1: string, option2: string, option3: string) {
    const select = this.page.locator('[data-testid="character-type-select"]');
    const options = await select.locator("option").allTextContents();
    expect(options).toHaveLength(3);
    expect(options).toContain(option1);
    expect(options).toContain(option2);
    expect(options).toContain(option3);
  }
);

Then(
  "the character data should have type {string}",
  async function (this: CustomWorld, type: string) {
    await waitForSaveComplete(this.page);

    const storedData = await this.storageHelper.getCharacter();

    expect(storedData).toBeTruthy();
    expect(storedData.type).toBe(type);
  }
);

Then(
  "the type dropdown label should be {string}",
  async function (this: CustomWorld, label: string) {
    const select = this.page.locator('[data-testid="character-type-select"]');
    const ariaLabel = await select.getAttribute("aria-label");
    expect(ariaLabel).toBe(label);
  }
);

Then(
  "the type dropdown option for {string} should display as {string}",
  async function (this: CustomWorld, optionValue: string, displayText: string) {
    const select = this.page.locator('[data-testid="character-type-select"]');
    const option = select.locator(`option[value="${optionValue}"]`);
    const text = await option.textContent();
    expect(text).toBe(displayText);
  }
);
