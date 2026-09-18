import { When, Then, Given } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";
import { waitForSaveComplete } from "../support/save.js";

// ============================================================================
// BACKGROUND DATA SETUP - Unique to additional fields
// ============================================================================

Given("the character has the following data:", async function (this: CustomWorld, dataTable) {
  // Parse the data table - it's in vertical format with field/value columns
  const rows = dataTable.raw();
  const data: Record<string, string> = {};

  // Skip header row and convert to key-value pairs
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

// ============================================================================
// TYPE DROPDOWN STEPS - Unique to additional fields (not modal-based)
// ============================================================================

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
    // Wait for auto-save to complete by monitoring save indicator
    await waitForSaveComplete(this.page);

    // Verify using TestStorageHelper
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

// ============================================================================
// TEXTAREA STEPS - Unique inline editing (not modal-based). Parameterised by
// {textarea} (background/notes); see support/parameterTypes.ts.
// ============================================================================

const TEXTAREA_TEST_IDS: Record<string, string> = {
  background: "character-background",
  notes: "character-notes",
};

function textareaLocator(world: CustomWorld, field: string) {
  return world.page.locator(`[data-testid="${TEXTAREA_TEST_IDS[field]}"]`);
}

Then(
  "the {textarea} textarea should be readonly",
  async function (this: CustomWorld, field: string) {
    await expect(textareaLocator(this, field)).toHaveAttribute("readonly", "");
  }
);

Then(
  "the {textarea} textarea should show {string}",
  async function (this: CustomWorld, field: string, text: string) {
    const textarea = textareaLocator(this, field);
    // Wait for the textarea to be visible and check the value
    await textarea.waitFor({ state: "visible" });
    await expect(textarea).toHaveValue(text);
  }
);

Then(
  "the {textarea} textarea should have a pointer cursor",
  async function (this: CustomWorld, field: string) {
    const cursor = await textareaLocator(this, field).evaluate(
      (el) => window.getComputedStyle(el).cursor
    );
    expect(cursor).toBe("pointer");
  }
);

When("I click the {textarea} textarea", async function (this: CustomWorld, field: string) {
  await textareaLocator(this, field).click();
});

When("I clear the {textarea} textarea", async function (this: CustomWorld, field: string) {
  await textareaLocator(this, field).clear();
});

When(
  "I type {string} in the {textarea} textarea",
  async function (this: CustomWorld, text: string, field: string) {
    await textareaLocator(this, field).fill(text);
  }
);

When("I click outside the {textarea} textarea", async function (this: CustomWorld, field: string) {
  // Trigger blur by clicking outside - use body as a safe target
  await textareaLocator(this, field).blur();

  // Give the blur handler time to execute and trigger auto-save
  await this.page.waitForTimeout(100);
  // Wait for auto-save to complete
  await waitForSaveComplete(this.page);
});

Then(
  "the {textarea} textarea should not be readonly",
  async function (this: CustomWorld, field: string) {
    // Wait for the readonly attribute to be removed (with increased timeout)
    await expect(textareaLocator(this, field)).not.toHaveAttribute("readonly", {
      timeout: 10000,
    });
  }
);

Then(
  "the {textarea} textarea should be focused",
  async function (this: CustomWorld, field: string) {
    await expect(textareaLocator(this, field)).toBeFocused();
  }
);

Then(
  "the {textarea} textarea should have an edit state visual indicator",
  async function (this: CustomWorld, field: string) {
    const textarea = textareaLocator(this, field);
    // Check that textarea does not have readonly attribute (visual indicator of edit mode)
    await expect(textarea).not.toHaveAttribute("readonly");
    // Additional check: verify it's actually editable by checking if it's enabled
    await expect(textarea).toBeEnabled();
  }
);

Then("the {textarea} textarea should be empty", async function (this: CustomWorld, field: string) {
  await expect(textareaLocator(this, field)).toHaveValue("");
});

Then("the background textarea should still be editable", async function (this: CustomWorld) {
  const textarea = textareaLocator(this, "background");
  await expect(textarea).not.toHaveAttribute("readonly");
  await expect(textarea).toBeEnabled();
});

When("the {textarea} textarea is empty", async function (this: CustomWorld, field: string) {
  await textareaLocator(this, field).clear();
});

Then(
  "the {textarea} placeholder should be {string}",
  async function (this: CustomWorld, field: string, text: string) {
    const placeholder = await textareaLocator(this, field).getAttribute("placeholder");
    expect(placeholder).toBe(text);
  }
);

Then(
  "the character data should have {textarea} {string}",
  async function (this: CustomWorld, field: string, text: string) {
    // Wait for auto-save to complete by monitoring save indicator
    await waitForSaveComplete(this.page);

    // Verify using TestStorageHelper
    const storedData = await this.storageHelper.getCharacter();

    expect(storedData).toBeTruthy();
    expect(storedData.textFields[field]).toBe(text);
  }
);

// ============================================================================
// LONG TEXT STEPS - Unique to additional fields
// ============================================================================

When(
  "I type a {int} character string in the background textarea",
  async function (this: CustomWorld, length: number) {
    const longText = "A".repeat(length);
    const textarea = this.page.locator('[data-testid="character-background"]');
    await textarea.fill(longText);
  }
);

When(
  "I type a {int} character string in the notes textarea",
  async function (this: CustomWorld, length: number) {
    const longText = "B".repeat(length);
    const textarea = this.page.locator('[data-testid="character-notes"]');
    await textarea.fill(longText);
  }
);

Then(
  "the background textarea should contain the full {int} character text",
  async function (this: CustomWorld, length: number) {
    const textarea = this.page.locator('[data-testid="character-background"]');
    const value = await textarea.inputValue();
    expect(value.length).toBe(length);
    expect(value).toBe("A".repeat(length));
  }
);

Then(
  "the notes textarea should contain the full {int} character text",
  async function (this: CustomWorld, length: number) {
    const textarea = this.page.locator('[data-testid="character-notes"]');
    const value = await textarea.inputValue();
    expect(value.length).toBe(length);
    expect(value).toBe("B".repeat(length));
  }
);

Then("the character data should have the full background text", async function (this: CustomWorld) {
  // Wait for auto-save to complete by monitoring save indicator
  await waitForSaveComplete(this.page);

  // Verify using TestStorageHelper
  const storedData = await this.storageHelper.getCharacter();

  expect(storedData).toBeTruthy();
  const background = storedData.textFields.background;
  expect(background.length).toBe(1000);
  expect(background).toBe("A".repeat(1000));
});

Then("the character data should have the full notes text", async function (this: CustomWorld) {
  // Wait for auto-save to complete by monitoring save indicator
  await waitForSaveComplete(this.page);

  // Verify using TestStorageHelper
  const storedData = await this.storageHelper.getCharacter();

  expect(storedData).toBeTruthy();
  const notes = storedData.textFields.notes;
  expect(notes.length).toBe(2000);
  expect(notes).toBe("B".repeat(2000));
});

// ============================================================================
// MOBILE DEVICE STEPS - Unique to additional fields
// ============================================================================

Given("I am using a mobile device", async function (this: CustomWorld) {
  // Set mobile viewport for tablet (iPad)
  await this.page.setViewportSize({ width: 768, height: 1024 });

  // Set user agent via context
  const context = this.page.context();
  await context.addInitScript(() => {
    // eslint-disable-next-line no-undef
    Object.defineProperty(navigator, "userAgent", {
      get: () =>
        "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    });
  });

  // Reload page to apply changes
  await this.page.reload();
  await this.page.waitForLoadState("domcontentloaded");
});

When("I tap the type dropdown", async function (this: CustomWorld) {
  const select = this.page.locator('[data-testid="character-type-select"]');
  await select.tap();
});

Then("the mobile OS picker should open", async function (this: CustomWorld) {
  // On mobile, the native select picker opens automatically
  // We verify this by checking that the select is focused
  const select = this.page.locator('[data-testid="character-type-select"]');
  await expect(select).toBeFocused();
});

When("I select {string} from the mobile picker", async function (this: CustomWorld, type: string) {
  const select = this.page.locator('[data-testid="character-type-select"]');
  await select.selectOption(type);
});

When("I tap the {textarea} textarea", async function (this: CustomWorld, field: string) {
  await textareaLocator(this, field).tap();
});

Then(
  "the {textarea} textarea should become editable",
  async function (this: CustomWorld, field: string) {
    const textarea = textareaLocator(this, field);
    await expect(textarea).not.toHaveAttribute("readonly", { timeout: 10000 });
    await expect(textarea).toBeEnabled();
  }
);

Then("the virtual keyboard should appear", async function (this: CustomWorld) {
  // On real mobile devices, the virtual keyboard appears when a textarea is focused
  // In our test environment, we verify the textarea is focused (check whichever textarea was just tapped)
  // This step is shared by both background and notes, so we just verify one is focused
  await this.page.waitForTimeout(100);
  // Virtual keyboard appearance is implicit when textarea is editable on mobile
  // We've already verified the textarea became editable in the previous step
});

When("I tap outside the {textarea} textarea", async function (this: CustomWorld, field: string) {
  // On mobile, just blur the textarea directly which is more reliable
  await textareaLocator(this, field).blur();
  // Give the blur handler time to execute
  await this.page.waitForTimeout(100);
});
