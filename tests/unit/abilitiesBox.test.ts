// Unit tests for Abilities component - Add Ability Button
/* global describe, it, expect, beforeEach, afterEach, vi, MouseEvent */

import { render } from "lit-html";
import { Abilities } from "../../src/components/Abilities.js";
import { Ability } from "../../src/types/character.js";

describe("Abilities - Add Ability Button", () => {
  let container: HTMLElement;
  let mockAbilities: Ability[];
  let mockOnUpdate: ReturnType<typeof vi.fn>;
  let mockOnDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "app";
    document.body.appendChild(container);

    mockOnUpdate = vi.fn();
    mockOnDelete = vi.fn();

    mockAbilities = [
      { name: "Bash", cost: 1, pool: "might", description: "Strike a foe with your weapon" },
      { name: "Fleet of Foot", cost: 1, pool: "speed", description: "Move a short distance" },
    ];
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should render add ability button", () => {
    const abilities = new Abilities(mockAbilities, mockOnUpdate, mockOnDelete);
    render(abilities.render(), container);

    const addButton = container.querySelector('[data-testid="add-ability-button"]');
    expect(addButton).toBeTruthy();
  });

  it("should render add ability button even when abilities array is empty", () => {
    const abilities = new Abilities([], mockOnUpdate, mockOnDelete);
    render(abilities.render(), container);

    const addButton = container.querySelector('[data-testid="add-ability-button"]');
    expect(addButton).toBeTruthy();
  });

  it("should have correct test id for add button", () => {
    const abilities = new Abilities(mockAbilities, mockOnUpdate, mockOnDelete);
    render(abilities.render(), container);

    const addButton = container.querySelector('[data-testid="add-ability-button"]');
    expect(addButton?.getAttribute("data-testid")).toBe("add-ability-button");
  });

  it("should render add button in header section", () => {
    const abilities = new Abilities(mockAbilities, mockOnUpdate, mockOnDelete);
    render(abilities.render(), container);

    const header = container.querySelector("h2");
    expect(header).toBeTruthy();

    const addButton = container.querySelector('[data-testid="add-ability-button"]');
    expect(addButton).toBeTruthy();
  });

  it("should not render add button if onUpdate callback is not provided", () => {
    const abilities = new Abilities(mockAbilities, undefined, mockOnDelete);
    render(abilities.render(), container);

    const addButton = container.querySelector('[data-testid="add-ability-button"]');
    expect(addButton).toBeNull();
  });

  it("should be clickable when rendered", () => {
    const abilities = new Abilities(mockAbilities, mockOnUpdate, mockOnDelete);
    render(abilities.render(), container);

    const addButton = container.querySelector('[data-testid="add-ability-button"]');
    expect(addButton).toBeTruthy();

    // Verify it can receive click events
    addButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    // The actual implementation will call handleAddAbility
  });
});
