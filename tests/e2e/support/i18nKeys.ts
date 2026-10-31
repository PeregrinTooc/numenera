import { readFileSync } from "node:fs";
import type { Locator } from "@playwright/test";

const en = JSON.parse(
  readFileSync(new URL("../../../src/i18n/locales/en.json", import.meta.url), "utf8")
) as Record<string, unknown>;

/**
 * Matches text shaped like an i18n key under one of en.json's top-level
 * namespaces ("character.name", "attacks.doesNotExist"). Matching by namespace
 * rather than by known key is the point: i18next renders a *missing* key as
 * the key itself, and a missing key is by definition not in en.json.
 *
 * Case-insensitive because `innerText` applies CSS `text-transform`: a raw key
 * in an uppercased label reads "CHARACTER.DOESNOTEXIST".
 */
export const RAW_I18N_KEY = new RegExp(
  `\\b(?:${Object.keys(en).join("|")})\\.[A-Za-z0-9_.]+\\b`,
  "i"
);

/** Attributes that carry user-facing text (read by screen readers or shown as tooltips). */
const USER_FACING_ATTRIBUTES = ["aria-label", "title", "placeholder", "alt"];

interface AttributeSnapshot {
  element: string;
  attribute: string;
  value: string;
}

/**
 * Collects the user-facing attributes of `root` and every descendant, each
 * paired with a short description of its element (tag plus data-testid).
 */
async function collectUserFacingAttributes(root: Locator): Promise<AttributeSnapshot[]> {
  return root.evaluate((rootEl, attributes) => {
    const snapshots: { element: string; attribute: string; value: string }[] = [];
    for (const el of [rootEl, ...Array.from(rootEl.querySelectorAll("*"))]) {
      const tag = el.tagName.toLowerCase();
      const testId = el.getAttribute("data-testid");
      const element = testId ? `<${tag} data-testid="${testId}">` : `<${tag}>`;
      for (const attribute of attributes) {
        const value = el.getAttribute(attribute);
        if (value) snapshots.push({ element, attribute, value });
      }
    }
    return snapshots;
  }, USER_FACING_ATTRIBUTES);
}

/**
 * Throws if the visible text of `root`, or any user-facing attribute inside it,
 * looks like a raw i18n key. The message names the offending element,
 * attribute and value.
 */
export async function assertNoRawI18nKeys(root: Locator): Promise<void> {
  const text = await root.innerText();
  const textMatch = RAW_I18N_KEY.exec(text);
  if (textMatch) {
    throw new Error(`Untranslated key "${textMatch[0]}" found in visible text`);
  }
  for (const { element, attribute, value } of await collectUserFacingAttributes(root)) {
    if (RAW_I18N_KEY.test(value)) {
      throw new Error(`Untranslated key in ${attribute}="${value}" on ${element}`);
    }
  }
}
