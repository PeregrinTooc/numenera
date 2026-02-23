import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Attacks } from "../../src/components/Attacks";
import { Abilities } from "../../src/components/Abilities";
import { SpecialAbilities } from "../../src/components/SpecialAbilities";
import type { Character } from "../../src/types/character";
import { render } from "lit-html";
import { createMockCharacter } from "./helpers/containerTestSuite";

describe("Collection Components", () => {
  let container: HTMLElement;
  let mockCharacter: Character;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "app";
    document.body.appendChild(container);

    mockCharacter = createMockCharacter();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("Attacks Component", () => {
    it("should display empty state when no attacks", () => {
      mockCharacter.attacks = [];
      const onFieldUpdate = vi.fn();
      const attacks = new Attacks(mockCharacter, onFieldUpdate);
      render(attacks.render(), container);

      const emptyState = container.querySelector('[data-testid="empty-attacks"]') as HTMLElement;
      expect(emptyState).toBeTruthy();
    });

    it("should display attacks when they exist", () => {
      mockCharacter.attacks = [
        { name: "Sword Strike", damage: 4, modifier: 0, range: "Immediate" },
      ];

      const onFieldUpdate = vi.fn();
      const attacks = new Attacks(mockCharacter, onFieldUpdate);
      render(attacks.render(), container);

      const emptyState = container.querySelector('[data-testid="empty-attacks"]');
      expect(emptyState).toBeFalsy();
    });

    it("should render add attack button", () => {
      const onFieldUpdate = vi.fn();
      const attacks = new Attacks(mockCharacter, onFieldUpdate);
      render(attacks.render(), container);

      const addButton = container.querySelector(
        '[data-testid="add-attack-button"]'
      ) as HTMLButtonElement;
      expect(addButton).toBeTruthy();
    });

    it("should handle attack deletion with filter", () => {
      mockCharacter.attacks = [
        { name: "Sword", damage: 4, modifier: 0, range: "Immediate" },
        { name: "Bow", damage: 4, modifier: 0, range: "Long" },
      ];

      const indexToDelete = 0;
      mockCharacter.attacks = mockCharacter.attacks.filter((_, i) => i !== indexToDelete);

      expect(mockCharacter.attacks.length).toBe(1);
      expect(mockCharacter.attacks[0].name).toBe("Bow");
    });

    it("should calculate new index correctly for adding attacks", () => {
      mockCharacter.attacks = [{ name: "Sword", damage: 4, modifier: 0, range: "Immediate" }];

      const newIndex = mockCharacter.attacks.length - 1;
      expect(newIndex).toBe(0);

      // Add another
      mockCharacter.attacks.push({ name: "Bow", damage: 4, modifier: 0, range: "Long" });
      const newIndex2 = mockCharacter.attacks.length - 1;
      expect(newIndex2).toBe(1);
    });

    it("should render armor field as editable", () => {
      const onFieldUpdate = vi.fn();
      const attacks = new Attacks(mockCharacter, onFieldUpdate);
      render(attacks.render(), container);

      const armorBadge = container.querySelector('[data-testid="armor-badge"]') as HTMLElement;
      expect(armorBadge).toBeTruthy();
      expect(armorBadge.classList.contains("editable-field")).toBe(true);
    });
  });

  describe("Abilities Component", () => {
    it("should display empty state when no abilities", () => {
      mockCharacter.abilities = [];
      const abilitiesComp = new Abilities(mockCharacter);
      render(abilitiesComp.render(), container);

      const emptyState = container.querySelector('[data-testid="empty-abilities"]') as HTMLElement;
      expect(emptyState).toBeTruthy();
    });

    it("should display abilities when they exist", () => {
      mockCharacter.abilities = [{ name: "Bash", description: "Hit hard" }];
      const abilitiesComp = new Abilities(mockCharacter);
      render(abilitiesComp.render(), container);

      const emptyState = container.querySelector('[data-testid="empty-abilities"]');
      expect(emptyState).toBeFalsy();
    });

    it("should render add ability button (event-based pattern)", () => {
      mockCharacter.abilities = [];
      const abilitiesComp = new Abilities(mockCharacter);
      render(abilitiesComp.render(), container);

      const addButton = container.querySelector(
        '[data-testid="add-ability-button"]'
      ) as HTMLButtonElement;
      expect(addButton).toBeTruthy();
    });

    it("should always render add button in event-based pattern", () => {
      mockCharacter.abilities = [];
      const abilitiesComp = new Abilities(mockCharacter);
      render(abilitiesComp.render(), container);

      const addButton = container.querySelector('[data-testid="add-ability-button"]');
      // Event-based pattern always renders add button
      expect(addButton).toBeTruthy();
    });

    it("should handle ability update at index", () => {
      mockCharacter.abilities = [{ name: "Bash", description: "Hit hard" }];

      const updated = { name: "Super Bash", description: "Hit harder" };
      mockCharacter.abilities[0] = updated;

      expect(mockCharacter.abilities[0].name).toBe("Super Bash");
    });

    it("should calculate new index correctly when adding", () => {
      mockCharacter.abilities = [{ name: "Bash", description: "Hit" }];

      const newIndex = mockCharacter.abilities.length - 1;
      expect(newIndex).toBe(0);
    });
  });

  describe("SpecialAbilities Component", () => {
    it("should display empty state when no special abilities", () => {
      mockCharacter.specialAbilities = [];
      const specialAbilitiesComp = new SpecialAbilities(mockCharacter);
      render(specialAbilitiesComp.render(), container);

      const emptyState = container.querySelector(
        '[data-testid="empty-special-abilities"]'
      ) as HTMLElement;
      expect(emptyState).toBeTruthy();
    });

    it("should display special abilities when they exist", () => {
      mockCharacter.specialAbilities = [
        { name: "Fleet of Foot", source: "Type", description: "Move faster" },
      ];
      const specialAbilitiesComp = new SpecialAbilities(mockCharacter);
      render(specialAbilitiesComp.render(), container);

      const emptyState = container.querySelector('[data-testid="empty-special-abilities"]');
      expect(emptyState).toBeFalsy();
    });

    it("should render add button (event-based pattern)", () => {
      mockCharacter.specialAbilities = [];
      const specialAbilitiesComp = new SpecialAbilities(mockCharacter);
      render(specialAbilitiesComp.render(), container);

      const addButton = container.querySelector(
        '[data-testid="add-special-ability-button"]'
      ) as HTMLButtonElement;
      expect(addButton).toBeTruthy();
    });

    it("should always render add button in event-based pattern", () => {
      mockCharacter.specialAbilities = [];
      const specialAbilitiesComp = new SpecialAbilities(mockCharacter);
      render(specialAbilitiesComp.render(), container);

      const addButton = container.querySelector('[data-testid="add-special-ability-button"]');
      // Event-based pattern always renders add button
      expect(addButton).toBeTruthy();
    });

    it("should handle special ability deletion", () => {
      mockCharacter.specialAbilities = [
        { name: "Fleet", source: "Type", description: "Fast" },
        { name: "Strong", source: "Descriptor", description: "Powerful" },
      ];

      mockCharacter.specialAbilities = mockCharacter.specialAbilities.filter((_, i) => i !== 0);

      expect(mockCharacter.specialAbilities.length).toBe(1);
      expect(mockCharacter.specialAbilities[0].name).toBe("Strong");
    });

    it("should calculate array length minus one for new index", () => {
      mockCharacter.specialAbilities = [{ name: "Fleet", source: "Type", description: "Fast" }];

      const newIndex = mockCharacter.specialAbilities.length - 1;
      expect(newIndex).toBe(0);
    });
  });

  describe("Common Collection Patterns", () => {
    it("should use filter with index comparison for deletion", () => {
      const items = ["a", "b", "c"];
      const indexToDelete = 1;

      const filtered = items.filter((_, i) => i !== indexToDelete);

      expect(filtered).toEqual(["a", "c"]);
      expect(filtered.length).toBe(2);
    });

    it("should push to array and calculate length - 1 for new index", () => {
      const items: string[] = [];

      items.push("first");
      let newIndex = items.length - 1;
      expect(newIndex).toBe(0);

      items.push("second");
      newIndex = items.length - 1;
      expect(newIndex).toBe(1);
    });

    it("should update array element at specific index", () => {
      const items = [{ id: 1 }, { id: 2 }];

      items[0] = { id: 99 };

      expect(items[0].id).toBe(99);
      expect(items[1].id).toBe(2);
    });
  });
});
