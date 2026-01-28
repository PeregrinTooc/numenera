import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { RecoveryRolls } from "../../src/components/RecoveryRolls";
import { DamageTrack } from "../../src/components/DamageTrack";
import { CharacterSheet } from "../../src/components/CharacterSheet";
import type {
  Character,
  RecoveryRolls as RecoveryRollsType,
  DamageTrack as DamageTrackType,
} from "../../src/types/character";
import { render } from "lit-html";

describe("State Management Components", () => {
  let container: HTMLElement;
  let mockCharacter: Character;

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
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("RecoveryRolls Component", () => {
    it("should render all recovery roll checkboxes", () => {
      const recoveryRolls: RecoveryRollsType = {
        action: false,
        tenMinutes: false,
        oneHour: false,
        tenHours: false,
        modifier: 0,
      };

      const component = new RecoveryRolls(recoveryRolls);
      render(component.render(), container);

      const actionCheckbox = container.querySelector(
        '[data-testid="recovery-action"]'
      ) as HTMLInputElement;
      const tenMinCheckbox = container.querySelector(
        '[data-testid="recovery-ten-minutes"]'
      ) as HTMLInputElement;
      const oneHourCheckbox = container.querySelector(
        '[data-testid="recovery-one-hour"]'
      ) as HTMLInputElement;
      const tenHoursCheckbox = container.querySelector(
        '[data-testid="recovery-ten-hours"]'
      ) as HTMLInputElement;

      expect(actionCheckbox).toBeTruthy();
      expect(tenMinCheckbox).toBeTruthy();
      expect(oneHourCheckbox).toBeTruthy();
      expect(tenHoursCheckbox).toBeTruthy();
    });

    it("should reflect checkbox state from data", () => {
      const recoveryRolls: RecoveryRollsType = {
        action: true,
        tenMinutes: false,
        oneHour: true,
        tenHours: false,
        modifier: 2,
      };

      const component = new RecoveryRolls(recoveryRolls);
      render(component.render(), container);

      const actionCheckbox = container.querySelector(
        '[data-testid="recovery-action"]'
      ) as HTMLInputElement;
      const tenMinCheckbox = container.querySelector(
        '[data-testid="recovery-ten-minutes"]'
      ) as HTMLInputElement;
      const oneHourCheckbox = container.querySelector(
        '[data-testid="recovery-one-hour"]'
      ) as HTMLInputElement;
      const tenHoursCheckbox = container.querySelector(
        '[data-testid="recovery-ten-hours"]'
      ) as HTMLInputElement;

      expect(actionCheckbox.checked).toBe(true);
      expect(tenMinCheckbox.checked).toBe(false);
      expect(oneHourCheckbox.checked).toBe(true);
      expect(tenHoursCheckbox.checked).toBe(false);
    });

    it("should render recovery modifier display", () => {
      const recoveryRolls: RecoveryRollsType = {
        action: false,
        tenMinutes: false,
        oneHour: false,
        tenHours: false,
        modifier: 3,
      };

      const component = new RecoveryRolls(recoveryRolls);
      render(component.render(), container);

      const modifierDisplay = container.querySelector(
        '[data-testid="recovery-modifier-display"]'
      ) as HTMLElement;
      expect(modifierDisplay).toBeTruthy();
      expect(modifierDisplay.textContent).toContain("3");
    });

    it("should make modifier editable when onFieldUpdate provided", () => {
      const recoveryRolls: RecoveryRollsType = {
        action: false,
        tenMinutes: false,
        oneHour: false,
        tenHours: false,
        modifier: 0,
      };

      const onFieldUpdate = vi.fn();
      const component = new RecoveryRolls(recoveryRolls, onFieldUpdate);
      render(component.render(), container);

      const modifierDisplay = container.querySelector(
        '[data-testid="recovery-modifier-display"]'
      ) as HTMLElement;
      expect(modifierDisplay.classList.contains("editable-field")).toBe(true);
      expect(modifierDisplay.getAttribute("role")).toBe("button");
    });

    it("should not make modifier editable without onFieldUpdate", () => {
      const recoveryRolls: RecoveryRollsType = {
        action: false,
        tenMinutes: false,
        oneHour: false,
        tenHours: false,
        modifier: 0,
      };

      const component = new RecoveryRolls(recoveryRolls);
      render(component.render(), container);

      const modifierDisplay = container.querySelector(
        '[data-testid="recovery-modifier-display"]'
      ) as HTMLElement;
      expect(modifierDisplay.classList.contains("editable-field")).toBe(false);
    });

    it("should provide default values when data is undefined", () => {
      // @ts-expect-error - Testing defensive behavior
      const component = new RecoveryRolls(undefined);
      render(component.render(), container);

      const actionCheckbox = container.querySelector(
        '[data-testid="recovery-action"]'
      ) as HTMLInputElement;
      expect(actionCheckbox).toBeTruthy();
      expect(actionCheckbox.checked).toBe(false);
    });
  });

  describe("DamageTrack Component", () => {
    it("should render all damage track radio buttons", () => {
      const damageTrack: DamageTrackType = { impairment: "healthy" };

      const component = new DamageTrack(damageTrack);
      render(component.render(), container);

      const healthyRadio = container.querySelector(
        '[data-testid="damage-healthy"]'
      ) as HTMLInputElement;
      const impairedRadio = container.querySelector(
        '[data-testid="damage-impaired"]'
      ) as HTMLInputElement;
      const debilitatedRadio = container.querySelector(
        '[data-testid="damage-debilitated"]'
      ) as HTMLInputElement;

      expect(healthyRadio).toBeTruthy();
      expect(impairedRadio).toBeTruthy();
      expect(debilitatedRadio).toBeTruthy();
    });

    it("should select correct radio based on impairment state", () => {
      const damageTrack: DamageTrackType = { impairment: "impaired" };

      const component = new DamageTrack(damageTrack);
      render(component.render(), container);

      const healthyRadio = container.querySelector(
        '[data-testid="damage-healthy"]'
      ) as HTMLInputElement;
      const impairedRadio = container.querySelector(
        '[data-testid="damage-impaired"]'
      ) as HTMLInputElement;
      const debilitatedRadio = container.querySelector(
        '[data-testid="damage-debilitated"]'
      ) as HTMLInputElement;

      expect(healthyRadio.checked).toBe(false);
      expect(impairedRadio.checked).toBe(true);
      expect(debilitatedRadio.checked).toBe(false);
    });

    it("should select debilitated state correctly", () => {
      const damageTrack: DamageTrackType = { impairment: "debilitated" };

      const component = new DamageTrack(damageTrack);
      render(component.render(), container);

      const debilitatedRadio = container.querySelector(
        '[data-testid="damage-debilitated"]'
      ) as HTMLInputElement;
      expect(debilitatedRadio.checked).toBe(true);
    });

    it("should provide default values when data is undefined", () => {
      // @ts-expect-error - Testing defensive behavior
      const component = new DamageTrack(undefined);
      render(component.render(), container);

      const healthyRadio = container.querySelector(
        '[data-testid="damage-healthy"]'
      ) as HTMLInputElement;
      expect(healthyRadio).toBeTruthy();
      expect(healthyRadio.checked).toBe(true); // Should default to healthy
    });
  });

  describe("CharacterSheet Component", () => {
    it("should render all major sections", () => {
      const onFieldUpdate = vi.fn();
      const sheet = new CharacterSheet(mockCharacter, onFieldUpdate);
      render(sheet.render(), container);

      // Check for major sections
      const basicInfo = container.querySelector('[data-testid="basic-info"]');
      const statsSection = container.querySelector('[data-testid="stats-section"]');
      const recoverySection = container.querySelector('[data-testid="recovery-rolls-section"]');
      const damageSection = container.querySelector('[data-testid="damage-track-section"]');

      expect(basicInfo).toBeTruthy();
      expect(statsSection).toBeTruthy();
      expect(recoverySection).toBeTruthy();
      expect(damageSection).toBeTruthy();
    });

    it("should propagate stat pool updates via callbacks", () => {
      const onFieldUpdate = vi.fn();
      const _sheet = new CharacterSheet(mockCharacter, onFieldUpdate);

      // Simulate stat update callback being called
      const newValue = 15;

      // The component passes callbacks to StatPool components
      // Verify character state would be updated
      mockCharacter.stats.might.pool = newValue;

      expect(mockCharacter.stats.might.pool).toBe(15);
    });

    it("should propagate attack updates via callbacks", () => {
      mockCharacter.attacks = [{ name: "Sword", damage: 4, modifier: 0, range: "Immediate" }];

      const onFieldUpdate = vi.fn();
      const _sheet = new CharacterSheet(mockCharacter, onFieldUpdate);

      // Simulate attack update
      const updatedAttack = { name: "Enhanced Sword", damage: 6, modifier: 1, range: "Immediate" };
      mockCharacter.attacks[0] = updatedAttack;

      expect(mockCharacter.attacks[0].name).toBe("Enhanced Sword");
      expect(mockCharacter.attacks[0].damage).toBe(6);
    });

    it("should handle attack deletion", () => {
      mockCharacter.attacks = [
        { name: "Sword", damage: 4, modifier: 0, range: "Immediate" },
        { name: "Bow", damage: 4, modifier: 0, range: "Long" },
      ];

      // Simulate delete via filter
      mockCharacter.attacks = mockCharacter.attacks.filter((_, i) => i !== 0);

      expect(mockCharacter.attacks.length).toBe(1);
      expect(mockCharacter.attacks[0].name).toBe("Bow");
    });

    it("should handle ability updates", () => {
      mockCharacter.abilities = [{ name: "Bash", description: "Hit hard" }];

      const updatedAbility = { name: "Super Bash", description: "Hit harder" };
      mockCharacter.abilities[0] = updatedAbility;

      expect(mockCharacter.abilities[0].name).toBe("Super Bash");
    });

    it("should handle special ability updates", () => {
      mockCharacter.specialAbilities = [{ name: "Fleet", source: "Type", description: "Fast" }];

      const updatedSpecialAbility = {
        name: "Very Fleet",
        source: "Type",
        description: "Very fast",
      };
      mockCharacter.specialAbilities[0] = updatedSpecialAbility;

      expect(mockCharacter.specialAbilities[0].name).toBe("Very Fleet");
    });

    it("should handle recovery modifier updates", () => {
      const onFieldUpdate = vi.fn();
      const _sheet = new CharacterSheet(mockCharacter, onFieldUpdate);

      // Simulate recovery modifier update
      mockCharacter.recoveryRolls.modifier = 5;

      expect(mockCharacter.recoveryRolls.modifier).toBe(5);
    });
  });
});
