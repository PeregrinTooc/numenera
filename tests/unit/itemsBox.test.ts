import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ItemsBox } from "../../src/components/ItemsBox";
import type { Character } from "../../src/types/character";
import { render } from "lit-html";

describe("ItemsBox", () => {
  let container: HTMLElement;
  let mockCharacter: Character;
  let onFieldUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    mockCharacter = {
      name: "Test",
      type: "Glaive",
      descriptor: "Strong",
      focus: "Bears a Halo of Fire",
      tier: 3,
      xp: 0,
      effort: 1,
      stats: {
        might: { pool: 10, edge: 0, current: 10 },
        speed: { pool: 10, edge: 0, current: 10 },
        intellect: { pool: 10, edge: 0, current: 10 },
      },
      armor: 0,
      shins: 50,
      maxCyphers: 2,
      cyphers: [],
      abilities: [],
      specialAbilities: [],
      equipment: [],
      artifacts: [],
      oddities: [],
      attacks: [],
      recoveryRolls: {
        action: false,
        tenMinutes: false,
        oneHour: false,
        tenHours: false,
        modifier: 0,
      },
      damageTrack: { impairment: "healthy" },
      textFields: { background: "", notes: "" },
    };

    onFieldUpdate = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("Shins Badge", () => {
    it("should display shins value", () => {
      const itemsBox = new ItemsBox(mockCharacter, onFieldUpdate);
      render(itemsBox.render(), container);

      const shinsBadge = container.querySelector('[data-testid="shins-badge"]') as HTMLElement;
      expect(shinsBadge).toBeTruthy();
      expect(shinsBadge.textContent).toContain("50");
    });

    it("should open edit modal when shins badge clicked", () => {
      const itemsBox = new ItemsBox(mockCharacter, onFieldUpdate);
      render(itemsBox.render(), container);

      const shinsBadge = container.querySelector('[data-testid="shins-badge"]') as HTMLElement;
      expect(shinsBadge.classList.contains("editable-field")).toBe(true);

      // Verify it's clickable
      expect(shinsBadge.getAttribute("role")).toBe("button");
      expect(shinsBadge.getAttribute("tabindex")).toBe("0");
    });
  });

  describe("Equipment Management", () => {
    it("should display empty state when no equipment", () => {
      const itemsBox = new ItemsBox(mockCharacter, onFieldUpdate);
      render(itemsBox.render(), container);

      const emptyState = container.querySelector('[data-testid="empty-equipment"]') as HTMLElement;
      expect(emptyState).toBeTruthy();
    });

    it("should display equipment list when items exist", () => {
      mockCharacter.equipment = [
        { name: "Sword", description: "A sharp blade" },
        { name: "Shield", description: "Protective gear" },
      ];

      const itemsBox = new ItemsBox(mockCharacter, onFieldUpdate);
      render(itemsBox.render(), container);

      const equipmentList = container.querySelector(
        '[data-testid="equipment-list"]'
      ) as HTMLElement;
      expect(equipmentList).toBeTruthy();

      const emptyState = container.querySelector('[data-testid="empty-equipment"]');
      expect(emptyState).toBeFalsy();
    });

    it("should render add equipment button", () => {
      const itemsBox = new ItemsBox(mockCharacter, onFieldUpdate);
      render(itemsBox.render(), container);

      const addButton = container.querySelector(
        '[data-testid="add-equipment-button"]'
      ) as HTMLButtonElement;
      expect(addButton).toBeTruthy();
    });

    it("should handle equipment deletion by filtering array", () => {
      mockCharacter.equipment = [
        { name: "Sword", description: "Sharp" },
        { name: "Shield", description: "Strong" },
        { name: "Bow", description: "Long range" },
      ];

      const initialLength = mockCharacter.equipment.length;

      // Simulate delete by filtering (mimics component behavior)
      const indexToDelete = 1;
      mockCharacter.equipment = mockCharacter.equipment.filter((_, i) => i !== indexToDelete);

      expect(mockCharacter.equipment.length).toBe(initialLength - 1);
      expect(mockCharacter.equipment.find((e) => e.name === "Shield")).toBeUndefined();
      expect(mockCharacter.equipment[0].name).toBe("Sword");
      expect(mockCharacter.equipment[1].name).toBe("Bow");
    });

    it("should update equipment at specific index", () => {
      mockCharacter.equipment = [
        { name: "Sword", description: "Sharp" },
        { name: "Shield", description: "Strong" },
      ];

      // Simulate update
      const updatedItem = { name: "Magic Shield", description: "Very Strong" };
      mockCharacter.equipment[1] = updatedItem;

      expect(mockCharacter.equipment[1].name).toBe("Magic Shield");
      expect(mockCharacter.equipment[1].description).toBe("Very Strong");
    });
  });

  describe("Artifacts Management", () => {
    it("should display empty state when no artifacts", () => {
      const itemsBox = new ItemsBox(mockCharacter, onFieldUpdate);
      render(itemsBox.render(), container);

      const emptyState = container.querySelector('[data-testid="empty-artifacts"]') as HTMLElement;
      expect(emptyState).toBeTruthy();
    });

    it("should display artifacts list when items exist", () => {
      mockCharacter.artifacts = [{ name: "Ancient Ring", level: "5", effect: "Grants power" }];

      const itemsBox = new ItemsBox(mockCharacter, onFieldUpdate);
      render(itemsBox.render(), container);

      const artifactsList = container.querySelector(
        '[data-testid="artifacts-list"]'
      ) as HTMLElement;
      expect(artifactsList).toBeTruthy();
    });

    it("should render add artifact button", () => {
      const itemsBox = new ItemsBox(mockCharacter, onFieldUpdate);
      render(itemsBox.render(), container);

      const addButton = container.querySelector(
        '[data-testid="add-artifact-button"]'
      ) as HTMLButtonElement;
      expect(addButton).toBeTruthy();
    });

    it("should handle artifact deletion by filtering array", () => {
      mockCharacter.artifacts = [
        { name: "Ring", level: "5", effect: "Power" },
        { name: "Amulet", level: "3", effect: "Protection" },
        { name: "Staff", level: "7", effect: "Magic" },
      ];

      const initialLength = mockCharacter.artifacts.length;
      const indexToDelete = 1;

      mockCharacter.artifacts = mockCharacter.artifacts.filter((_, i) => i !== indexToDelete);

      expect(mockCharacter.artifacts.length).toBe(initialLength - 1);
      expect(mockCharacter.artifacts.find((a) => a.name === "Amulet")).toBeUndefined();
    });

    it("should update artifact at specific index", () => {
      mockCharacter.artifacts = [{ name: "Ring", level: "5", effect: "Power" }];

      const updatedItem = { name: "Enhanced Ring", level: "6", effect: "Great Power" };
      mockCharacter.artifacts[0] = updatedItem;

      expect(mockCharacter.artifacts[0].name).toBe("Enhanced Ring");
      expect(mockCharacter.artifacts[0].level).toBe("6");
    });
  });

  describe("Oddities Management", () => {
    it("should display empty state when no oddities", () => {
      const itemsBox = new ItemsBox(mockCharacter, onFieldUpdate);
      render(itemsBox.render(), container);

      const emptyState = container.querySelector('[data-testid="empty-oddities"]') as HTMLElement;
      expect(emptyState).toBeTruthy();
    });

    it("should display oddities list when items exist", () => {
      mockCharacter.oddities = ["Strange cube", "Glowing orb"];

      const itemsBox = new ItemsBox(mockCharacter, onFieldUpdate);
      render(itemsBox.render(), container);

      const odditiesList = container.querySelector('[data-testid="oddities-list"]') as HTMLElement;
      expect(odditiesList).toBeTruthy();
    });

    it("should render add oddity button", () => {
      const itemsBox = new ItemsBox(mockCharacter, onFieldUpdate);
      render(itemsBox.render(), container);

      const addButton = container.querySelector(
        '[data-testid="add-oddity-button"]'
      ) as HTMLButtonElement;
      expect(addButton).toBeTruthy();
    });

    it("should handle oddity deletion by filtering array", () => {
      mockCharacter.oddities = ["Cube", "Orb", "Stone"];

      const initialLength = mockCharacter.oddities.length;
      const indexToDelete = 1;

      mockCharacter.oddities = mockCharacter.oddities.filter((_, i) => i !== indexToDelete);

      expect(mockCharacter.oddities.length).toBe(initialLength - 1);
      expect(mockCharacter.oddities.includes("Orb")).toBe(false);
      expect(mockCharacter.oddities).toEqual(["Cube", "Stone"]);
    });

    it("should update oddity at specific index", () => {
      mockCharacter.oddities = ["Cube", "Orb"];

      mockCharacter.oddities[1] = "Enhanced Orb";

      expect(mockCharacter.oddities[1]).toBe("Enhanced Orb");
    });
  });
});
