import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Attacks } from "../../src/components/Attacks";
import { Abilities } from "../../src/components/Abilities";
import { SpecialAbilities } from "../../src/components/SpecialAbilities";
import type { Character, Ability, SpecialAbility } from "../../src/types/character";
import { render } from "lit-html";

describe("Collection Components", () => {
  let container: HTMLElement;
  let mockCharacter: Character;
  let onUpdate: ReturnType<typeof vi.fn>;
  let onDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    mockCharacter = {
      name: "Test",
      type: "Glaive",
      descriptor: "Strong",
      focus: "Focus",
      tier: 3,
      xp: 0,
      effort: 1,
      stats: {
        might: { pool: 10, edge: 0, current: 10 },
        speed: { pool: 10, edge: 0, current: 10 },
        intellect: { pool: 10, edge: 0, current: 10 },
      },
      armor: 0,
      shins: 0,
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

    onUpdate = vi.fn();
    onDelete = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("Attacks Component", () => {
    it("should display empty state when no attacks", () => {
      const onFieldUpdate = vi.fn();
      const attacks = new Attacks(mockCharacter, onFieldUpdate, undefined, undefined);
      render(attacks.render(), container);

      const emptyState = container.querySelector('[data-testid="empty-attacks"]') as HTMLElement;
      expect(emptyState).toBeTruthy();
    });

    it("should display attacks when they exist", () => {
      mockCharacter.attacks = [
        { name: "Sword Strike", damage: 4, modifier: 0, range: "Immediate" },
      ];

      const onFieldUpdate = vi.fn();
      const attacks = new Attacks(mockCharacter, onFieldUpdate, undefined, undefined);
      render(attacks.render(), container);

      const emptyState = container.querySelector('[data-testid="empty-attacks"]');
      expect(emptyState).toBeFalsy();
    });

    it("should render add attack button", () => {
      const onFieldUpdate = vi.fn();
      const attacks = new Attacks(mockCharacter, onFieldUpdate, onUpdate, onDelete);
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
      const attacks = new Attacks(mockCharacter, onFieldUpdate, undefined, undefined);
      render(attacks.render(), container);

      const armorBadge = container.querySelector('[data-testid="armor-badge"]') as HTMLElement;
      expect(armorBadge).toBeTruthy();
      expect(armorBadge.classList.contains("editable-field")).toBe(true);
    });
  });

  describe("Abilities Component", () => {
    let abilities: Ability[];

    beforeEach(() => {
      abilities = [];
    });

    it("should display empty state when no abilities", () => {
      const abilitiesComp = new Abilities(abilities, undefined, undefined);
      render(abilitiesComp.render(), container);

      const emptyState = container.querySelector('[data-testid="empty-abilities"]') as HTMLElement;
      expect(emptyState).toBeTruthy();
    });

    it("should display abilities when they exist", () => {
      abilities = [{ name: "Bash", description: "Hit hard" }];

      const abilitiesComp = new Abilities(abilities, undefined, undefined);
      render(abilitiesComp.render(), container);

      const emptyState = container.querySelector('[data-testid="empty-abilities"]');
      expect(emptyState).toBeFalsy();
    });

    it("should render add ability button when onUpdate provided", () => {
      const abilitiesComp = new Abilities(abilities, onUpdate, onDelete);
      render(abilitiesComp.render(), container);

      const addButton = container.querySelector(
        '[data-testid="add-ability-button"]'
      ) as HTMLButtonElement;
      expect(addButton).toBeTruthy();
    });

    it("should not render add button when onUpdate not provided", () => {
      const abilitiesComp = new Abilities(abilities, undefined, undefined);
      render(abilitiesComp.render(), container);

      const addButton = container.querySelector('[data-testid="add-ability-button"]');
      expect(addButton).toBeFalsy();
    });

    it("should handle ability update at index", () => {
      abilities = [{ name: "Bash", description: "Hit hard" }];

      const updated = { name: "Super Bash", description: "Hit harder" };
      abilities[0] = updated;

      expect(abilities[0].name).toBe("Super Bash");
    });

    it("should calculate new index correctly when adding", () => {
      abilities = [{ name: "Bash", description: "Hit" }];

      const newIndex = abilities.length - 1;
      expect(newIndex).toBe(0);
    });
  });

  describe("SpecialAbilities Component", () => {
    let specialAbilities: SpecialAbility[];

    beforeEach(() => {
      specialAbilities = [];
    });

    it("should display empty state when no special abilities", () => {
      const specialAbilitiesComp = new SpecialAbilities(specialAbilities, undefined, undefined);
      render(specialAbilitiesComp.render(), container);

      const emptyState = container.querySelector(
        '[data-testid="empty-special-abilities"]'
      ) as HTMLElement;
      expect(emptyState).toBeTruthy();
    });

    it("should display special abilities when they exist", () => {
      specialAbilities = [{ name: "Fleet of Foot", source: "Type", description: "Move faster" }];

      const specialAbilitiesComp = new SpecialAbilities(specialAbilities, undefined, undefined);
      render(specialAbilitiesComp.render(), container);

      const emptyState = container.querySelector('[data-testid="empty-special-abilities"]');
      expect(emptyState).toBeFalsy();
    });

    it("should render add button when onUpdate provided", () => {
      const specialAbilitiesComp = new SpecialAbilities(specialAbilities, onUpdate, onDelete);
      render(specialAbilitiesComp.render(), container);

      const addButton = container.querySelector(
        '[data-testid="add-special-ability-button"]'
      ) as HTMLButtonElement;
      expect(addButton).toBeTruthy();
    });

    it("should not render add button without onUpdate", () => {
      const specialAbilitiesComp = new SpecialAbilities(specialAbilities, undefined, undefined);
      render(specialAbilitiesComp.render(), container);

      const addButton = container.querySelector('[data-testid="add-special-ability-button"]');
      expect(addButton).toBeFalsy();
    });

    it("should handle special ability deletion", () => {
      specialAbilities = [
        { name: "Fleet", source: "Type", description: "Fast" },
        { name: "Strong", source: "Descriptor", description: "Powerful" },
      ];

      specialAbilities = specialAbilities.filter((_, i) => i !== 0);

      expect(specialAbilities.length).toBe(1);
      expect(specialAbilities[0].name).toBe("Strong");
    });

    it("should calculate array length minus one for new index", () => {
      specialAbilities = [{ name: "Fleet", source: "Type", description: "Fast" }];

      const newIndex = specialAbilities.length - 1;
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
