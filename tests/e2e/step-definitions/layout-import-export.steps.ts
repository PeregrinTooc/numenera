import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world";
import { importFile, numeneraFile } from "../support/fileImport.js";
import { FULL_CHARACTER } from "../support/cardTestFixtures.js";
import { sectionId } from "../support/sections.js";
import { DEFAULT_LAYOUT, cloneLayout, type Layout } from "@/types/layout";
import type { CardSectionId, ColumnCount } from "@/types/sectionColumns";

const IMPORTED_NAME = "Imported Character";

/** The default layout with Items moved above Cyphers. */
const DIFFERENT_LAYOUT: Layout = [
  { type: "single", id: "basicInfo" },
  { type: "single", id: "stats" },
  { type: "single", id: "recoveryDamage" },
  { type: "single", id: "items" },
  { type: "single", id: "cyphers" },
  { type: "single", id: "abilities" },
  { type: "single", id: "specialAbilities" },
  { type: "single", id: "attacks" },
  { type: "single", id: "background" },
  { type: "single", id: "notes" },
];

Then(
  "the exported file should contain the layout configuration",
  async function (this: CustomWorld) {
    const data = this.exportedFileData;
    if (!data) {
      throw new Error("No exported data available");
    }

    expect(data.layout).toBeDefined();
    expect(Array.isArray(data.layout)).toBe(true);
  }
);

Given("I have a character file with a different layout", function (this: CustomWorld) {
  this.importedFile = { layout: DIFFERENT_LAYOUT };
});

Given("I have a character file with the default layout", function (this: CustomWorld) {
  this.importedFile = { layout: cloneLayout(DEFAULT_LAYOUT) };
});

Given("I have a character file without a layout", function (this: CustomWorld) {
  this.importedFile = {};
});

Given(
  "I have a character file with the default layout that sets the {string} section to {int} column(s)",
  function (this: CustomWorld, section: string, columns: number) {
    this.importedFile = {
      layout: cloneLayout(DEFAULT_LAYOUT),
      sectionColumns: { [sectionId(section)]: columns },
    };
  }
);

Given(
  "I have set the {string} section to {int} column(s)",
  async function (this: CustomWorld, section: string, columns: number) {
    await this.setup.sectionColumns({
      [sectionId(section) as CardSectionId]: columns as ColumnCount,
    });
  }
);

When("I import the character file", async function (this: CustomWorld) {
  const file = {
    ...numeneraFile({ ...FULL_CHARACTER, name: IMPORTED_NAME }),
    ...this.importedFile,
  };
  await importFile(this.page, "imported.numenera", file);
});

Then("I should see a layout choice prompt", async function (this: CustomWorld) {
  await expect(this.page.getByTestId("layout-choice-modal")).toBeVisible();
});

Then("I should not see a layout choice prompt", async function (this: CustomWorld) {
  await expect(this.page.getByTestId("layout-choice-modal")).toHaveCount(0);
});

Then(
  "I should see options to {string} or {string}",
  async function (this: CustomWorld, keep: string, use: string) {
    await expect(this.page.getByTestId("keep-current-layout")).toHaveText(keep);
    await expect(this.page.getByTestId("use-imported-layout")).toHaveText(use);
  }
);

Then("the {string} option should have focus", async function (this: CustomWorld, option: string) {
  await expect(this.page.getByRole("button", { name: option })).toBeFocused();
});

When("I choose to {string}", async function (this: CustomWorld, option: string) {
  await this.page.getByRole("button", { name: option }).click();
});

Then("the imported character should be shown", async function (this: CustomWorld) {
  await expect(this.page.getByTestId("character-name")).toContainText(IMPORTED_NAME);
});

Then(
  "the {string} section should be set to {int} column(s)",
  async function (this: CustomWorld, section: string, columns: number) {
    // The chosen count, which a narrow screen may still show as one column
    await expect(this.page.getByTestId(`section-columns-${sectionId(section)}`)).toHaveAttribute(
      "data-columns",
      String(columns)
    );
  }
);
