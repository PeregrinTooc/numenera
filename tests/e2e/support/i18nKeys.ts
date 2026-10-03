import { readFileSync } from "node:fs";

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
