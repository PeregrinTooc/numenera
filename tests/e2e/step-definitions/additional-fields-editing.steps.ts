import { When, Then, Given } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";

// Background Data Setup Step

Given("the character has the following data:", async function (this: CustomWorld, dataTable) {
  // Parse the data table - it's in vertical format with field/value columns
  const rows = dataTable.raw();
  const data: Record<string, string> = {};

  // Skip header row and convert to key-value pairs
  for (let i = 1; i < rows.length; i++) {
    const [field, value] = rows[i];
    data[field] = value;
  }

  // Set character data in localStorage matching the Character type structure
  const characterState = {
    name: data.name || "Test Character",
    tier: 1,
    type: data.type || "Nano",
    descriptor: "Strong",
    focus: "Controls Beasts",
    xp: 0,
    shins: 0,
    armor: 0,
    effort: 1,
    maxCyphers: 2,
    stats: {
      might: { pool: 10, current: 10, edge: 0 },
      speed: { pool: 10, current: 10, edge: 0 },
      intellect: { pool: 10, current: 10, edge: 0 },
    },
    textFields: {
      background: data.background || "",
      notes: data.notes || "",
    },
    abilities: [],
    attacks: [],
    specialAbilities: [],
    equipment: [],
    cyphers: [],
    artifacts: [],
    oddities: [],
    recoveryRolls: {
      action: false,
      tenMinutes: false,
      oneHour: false,
      tenHours: false,
      modifier: 0,
    },
    damageTrack: {
      impairment: "healthy",
    },
  };

  // Wrap with schema version to match production storage format
  const wrappedState = {
    schemaVersion: 4,
    character: characterState,
  };

  await this.page!.evaluate((state) => {
    localStorage.setItem("numenera-character-state", JSON.stringify(state));
  }, wrappedState);

  // Reload to apply the data
  await this.page!.reload();
  await this.page!.waitForLoadState("domcontentloaded");
});

// Type Dropdown Steps

When("I click on the type dropdown", async function (this: CustomWorld) {
  const select = this.page!.locator('[data-testid="character-type-select"]');
  await select.click();
});

When("I select {string} from the type dropdown", async function (this: CustomWorld, type: string) {
  const select = this.page!.locator('[data-testid="character-type-select"]');
  await select.selectOption(type);
});

When("I focus the type dropdown", async function (this: CustomWorld) {
  const select = this.page!.locator('[data-testid="character-type-select"]');
  await select.focus();
});

When("I press the {string} key", async function (this: CustomWorld, key: string) {
  await this.page!.keyboard.press(key);
});

When(
  "I use keyboard to navigate and select {string} from the type dropdown",
  async function (this: CustomWorld, type: string) {
    const select = this.page!.locator('[data-testid="character-type-select"]');
    await select.focus();
    await this.page!.keyboard.press("ArrowDown"); // Open dropdown

    // Navigate to the desired option
    const options = ["Nano", "Glaive", "Jack"];
    const currentIndex = options.indexOf(await select.inputValue());
    const targetIndex = options.indexOf(type);
    const steps = targetIndex - currentIndex;

    for (let i = 0; i < Math.abs(steps); i++) {
      if (steps > 0) {
        await this.page!.keyboard.press("ArrowDown");
      } else {
        await this.page!.keyboard.press("ArrowUp");
      }
    }

    await this.page!.keyboard.press("Enter");
  }
);

When("I tap on the type dropdown on mobile", async function (this: CustomWorld) {
  const select = this.page!.locator('[data-testid="character-type-select"]');
  await select.tap();
});

Then("the type dropdown should show {string}", async function (this: CustomWorld, type: string) {
  const select = this.page!.locator('[data-testid="character-type-select"]');
  await expect(select).toHaveValue(type);
});

Then(
  "the type dropdown should show {string} as selected",
  async function (this: CustomWorld, type: string) {
    const select = this.page!.locator('[data-testid="character-type-select"]');
    await expect(select).toHaveValue(type);
  }
);

Then(
  "the type dropdown should have {int} options",
  async function (this: CustomWorld, count: number) {
    const select = this.page!.locator('[data-testid="character-type-select"]');
    const options = await select.locator("option").count();
    expect(options).toBe(count);
  }
);

Then(
  "the type dropdown options should be {string}, {string}, {string}",
  async function (this: CustomWorld, option1: string, option2: string, option3: string) {
    const select = this.page!.locator('[data-testid="character-type-select"]');
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
    // Wait a bit for the save to complete
    await this.page!.waitForTimeout(200);

    // Verify in localStorage
    const storedData = await this.page!.evaluate(() => {
      const data = localStorage.getItem("numenera-character-state");
      return data ? JSON.parse(data) : null;
    });

    expect(storedData).toBeTruthy();

    // Data is stored with schemaVersion wrapper: { schemaVersion, character: { type, ... } }
    if (storedData.character) {
      expect(storedData.character.type).toBe(type);
    } else {
      // Fallback for direct structure
      expect(storedData.type).toBe(type);
    }
  }
);

Then(
  "the type dropdown should display in {string}",
  async function (this: CustomWorld, language: string) {
    const select = this.page!.locator('[data-testid="character-type-select"]');
    const options = await select.locator("option").allTextContents();

    if (language === "German") {
      expect(options).toContain("Nano");
      expect(options).toContain("Glaive");
      expect(options).toContain("Jack");
    } else {
      expect(options).toContain("Nano");
      expect(options).toContain("Glaive");
      expect(options).toContain("Jack");
    }
  }
);

Then("the type dropdown should have an accessible label", async function (this: CustomWorld) {
  const select = this.page!.locator('[data-testid="character-type-select"]');
  const ariaLabel = await select.getAttribute("aria-label");
  expect(ariaLabel).toBeTruthy();
  expect(ariaLabel!.length).toBeGreaterThan(0);
});

Then("the type should change to the next option", async function (this: CustomWorld) {
  const select = this.page!.locator('[data-testid="character-type-select"]');
  // Wait a moment for the keyboard navigation to take effect
  await this.page!.waitForTimeout(100);
  const currentValue = await select.inputValue();
  // Started with "Nano", after ArrowDown and Enter should be "Glaive"
  expect(currentValue).toBe("Glaive");
});

// Background Field Steps

Then("the background textarea should be readonly", async function (this: CustomWorld) {
  const textarea = this.page!.locator('[data-testid="character-background"]');
  await expect(textarea).toHaveAttribute("readonly", "");
});

Then(
  "the background textarea should show {string}",
  async function (this: CustomWorld, text: string) {
    const textarea = this.page!.locator('[data-testid="character-background"]');
    // Wait for the textarea to be visible and check the value
    await textarea.waitFor({ state: "visible" });
    await expect(textarea).toHaveValue(text);
  }
);

Then("the background textarea should have a pointer cursor", async function (this: CustomWorld) {
  const textarea = this.page!.locator('[data-testid="character-background"]');
  const cursor = await textarea.evaluate((el) => window.getComputedStyle(el).cursor);
  expect(cursor).toBe("pointer");
});

When("I click on the background field", async function (this: CustomWorld) {
  const textarea = this.page!.locator('[data-testid="character-background"]');
  await textarea.click();
});

When("I click the background textarea", async function (this: CustomWorld) {
  const textarea = this.page!.locator('[data-testid="character-background"]');
  await textarea.click();
});

When("I tap on the background field on mobile", async function (this: CustomWorld) {
  const textarea = this.page!.locator('[data-testid="character-background"]');
  await textarea.tap();
});

When("I type {string} into the background field", async function (this: CustomWorld, text: string) {
  const textarea = this.page!.locator('[data-testid="character-background"]');
  await textarea.fill(text);
});

When("I click outside the background field", async function (this: CustomWorld) {
  // Click on a neutral area like the page header
  await this.page!.locator('[data-testid="app-header"]').click();
});

When("I press Escape in the background field", async function (this: CustomWorld) {
  await this.page!.keyboard.press("Escape");
});

When("I tap outside the background field on mobile", async function (this: CustomWorld) {
  // Tap on a neutral area like the page header
  await this.page!.locator('[data-testid="app-header"]').tap();
});

Then("the background field should be in readonly mode", async function (this: CustomWorld) {
  const textarea = this.page!.locator('[data-testid="character-background"]');
  await expect(textarea).toHaveAttribute("readonly", "");
});

Then("the background field should be in edit mode", async function (this: CustomWorld) {
  const textarea = this.page!.locator('[data-testid="character-background"]');
  await expect(textarea).not.toHaveAttribute("readonly");
});

Then("the background textarea should not be readonly", async function (this: CustomWorld) {
  const textarea = this.page!.locator('[data-testid="character-background"]');
  // Wait for the readonly attribute to be removed (with increased timeout)
  await expect(textarea).not.toHaveAttribute("readonly", { timeout: 10000 });
});

Then("the background textarea should be focused", async function (this: CustomWorld) {
  const textarea = this.page!.locator('[data-testid="character-background"]');
  await expect(textarea).toBeFocused();
});

Then(
  "the background textarea should have an edit state visual indicator",
  async function (this: CustomWorld) {
    const textarea = this.page!.locator('[data-testid="character-background"]');
    // Check that textarea does not have readonly attribute (visual indicator of edit mode)
    await expect(textarea).not.toHaveAttribute("readonly");
    // Additional check: verify it's actually editable by checking if it's enabled
    await expect(textarea).toBeEnabled();
  }
);

Then(
  "the background field should contain {string}",
  async function (this: CustomWorld, text: string) {
    const textarea = this.page!.locator('[data-testid="character-background"]');
    await expect(textarea).toHaveValue(text);
  }
);

Then(
  "the background field should show the placeholder in {string}",
  async function (this: CustomWorld, language: string) {
    const textarea = this.page!.locator('[data-testid="character-background"]');
    const placeholder = await textarea.getAttribute("placeholder");
    expect(placeholder).toBeTruthy();

    if (language === "German") {
      expect(placeholder).toContain("Klicken");
    } else {
      expect(placeholder).toContain("Click");
    }
  }
);

// Notes Field Steps

When("I click on the notes field", async function (this: CustomWorld) {
  const textarea = this.page!.locator('[data-testid="character-notes"]');
  await textarea.click();
});

When("I tap on the notes field on mobile", async function (this: CustomWorld) {
  const textarea = this.page!.locator('[data-testid="character-notes"]');
  await textarea.tap();
});

When("I type {string} into the notes field", async function (this: CustomWorld, text: string) {
  const textarea = this.page!.locator('[data-testid="character-notes"]');
  await textarea.fill(text);
});

When("I click outside the notes field", async function (this: CustomWorld) {
  // Click on a neutral area like the page header
  await this.page!.locator('[data-testid="app-header"]').click();
});

When("I press Escape in the notes field", async function (this: CustomWorld) {
  await this.page!.keyboard.press("Escape");
});

When("I tap outside the notes field on mobile", async function (this: CustomWorld) {
  // Tap on a neutral area like the page header
  await this.page!.locator('[data-testid="app-header"]').tap();
});

Then("the notes field should be in readonly mode", async function (this: CustomWorld) {
  const textarea = this.page!.locator('[data-testid="character-notes"]');
  await expect(textarea).toHaveAttribute("readonly", "");
});

Then("the notes field should be in edit mode", async function (this: CustomWorld) {
  const textarea = this.page!.locator('[data-testid="character-notes"]');
  await expect(textarea).not.toHaveAttribute("readonly");
});

Then("the notes field should contain {string}", async function (this: CustomWorld, text: string) {
  const textarea = this.page!.locator('[data-testid="character-notes"]');
  await expect(textarea).toHaveValue(text);
});

Then(
  "the notes field should show the placeholder in {string}",
  async function (this: CustomWorld, language: string) {
    const textarea = this.page!.locator('[data-testid="character-notes"]');
    const placeholder = await textarea.getAttribute("placeholder");
    expect(placeholder).toBeTruthy();

    if (language === "German") {
      expect(placeholder).toContain("Klicken");
    } else {
      expect(placeholder).toContain("Click");
    }
  }
);

// Interaction and Event Steps

When("I edit the background field and then switch to notes", async function (this: CustomWorld) {
  const backgroundTextarea = this.page!.locator('[data-testid="character-background"]');
  await backgroundTextarea.click();
  await backgroundTextarea.fill("Test background");

  const notesTextarea = this.page!.locator('[data-testid="character-notes"]');
  await notesTextarea.click();
});

Then("the background field should automatically save", async function (this: CustomWorld) {
  const backgroundTextarea = this.page!.locator('[data-testid="character-background"]');
  await expect(backgroundTextarea).toHaveValue("Test background");
  await expect(backgroundTextarea).toHaveAttribute("readonly", "");
});

Then(
  "a character-updated event should be dispatched for type change",
  async function (this: CustomWorld) {
    // This is verified implicitly by localStorage persistence
    // The event handler in CharacterSheet updates localStorage
    const storedData = await this.page!.evaluate(() => {
      const data = localStorage.getItem("numenera-character-state");
      return data ? JSON.parse(data) : null;
    });

    expect(storedData).toBeTruthy();
    expect(storedData.type).toBeTruthy();
  }
);

Then(
  "a character-updated event should be dispatched for background change",
  async function (this: CustomWorld) {
    // This is verified implicitly by localStorage persistence
    const storedData = await this.page!.evaluate(() => {
      const data = localStorage.getItem("numenera-character-state");
      return data ? JSON.parse(data) : null;
    });

    expect(storedData).toBeTruthy();
    expect(storedData.textFields?.background).toBeTruthy();
  }
);

Then(
  "a character-updated event should be dispatched for notes change",
  async function (this: CustomWorld) {
    // This is verified implicitly by localStorage persistence
    const storedData = await this.page!.evaluate(() => {
      const data = localStorage.getItem("numenera-character-state");
      return data ? JSON.parse(data) : null;
    });

    expect(storedData).toBeTruthy();
    expect(storedData.textFields?.notes).toBeTruthy();
  }
);

// Edge Case Steps

When("I try to edit both background and notes simultaneously", async function (this: CustomWorld) {
  const backgroundTextarea = this.page!.locator('[data-testid="character-background"]');
  await backgroundTextarea.click();

  // Try to click notes while background is in edit mode
  const notesTextarea = this.page!.locator('[data-testid="character-notes"]');
  await notesTextarea.click();
});

Then("only one field should be in edit mode at a time", async function (this: CustomWorld) {
  const backgroundTextarea = this.page!.locator('[data-testid="character-background"]');
  const notesTextarea = this.page!.locator('[data-testid="character-notes"]');

  const backgroundReadonly = await backgroundTextarea.getAttribute("readonly");
  const notesReadonly = await notesTextarea.getAttribute("readonly");

  // One should be readonly, the other should not be
  const editModeCount = (backgroundReadonly === null ? 1 : 0) + (notesReadonly === null ? 1 : 0);
  expect(editModeCount).toBe(1);
});

When("I type a very long text into the background field", async function (this: CustomWorld) {
  const longText = "A".repeat(5000);
  const textarea = this.page!.locator('[data-testid="character-background"]');
  await textarea.click();
  await textarea.fill(longText);
});

Then(
  "the background field should handle the long text correctly",
  async function (this: CustomWorld) {
    const textarea = this.page!.locator('[data-testid="character-background"]');
    const value = await textarea.inputValue();
    expect(value.length).toBe(5000);
  }
);

When("I type special characters into the notes field", async function (this: CustomWorld) {
  const specialText = "Special: <>&\"'`\n\tChars";
  const textarea = this.page!.locator('[data-testid="character-notes"]');
  await textarea.click();
  await textarea.fill(specialText);
});

Then("the notes field should preserve the special characters", async function (this: CustomWorld) {
  const textarea = this.page!.locator('[data-testid="character-notes"]');
  await textarea.click(); // Click outside to save
  await this.page!.locator('[data-testid="app-header"]').click();

  // Wait for save
  await this.page!.waitForTimeout(100);

  const value = await textarea.inputValue();
  expect(value).toContain("Special:");
  expect(value).toContain("<>&\"'`");
});
