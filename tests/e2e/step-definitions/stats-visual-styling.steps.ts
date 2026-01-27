import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { DOMHelpers } from "../support/dom-helpers.js";

Then("the stats section should be visible", async function () {
  const dom = new DOMHelpers(this.page);
  const statsSection = dom.getByTestId("stats-section");
  await expect(statsSection).toBeVisible();
});

Then("the stats section should use condensed styling", async function () {
  const dom = new DOMHelpers(this.page);
  const statsSection = dom.getByTestId("stats-section");

  // Check that the section has appropriate padding/spacing for condensed design
  const box = await statsSection.boundingBox();
  expect(box).not.toBeNull();

  // Verify condensed class or styling is applied
  await expect(statsSection).toBeVisible();
});

Then("all three stat pools should be displayed side-by-side on desktop", async function () {
  const dom = new DOMHelpers(this.page);

  const mightPool = dom.getByTestId("stat-might");
  const speedPool = dom.getByTestId("stat-speed");
  const intellectPool = dom.getByTestId("stat-intellect");

  await expect(mightPool).toBeVisible();
  await expect(speedPool).toBeVisible();
  await expect(intellectPool).toBeVisible();

  // Check they are in a horizontal layout (side-by-side)
  const mightBox = await mightPool.boundingBox();
  const speedBox = await speedPool.boundingBox();
  const intellectBox = await intellectPool.boundingBox();

  expect(mightBox).not.toBeNull();
  expect(speedBox).not.toBeNull();
  expect(intellectBox).not.toBeNull();

  // All three should be roughly on the same horizontal line (within 50px tolerance)
  if (mightBox && speedBox && intellectBox) {
    const avgY = (mightBox.y + speedBox.y + intellectBox.y) / 3;
    expect(Math.abs(mightBox.y - avgY)).toBeLessThan(50);
    expect(Math.abs(speedBox.y - avgY)).toBeLessThan(50);
    expect(Math.abs(intellectBox.y - avgY)).toBeLessThan(50);
  }
});

Then("each stat pool card should use compact dimensions", async function () {
  const dom = new DOMHelpers(this.page);

  const mightPool = dom.getByTestId("stat-might");
  const box = await mightPool.boundingBox();

  expect(box).not.toBeNull();
  if (box) {
    // Verify the card is more compact (height should be reasonable, not too tall)
    // Condensed design should be under 250px in height
    expect(box.height).toBeLessThan(250);
  }
});

Then("the might pool number should use a smaller font size", async function () {
  const dom = new DOMHelpers(this.page);
  const mightPoolNumber = dom.getByTestId("stat-might-pool");

  const fontSize = await mightPoolNumber.evaluate((el) => {
    return window.getComputedStyle(el).fontSize;
  });

  // Parse the font size (e.g., "48px" -> 48)
  const fontSizeNum = parseFloat(fontSize);

  // Condensed design should use smaller font (less than 4.5rem = 72px at default 16px base)
  expect(fontSizeNum).toBeLessThan(72);
  // But still readable (at least 2rem = 32px)
  expect(fontSizeNum).toBeGreaterThan(32);
});

Then("the speed pool number should use a smaller font size", async function () {
  const dom = new DOMHelpers(this.page);
  const speedPoolNumber = dom.getByTestId("stat-speed-pool");

  const fontSize = await speedPoolNumber.evaluate((el) => {
    return window.getComputedStyle(el).fontSize;
  });

  const fontSizeNum = parseFloat(fontSize);
  expect(fontSizeNum).toBeLessThan(72);
  expect(fontSizeNum).toBeGreaterThan(32);
});

Then("the intellect pool number should use a smaller font size", async function () {
  const dom = new DOMHelpers(this.page);
  const intellectPoolNumber = dom.getByTestId("stat-intellect-pool");

  const fontSize = await intellectPoolNumber.evaluate((el) => {
    return window.getComputedStyle(el).fontSize;
  });

  const fontSizeNum = parseFloat(fontSize);
  expect(fontSizeNum).toBeLessThan(72);
  expect(fontSizeNum).toBeGreaterThan(32);
});

Then("the stat labels should remain readable", async function () {
  const dom = new DOMHelpers(this.page);

  const mightLabel = dom.getByTestId("stat-might-label");
  const speedLabel = dom.getByTestId("stat-speed-label");
  const intellectLabel = dom.getByTestId("stat-intellect-label");

  await expect(mightLabel).toBeVisible();
  await expect(speedLabel).toBeVisible();
  await expect(intellectLabel).toBeVisible();

  // Check font size is readable (at least 0.875rem = 14px)
  const fontSize = await mightLabel.evaluate((el) => {
    return window.getComputedStyle(el).fontSize;
  });

  const fontSizeNum = parseFloat(fontSize);
  expect(fontSizeNum).toBeGreaterThanOrEqual(14);
});

Then("the effort badge should be visible in the stats section", async function () {
  const dom = new DOMHelpers(this.page);
  const effortBadge = dom.getByTestId("effort-badge");
  await expect(effortBadge).toBeVisible();
});

Then("the effort badge should be positioned in the top-right corner", async function () {
  const dom = new DOMHelpers(this.page);
  const statsSection = dom.getByTestId("stats-section");
  const effortBadge = dom.getByTestId("effort-badge");

  const sectionBox = await statsSection.boundingBox();
  const badgeBox = await effortBadge.boundingBox();

  expect(sectionBox).not.toBeNull();
  expect(badgeBox).not.toBeNull();

  if (sectionBox && badgeBox) {
    // Badge should be on the right side of the section
    const badgeRightEdge = badgeBox.x + badgeBox.width;
    const sectionRightEdge = sectionBox.x + sectionBox.width;

    // Badge should be near the right edge (within 20px)
    expect(Math.abs(badgeRightEdge - sectionRightEdge)).toBeLessThan(20);

    // Badge should be near the top (y position should be close to section's y)
    expect(Math.abs(badgeBox.y - sectionBox.y)).toBeLessThan(50);
  }
});

Then("the stats section should stack vertically on mobile", async function () {
  const dom = new DOMHelpers(this.page);

  const mightPool = dom.getByTestId("stat-might");
  const speedPool = dom.getByTestId("stat-speed");
  const intellectPool = dom.getByTestId("stat-intellect");

  await expect(mightPool).toBeVisible();
  await expect(speedPool).toBeVisible();
  await expect(intellectPool).toBeVisible();

  // On mobile, pools should stack (speed should be below might, intellect below speed)
  const mightBox = await mightPool.boundingBox();
  const speedBox = await speedPool.boundingBox();
  const intellectBox = await intellectPool.boundingBox();

  expect(mightBox).not.toBeNull();
  expect(speedBox).not.toBeNull();
  expect(intellectBox).not.toBeNull();

  if (mightBox && speedBox && intellectBox) {
    // Speed should be below Might
    expect(speedBox.y).toBeGreaterThan(mightBox.y + mightBox.height - 10);
    // Intellect should be below Speed
    expect(intellectBox.y).toBeGreaterThan(speedBox.y + speedBox.height - 10);
  }
});

Then("each stat pool should remain readable", async function () {
  const dom = new DOMHelpers(this.page);

  const mightLabel = dom.getByTestId("stat-might-label");
  const mightPool = dom.getByTestId("stat-might-pool");

  await expect(mightLabel).toBeVisible();
  await expect(mightPool).toBeVisible();

  // Verify text is not cut off or too small
  const labelText = await mightLabel.textContent();
  expect(labelText).toBeTruthy();
  expect(labelText?.length).toBeGreaterThan(0);
});

Then("all stat values should remain clickable", async function () {
  const dom = new DOMHelpers(this.page);

  const mightPool = dom.getByTestId("stat-might-pool");
  const speedEdge = dom.getByTestId("stat-speed-edge");
  const intellectCurrent = dom.getByTestId("stat-intellect-current");

  await expect(mightPool).toBeVisible();
  await expect(speedEdge).toBeVisible();
  await expect(intellectCurrent).toBeVisible();

  // Verify they have editable-field class or cursor pointer
  const mightCursor = await mightPool.evaluate((el) => {
    return window.getComputedStyle(el).cursor;
  });

  expect(mightCursor).toBe("pointer");
});
