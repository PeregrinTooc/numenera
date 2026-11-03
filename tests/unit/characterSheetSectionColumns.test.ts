import { describe, it, expect, vi, beforeEach } from "vitest";
import { CharacterSheet } from "@/components/CharacterSheet";
import { SECTION_COLUMNS_STORAGE_KEY } from "@/storage/storageConstants";
import { createCharacterWithItems } from "../factories/character.js";

function mountSheet(): CharacterSheet {
  document.body.innerHTML = '<div id="app"></div>';
  const sheet = new CharacterSheet(
    createCharacterWithItems(),
    vi.fn(),
    vi.fn(),
    vi.fn(),
    vi.fn(),
    vi.fn()
  );
  sheet.mount(document.getElementById("app") as HTMLElement);
  return sheet;
}

function columnsWrapper(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-testid="section-columns-${id}"]`);
}

describe("CharacterSheet section columns", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("a card section is wrapped in a column container with its column count", () => {
    mountSheet();

    expect(columnsWrapper("cyphers")?.dataset.columns).toBe("2");
    expect(columnsWrapper("cyphers")?.classList.contains("section-columns-2")).toBe(true);
    expect(columnsWrapper("attacks")?.dataset.columns).toBe("1");
    expect(columnsWrapper("attacks")?.classList.contains("section-columns-2")).toBe(false);
  });

  it("a stored choice sets the column count", () => {
    localStorage.setItem(SECTION_COLUMNS_STORAGE_KEY, '{"cyphers":1}');

    mountSheet();

    expect(columnsWrapper("cyphers")?.dataset.columns).toBe("1");
  });

  it("non-card sections get no column container", () => {
    mountSheet();

    expect(columnsWrapper("stats")).toBeNull();
  });

  it("card lists use the section card grid", () => {
    mountSheet();

    for (const list of [
      "abilities-list",
      "special-abilities-list",
      "attacks-list",
      "cyphers-list",
      "equipment-list",
    ]) {
      const element = document.querySelector(`[data-testid="${list}"]`);
      expect(element?.classList.contains("section-card-grid"), list).toBe(true);
      expect(element?.classList.contains("md:grid-cols-2"), list).toBe(false);
    }
  });

  it("Items' Artifacts and Oddities split follows the same columns", () => {
    mountSheet();

    const split = document.querySelector('[data-testid="artifacts-section"]')?.parentElement;
    expect(split?.classList.contains("section-card-grid")).toBe(true);
  });
});
