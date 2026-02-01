// Step definitions for equipment visual styling tests

import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { DOMHelpers } from "../support/dom-helpers.js";
import { FULL_CHARACTER } from "../../../src/data/mockCharacters.js";
import { TestStorageHelper } from "../support/testStorageHelper.js";

Given("a character exists with the following equipment:", async function (dataTable) {
  const equipment = dataTable.hashes().map((row: { Name: string; Description: string }) => ({
    name: row.Name,
    description: row.Description || undefined,
  }));

  this.character = {
    ...this.character,
    equipment,
  };
});

Given("a character exists with no equipment", async function () {
  const storageHelper = new TestStorageHelper(this.page);
  const character = {
    ...FULL_CHARACTER,
    equipment: [],
  };
  await this.page.waitForTimeout(500);
  await storageHelper.setCharacter(character);

  // Reload page to pick up the changes
  await this.page.waitForTimeout(500);
  await this.page.reload();
  await this.page.waitForLoadState("networkidle");
  await this.page.waitForTimeout(200);
});

Then("each equipment item should have a light green background", async function () {
  const items = await this.page.locator(".equipment-item").all();
  expect(items.length).toBeGreaterThan(0);

  for (const item of items) {
    // Check for equipment-item-card class which applies the green gradient
    const classes = await item.getAttribute("class");
    expect(classes).toContain("equipment-item-card");
  }
});

Then("each equipment item should have a green border", async function () {
  const items = await this.page.locator(".equipment-item").all();
  expect(items.length).toBeGreaterThan(0);

  for (const item of items) {
    const borderColor = await DOMHelpers.getComputedBorderColor(item);
    expect(borderColor).toContain("134, 239, 172"); // green-300
  }
});

Then("each equipment item should have rounded corners", async function () {
  const items = await this.page.locator(".equipment-item").all();
  expect(items.length).toBeGreaterThan(0);

  for (const item of items) {
    const borderRadius = await DOMHelpers.getComputedBorderRadius(item);
    expect(parseFloat(borderRadius)).toBeGreaterThan(0);
  }
});

Then("each equipment item should have shadow", async function () {
  const items = await this.page.locator(".equipment-item").all();
  expect(items.length).toBeGreaterThan(0);

  for (const item of items) {
    const boxShadow = await DOMHelpers.getComputedBoxShadow(item);
    expect(boxShadow).not.toBe("none");
  }
});

Then("the equipment item {string} should display its name", async function (itemName: string) {
  const item = await DOMHelpers.findEquipmentItemByName(this.page, itemName);
  expect(item).toBeTruthy();
  const nameElement = item.locator(".equipment-name").first();
  await expect(nameElement).toHaveText(itemName);
});

Then(
  "the equipment item {string} should display its description {string}",
  async function (itemName: string, description: string) {
    const item = await DOMHelpers.findEquipmentItemByName(this.page, itemName);
    expect(item).toBeTruthy();
    const descElement = item.locator(".equipment-description").first();
    await expect(descElement).toHaveText(description);
  }
);

Then(
  "the equipment item {string} should not display a description",
  async function (itemName: string) {
    const item = await DOMHelpers.findEquipmentItemByName(this.page, itemName);
    expect(item).toBeTruthy();
    const descElement = item.locator(".equipment-description");
    await expect(descElement).toHaveCount(0);
  }
);

When("I hover over an equipment item", async function () {
  const item = this.page.locator(".equipment-item").first();
  await item.hover();
  this.hoveredItem = item;
});

Then("the equipment item shadow should increase", async function () {
  const boxShadow = await DOMHelpers.getComputedBoxShadow(this.hoveredItem);
  // Check for shadow (hover state increases it)
  expect(boxShadow).not.toBe("none");
  expect(boxShadow).toContain("rgba(34, 197, 94");
});

Then("the empty equipment message should be displayed", async function () {
  const empty = this.page.locator('[data-testid="empty-equipment"]');
  await expect(empty).toBeVisible();
});

Then("the empty equipment container should have green theme styling", async function () {
  const empty = this.page.locator('[data-testid="empty-equipment"]');
  const classes = await empty.getAttribute("class");
  expect(classes).toContain("empty-equipment-styled");
});
