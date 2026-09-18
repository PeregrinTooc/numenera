/**
 * CharacterSheet layout persistence tests.
 *
 * Regression coverage for: exiting layout edit mode re-saved the in-memory
 * `this.layout` snapshot unconditionally, clobbering any layout change that
 * had been written to storage since this CharacterSheet instance was
 * constructed or since edit mode was entered.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { CharacterSheet } from "../../src/components/CharacterSheet.js";
import { Layout } from "../../src/types/layout.js";
import { loadLayout } from "../../src/storage/layoutStorage.js";
import { LAYOUT_STORAGE_KEY } from "../../src/storage/storageConstants.js";
import { createTestCharacter as createMockCharacter } from "../factories/character.js";

const REORDERED_LAYOUT: Layout = [
  { type: "single", id: "cyphers" },
  { type: "single", id: "basicInfo" },
  { type: "single", id: "stats" },
  { type: "single", id: "recoveryDamage" },
  { type: "single", id: "abilities" },
  { type: "grid", items: ["specialAbilities", "attacks"] },
  { type: "single", id: "items" },
  { type: "grid", items: ["background", "notes"] },
];

describe("CharacterSheet layout persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not clobber a layout written to storage during an edit session", () => {
    const characterSheet = new CharacterSheet(
      createMockCharacter(),
      () => {},
      () => {},
      () => {},
      () => {},
      () => {}
    );

    // Enter edit mode on the sheet's original (default) in-memory layout.
    characterSheet.toggleLayoutEditMode();

    // Something outside this instance updates the persisted layout — this is
    // exactly what the "moved section to top" E2E step does, since dragging
    // cannot be reliably automated and it writes storage directly instead.
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(REORDERED_LAYOUT));

    // Exit edit mode.
    characterSheet.toggleLayoutEditMode();

    expect(loadLayout()).toEqual(REORDERED_LAYOUT);
  });
});
