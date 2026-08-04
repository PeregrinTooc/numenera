/**
 * CharacterSheet component tests - version history integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CharacterSheet } from "../../src/components/CharacterSheet.js";
import { Character } from "../../src/types/character.js";
import * as RecoveryDamageSectionModule from "../../src/components/RecoveryDamageSection.js";

describe("CharacterSheet - Version History Integration", () => {
  let container: HTMLElement;
  let mockCharacter: Character;
  let characterSheet: CharacterSheet;

  beforeEach(() => {
    // Create container. The id matters: components re-render themselves into
    // #app, the same element main.ts renders the sheet into.
    container = document.createElement("div");
    container.id = "app";
    document.body.appendChild(container);

    // Create mock character
    mockCharacter = {
      name: "Test Character",
      descriptor: "Clever",
      type: "Jack",
      focus: "Who Controls Beasts",
      tier: 1,
      effort: 1,
      currentXp: 0,
      totalXp: 0,
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
    characterSheet.mount(container);

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
      characterSheet.mount(container);
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
      characterSheet.mount(container);

      mockCharacter.abilities.push({ name: "New Ability", description: "Test" });
      characterSheet.rerenderSection("abilities");

      expect(container.querySelector('[data-testid="abilities-section"]')?.textContent).toContain(
        "New Ability"
      );
    });

    it("leaves the rest of the sheet alone", () => {
      characterSheet.mount(container);
      const attacksBefore = container.querySelector('[data-testid="attacks-section"]');
      const basicInfoBefore = container.querySelector('[data-testid="basic-info"]');
      expect(attacksBefore).toBeTruthy();
      expect(basicInfoBefore).toBeTruthy();

      mockCharacter.cyphers.push({ name: "New Cypher", level: "1d6", effect: "Test effect" });
      characterSheet.rerenderSection("cyphers");

      // Same DOM nodes, not replacements: only the cyphers host was rendered into.
      expect(container.querySelector('[data-testid="attacks-section"]')).toBe(attacksBefore);
      expect(container.querySelector('[data-testid="basic-info"]')).toBe(basicInfoBefore);
    });

    it("does nothing for a section with no host of its own (e.g. basicInfo)", () => {
      characterSheet.mount(container);
      const before = container.innerHTML;

      characterSheet.rerenderSection("basicInfo");

      expect(container.innerHTML).toBe(before);
    });

    it("does nothing if the section isn't currently in the DOM", () => {
      // Nothing mounted yet, so no [data-section-host="cyphers"] exists.
      expect(() => characterSheet.rerenderSection("cyphers")).not.toThrow();
    });

    it("leaves later sheet renders able to update the section it re-rendered", () => {
      characterSheet.mount(container);

      mockCharacter.equipment.push({ name: "Sword", description: "" });
      characterSheet.rerenderSection("items");

      mockCharacter.shins = 250;
      characterSheet.mount(container);

      expect(container.querySelector('[data-testid="shins-badge"]')?.textContent).toContain("250");
    });
  });

  describe("getSectionTemplate", () => {
    it("constructs RecoveryDamageSection once per sheet, not once per render", () => {
      const OriginalRecoveryDamageSection = RecoveryDamageSectionModule.RecoveryDamageSection;
      const constructorSpy = vi
        .spyOn(RecoveryDamageSectionModule, "RecoveryDamageSection")
        .mockImplementation(function (
          ...args: ConstructorParameters<typeof OriginalRecoveryDamageSection>
        ) {
          return new OriginalRecoveryDamageSection(...args);
        });

      const sheet = new CharacterSheet(
        mockCharacter,
        vi.fn(),
        vi.fn(),
        vi.fn(),
        vi.fn(),
        vi.fn(),
        vi.fn(),
        vi.fn()
      );
      const callsAfterConstruction = constructorSpy.mock.calls.length;
      expect(callsAfterConstruction).toBeGreaterThan(0);

      sheet.mount(container);
      sheet.mount(container);

      expect(constructorSpy.mock.calls.length).toBe(callsAfterConstruction);
    });
  });
});
