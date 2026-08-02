/**
 * CharacterSheet component tests - version history integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CharacterSheet } from "../../src/components/CharacterSheet.js";
import { Character } from "../../src/types/character.js";
import { render } from "lit-html";

describe("CharacterSheet - Version History Integration", () => {
  let container: HTMLElement;
  let mockCharacter: Character;
  let characterSheet: CharacterSheet;

  beforeEach(() => {
    // Create container
    container = document.createElement("div");
    document.body.appendChild(container);

    // Create mock character
    mockCharacter = {
      name: "Test Character",
      descriptor: "Clever",
      type: "Jack",
      focus: "Who Controls Beasts",
      tier: 1,
      effort: 1,
      xp: 0,
      shins: 0,
      armor: 0,
      maxCyphers: 3,
      stats: {
        might: { pool: 10, edge: 0, current: 10 },
        speed: { pool: 10, edge: 0, current: 10 },
        intellect: { pool: 10, edge: 0, current: 10 },
      },
      recoveryRolls: {
        action: false,
        tenMinutes: false,
        oneHour: false,
        tenHours: false,
        modifier: 0,
      },
      damageTrack: {
        impairment: "healthy",
      },
      abilities: [],
      specialAbilities: [],
      attacks: [],
      cyphers: [],
      artifacts: [],
      oddities: [],
      equipment: [],
      textFields: {
        background: "",
        notes: "",
      },
    };

    // Create CharacterSheet
    characterSheet = new CharacterSheet(
      mockCharacter,
      vi.fn(), // onLoad
      vi.fn(), // onNew
      vi.fn(), // onImport
      vi.fn(), // onExport
      vi.fn(), // onFieldUpdate
      vi.fn(), // onQuickExport
      vi.fn() // onSaveAs
    );
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  it("should render successfully", () => {
    const template = characterSheet.render();
    render(template, container);

    expect(container.querySelector(".parchment-container")).toBeTruthy();
  });

  it("should have a method to mount version navigator", () => {
    expect(characterSheet).toHaveProperty("mountVersionNavigator");
    expect(typeof characterSheet.mountVersionNavigator).toBe("function");
  });

  it("should have a method to update version navigator", () => {
    expect(characterSheet).toHaveProperty("updateVersionNavigator");
    expect(typeof characterSheet.updateVersionNavigator).toBe("function");
  });

  it("should have a method to mount version warning banner", () => {
    expect(characterSheet).toHaveProperty("mountVersionWarningBanner");
    expect(typeof characterSheet.mountVersionWarningBanner).toBe("function");
  });

  it("should have a method to unmount version warning banner", () => {
    expect(characterSheet).toHaveProperty("unmountVersionWarningBanner");
    expect(typeof characterSheet.unmountVersionWarningBanner).toBe("function");
  });

  describe("rerenderSection", () => {
    it("re-renders the cyphers section in place to reflect a data change", () => {
      render(characterSheet.render(), container);
      expect(container.querySelector('[data-testid="cyphers-section"]')?.textContent).not.toContain(
        "New Cypher"
      );

      mockCharacter.cyphers.push({ name: "New Cypher", level: "1d6", effect: "Test effect" });
      characterSheet.rerenderSection("cyphers");

      expect(container.querySelector('[data-testid="cyphers-section"]')?.textContent).toContain(
        "New Cypher"
      );
    });

    it("re-renders the abilities section in place to reflect a data change", () => {
      render(characterSheet.render(), container);

      mockCharacter.abilities.push({ name: "New Ability", description: "Test" });
      characterSheet.rerenderSection("abilities");

      expect(container.querySelector('[data-testid="abilities-section"]')?.textContent).toContain(
        "New Ability"
      );
    });

    it("does nothing for a section with no dedicated collection DOM (e.g. basicInfo)", () => {
      render(characterSheet.render(), container);
      const before = container.innerHTML;

      characterSheet.rerenderSection("basicInfo");

      expect(container.innerHTML).toBe(before);
    });

    it("does nothing if the section isn't currently in the DOM", () => {
      // Nothing rendered into container yet, so no [data-testid="cyphers-section"] exists.
      expect(() => characterSheet.rerenderSection("cyphers")).not.toThrow();
    });
  });
});
