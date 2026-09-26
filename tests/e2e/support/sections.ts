import type { Locator, Page } from "@playwright/test";
import { SECTION_DISPLAY_NAMES, type SectionId } from "../../../src/types/layout.js";

/**
 * Resolve a section's display name as written in Gherkin ("Special Abilities")
 * to its layout id ("specialAbilities").
 */
export function sectionId(name: string): SectionId {
  const entry = (Object.entries(SECTION_DISPLAY_NAMES) as [SectionId, string][]).find(
    ([, displayName]) => displayName === name
  );
  if (!entry) {
    throw new Error(`Unknown section: ${name}`);
  }
  return entry[0];
}

export function sectionLocator(page: Page, name: string): Locator {
  return page.locator(`[data-section-id="${sectionId(name)}"]`);
}
