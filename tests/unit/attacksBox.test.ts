// Unit tests for Attacks component - Add Attack Button
/* global describe, it, expect, beforeEach, afterEach, vi, MouseEvent */

import { render } from "lit-html";
import { Attacks } from "../../src/components/Attacks.js";
import { Character } from "../../src/types/character.js";

describe("Attacks - Add Attack Button", () => {
  let container: HTMLElement;
  let mockCharacter: Character;
  let mockOnFieldUpdate: ReturnType<typeof vi.fn>;
  let mockOnAttackUpdate: ReturnType<typeof vi.fn>;
  let mockOnAttackDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "app";
    document.body.appendChild(container);

    mockOnFieldUpdate = vi.fn();
    mockOnAttackUpdate = vi.fn();
    mockOnAttackDelete = vi.fn();

    mockCharacter = {
      name: "Test Character",
      tier: 1,
      type: "Glaive",
      descriptor: "Strong",
      focus: "Fights with Panache",
      xp: 0,
      shins: 10,
      armor: 1,
      effort: 1,
      maxCyphers: 2,
      stats: {
        might: { pool: 10, edge: 1, current: 10 },
        speed: { pool: 10, edge: 1, current: 10 },
        intellect: { pool: 10, edge: 0, current: 10 },
      },
      cyphers: [],
      artifacts: [],
      oddities: [],
      abilities: [],
      equipment: [],
      attacks: [
        { name: "Broadsword", damage: 6, modifier: 1, range: "Immediate" },
        { name: "Crossbow", damage: 4, modifier: 0, range: "Long" },
      ],
      specialAbilities: [],
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

  it("should render add attack button", () => {
    const attacks = new Attacks(
      mockCharacter,
      mockOnFieldUpdate,
      mockOnAttackUpdate,
      mockOnAttackDelete
    );
    render(attacks.render(), container);

    const addButton = container.querySelector('[data-testid="add-attack-button"]');
    expect(addButton).toBeTruthy();
  });

  it("should render add attack button even when attacks array is empty", () => {
    mockCharacter.attacks = [];
    const attacks = new Attacks(
      mockCharacter,
      mockOnFieldUpdate,
      mockOnAttackUpdate,
      mockOnAttackDelete
    );
    render(attacks.render(), container);

    const addButton = container.querySelector('[data-testid="add-attack-button"]');
    expect(addButton).toBeTruthy();
  });

  it("should have correct test id for add button", () => {
    const attacks = new Attacks(
      mockCharacter,
      mockOnFieldUpdate,
      mockOnAttackUpdate,
      mockOnAttackDelete
    );
    render(attacks.render(), container);

    const addButton = container.querySelector('[data-testid="add-attack-button"]');
    expect(addButton?.getAttribute("data-testid")).toBe("add-attack-button");
  });

  it("should render add button in header section", () => {
    const attacks = new Attacks(
      mockCharacter,
      mockOnFieldUpdate,
      mockOnAttackUpdate,
      mockOnAttackDelete
    );
    render(attacks.render(), container);

    const header = container.querySelector(".flex.justify-between.items-center");
    expect(header).toBeTruthy();

    const addButton = header?.querySelector('[data-testid="add-attack-button"]');
    const armorBadge = header?.querySelector('[data-testid="armor-badge"]');

    expect(addButton).toBeTruthy();
    expect(armorBadge).toBeTruthy();
  });

  it("should not render add button if onAttackUpdate callback is not provided", () => {
    const attacks = new Attacks(mockCharacter, mockOnFieldUpdate, undefined, mockOnAttackDelete);
    render(attacks.render(), container);

    const addButton = container.querySelector('[data-testid="add-attack-button"]');
    expect(addButton).toBeNull();
  });

  it("should be clickable when rendered", () => {
    const attacks = new Attacks(
      mockCharacter,
      mockOnFieldUpdate,
      mockOnAttackUpdate,
      mockOnAttackDelete
    );
    render(attacks.render(), container);

    const addButton = container.querySelector('[data-testid="add-attack-button"]');
    expect(addButton).toBeTruthy();

    // Verify it can receive click events
    addButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    // The actual implementation will call handleAddAttack
  });
});
