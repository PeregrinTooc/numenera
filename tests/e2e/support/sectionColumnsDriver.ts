import { expect, type Locator, type Page } from "@playwright/test";
import { sectionLocator } from "./sections.js";

const TOGGLE = "section-columns-button";

/** The column switch of the card sections, the columns they lay out and the badges in their headings. */
export interface SectionColumnsDriver {
  expectColumns(section: string, columns: number): Promise<void>;
  expectComparePaneCypherColumns(side: string, columns: number): Promise<void>;
  switchTo(section: string, columns: number): Promise<void>;
  expectSwitchOffered(section: string): Promise<void>;
  expectNoSwitchOffered(section: string): Promise<void>;
  expectChosenColumns(sectionId: string, columns: number): Promise<void>;
  expectBadgeLeftOfHeading(badgeTestId: string, section: string): Promise<void>;
  expectArmorBadgeClearOfAddAttack(): Promise<void>;
  expectHeadingRowInsideFrame(section: string): Promise<void>;
  expectAbilityBadgesInsideCards(): Promise<void>;
}

export class PlaywrightSectionColumnsDriver implements SectionColumnsDriver {
  constructor(private page: Page) {}

  async expectColumns(section: string, columns: number): Promise<void> {
    await this.expectGridColumns(
      sectionLocator(this.page, section).locator(".section-card-grid").first(),
      columns
    );
  }

  async expectComparePaneCypherColumns(side: string, columns: number): Promise<void> {
    await this.expectGridColumns(
      this.page
        .getByTestId(`compare-pane-${side}`)
        .getByTestId("cyphers-section")
        .locator(".section-card-grid"),
      columns
    );
  }

  async switchTo(section: string, columns: number): Promise<void> {
    const button = sectionLocator(this.page, section).getByTestId(TOGGLE);
    const pressed = columns === 2 ? "true" : "false";
    if ((await button.getAttribute("aria-pressed")) !== pressed) {
      await button.click();
    }
    await expect(button).toHaveAttribute("aria-pressed", pressed);
  }

  async expectSwitchOffered(section: string): Promise<void> {
    await expect(sectionLocator(this.page, section).getByTestId(TOGGLE)).toBeVisible();
  }

  // Hidden by the container query counts as not offered
  async expectNoSwitchOffered(section: string): Promise<void> {
    await expect(sectionLocator(this.page, section).getByTestId(TOGGLE)).toBeHidden();
  }

  /** The chosen count, which a narrow screen may still show as one column. */
  async expectChosenColumns(sectionId: string, columns: number): Promise<void> {
    await expect(this.page.getByTestId(`section-columns-${sectionId}`)).toHaveAttribute(
      "data-columns",
      String(columns)
    );
  }

  // The badge sits in the heading row, before the heading: entirely to its
  // left, with its top within the heading's height
  async expectBadgeLeftOfHeading(badgeTestId: string, section: string): Promise<void> {
    const badge = await this.page.getByTestId(badgeTestId).boundingBox();
    const heading = await sectionLocator(this.page, section).locator("h2").first().boundingBox();
    if (!badge || !heading) throw new Error(`No box for ${badgeTestId} or the ${section} heading`);
    expect(badge.x + badge.width).toBeLessThanOrEqual(heading.x);
    expect(badge.y).toBeLessThan(heading.y + heading.height);
  }

  async expectArmorBadgeClearOfAddAttack(): Promise<void> {
    const badge = await this.page.getByTestId("armor-badge").boundingBox();
    const button = await this.page.getByTestId("add-attack-button").boundingBox();
    if (!badge || !button) throw new Error("No box for the armor badge or the add attack button");
    const apart =
      badge.x >= button.x + button.width ||
      button.x >= badge.x + badge.width ||
      badge.y >= button.y + button.height ||
      button.y >= badge.y + badge.height;
    expect(apart).toBe(true);
  }

  // Every item of the heading row ends within the frame's content box
  async expectHeadingRowInsideFrame(section: string): Promise<void> {
    const overflow = await sectionLocator(this.page, section)
      .locator(".section-box-heading-row")
      .evaluate((row) => {
        const frame = row.closest(".section-box");
        if (!frame) throw new Error("heading row outside a frame");
        const style = window.getComputedStyle(frame);
        const contentRight =
          frame.getBoundingClientRect().right -
          parseFloat(style.borderRightWidth) -
          parseFloat(style.paddingRight);
        return Math.max(
          0,
          ...Array.from(row.children, (item) => item.getBoundingClientRect().right - contentRight)
        );
      });
    expect(overflow).toBeLessThanOrEqual(0.5);
  }

  // Inside the card's border and clear of its edit button
  async expectAbilityBadgesInsideCards(): Promise<void> {
    const cards = await sectionLocator(this.page, "Abilities").locator(".ability-item-card").all();
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      const misplaced = await card.evaluate((el) => {
        const inner =
          el.getBoundingClientRect().right -
          parseFloat(window.getComputedStyle(el).borderRightWidth);
        const edit = el
          .querySelector("[data-testid^='ability-edit-button']")
          ?.getBoundingClientRect();
        return Array.from(el.querySelectorAll(".ability-badge"))
          .map((badge) => badge.getBoundingClientRect())
          .filter(
            (b) =>
              b.right > inner + 0.5 ||
              (edit !== undefined &&
                b.left < edit.right &&
                edit.left < b.right &&
                b.top < edit.bottom &&
                edit.top < b.bottom)
          ).length;
      });
      expect(misplaced).toBe(0);
    }
  }

  // Column counts come from the browser's computed grid: container queries
  // decide them, so only a real layout can tell. Polled, because a section that
  // changed width (resize, pairing) re-lays out a frame later.
  private async expectGridColumns(grid: Locator, columns: number): Promise<void> {
    await expect
      .poll(() =>
        grid.evaluate(
          (el) => window.getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length
        )
      )
      .toBe(columns);
  }
}
