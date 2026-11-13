import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { Character } from "@/types/character";
import { CustomWorld } from "../support/world.js";
import { waitForSaveComplete } from "../support/save.js";

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
  await textareaLocator(this, field).blur();

  await waitForSaveComplete(this.page);
});

Then(
  "the {textarea} textarea should not be readonly",
  async function (this: CustomWorld, field: string) {
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
    await expect(textarea).not.toHaveAttribute("readonly");
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
    await waitForSaveComplete(this.page);

    const storedData = await this.storageHelper.getCharacter();

    expect(storedData).toBeTruthy();
    expect(storedData.textFields[field as keyof Character["textFields"]]).toBe(text);
  }
);

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
  await waitForSaveComplete(this.page);

  const storedData = await this.storageHelper.getCharacter();

  expect(storedData).toBeTruthy();
  const background = storedData.textFields.background;
  expect(background.length).toBe(1000);
  expect(background).toBe("A".repeat(1000));
});

Then("the character data should have the full notes text", async function (this: CustomWorld) {
  await waitForSaveComplete(this.page);

  const storedData = await this.storageHelper.getCharacter();

  expect(storedData).toBeTruthy();
  const notes = storedData.textFields.notes;
  expect(notes.length).toBe(2000);
  expect(notes).toBe("B".repeat(2000));
});

When("I tap the type dropdown", async function (this: CustomWorld) {
  const select = this.page.locator('[data-testid="character-type-select"]');
  await select.tap();
});

Then("the mobile OS picker should open", async function (this: CustomWorld) {
  const select = this.page.locator('[data-testid="character-type-select"]');
  await expect(select).toBeFocused();
});

When("I select {string} from the mobile picker", async function (this: CustomWorld, type: string) {
  const select = this.page.locator('[data-testid="character-type-select"]');
  await select.selectOption(type);
});

// iOS and iPadOS decide whether to raise the on-screen keyboard at the moment
// a field takes focus: a field that is readonly then gets no keyboard, even if
// it turns editable straight after. Headless browsers have no on-screen
// keyboard, so the tap records that precondition for the keyboard step.
interface KeyboardProbeWindow {
  editableWhenFocused?: boolean;
}

When("I tap the {textarea} textarea", async function (this: CustomWorld, field: string) {
  const textarea = textareaLocator(this, field);
  await textarea.evaluate((el: HTMLTextAreaElement) => {
    el.addEventListener(
      "focus",
      () => {
        (window as KeyboardProbeWindow).editableWhenFocused = !el.readOnly;
      },
      { once: true }
    );
  });
  this.tappedTextarea = field;
  await textarea.tap();
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
  if (!this.tappedTextarea) throw new Error("No textarea was tapped before this step");
  await expect(textareaLocator(this, this.tappedTextarea)).toBeFocused();
  const editableWhenFocused = await this.page.evaluate(
    () => (window as KeyboardProbeWindow).editableWhenFocused
  );
  expect(
    editableWhenFocused,
    `the ${this.tappedTextarea} textarea was readonly when the tap focused it, so iOS shows no keyboard`
  ).toBe(true);
});

When("I tap outside the {textarea} textarea", async function (this: CustomWorld, field: string) {
  // On mobile, just blur the textarea directly which is more reliable
  await textareaLocator(this, field).blur();
  await waitForSaveComplete(this.page);
});
