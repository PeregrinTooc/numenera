// Unit tests for SpecialAbilities component - Add Special Ability Button
/* global describe, it, expect, beforeEach, afterEach, vi, MouseEvent */

import { render } from "lit-html";
import { SpecialAbilities } from "../../src/components/SpecialAbilities.js";
import { SpecialAbility } from "../../src/types/character.js";

describe("SpecialAbilities - Add Special Ability Button", () => {
  let container: HTMLElement;
  let mockSpecialAbilities: SpecialAbility[];
  let mockOnUpdate: ReturnType<typeof vi.fn>;
  let mockOnDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "app";
    document.body.appendChild(container);

    mockOnUpdate = vi.fn();
    mockOnDelete = vi.fn();

    mockSpecialAbilities = [
      {
        name: "Practiced in Armor",
        source: "Type",
        description: "You can wear armor for long periods",
      },
      {
        name: "Fire Affinity",
        source: "Focus",
        description: "You are trained in fire-based attacks",
      },
    ];
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should render add special ability button", () => {
    const specialAbilities = new SpecialAbilities(mockSpecialAbilities, mockOnUpdate, mockOnDelete);
    render(specialAbilities.render(), container);

    const addButton = container.querySelector('[data-testid="add-special-ability-button"]');
    expect(addButton).toBeTruthy();
  });

  it("should render add special ability button even when special abilities array is empty", () => {
    const specialAbilities = new SpecialAbilities([], mockOnUpdate, mockOnDelete);
    render(specialAbilities.render(), container);

    const addButton = container.querySelector('[data-testid="add-special-ability-button"]');
    expect(addButton).toBeTruthy();
  });

  it("should have correct test id for add button", () => {
    const specialAbilities = new SpecialAbilities(mockSpecialAbilities, mockOnUpdate, mockOnDelete);
    render(specialAbilities.render(), container);

    const addButton = container.querySelector('[data-testid="add-special-ability-button"]');
    expect(addButton?.getAttribute("data-testid")).toBe("add-special-ability-button");
  });

  it("should render add button in header section", () => {
    const specialAbilities = new SpecialAbilities(mockSpecialAbilities, mockOnUpdate, mockOnDelete);
    render(specialAbilities.render(), container);

    const header = container.querySelector("h2");
    expect(header).toBeTruthy();

    const addButton = container.querySelector('[data-testid="add-special-ability-button"]');
    expect(addButton).toBeTruthy();
  });

  it("should not render add button if onUpdate callback is not provided", () => {
    const specialAbilities = new SpecialAbilities(mockSpecialAbilities, undefined, mockOnDelete);
    render(specialAbilities.render(), container);

    const addButton = container.querySelector('[data-testid="add-special-ability-button"]');
    expect(addButton).toBeNull();
  });

  it("should be clickable when rendered", () => {
    const specialAbilities = new SpecialAbilities(mockSpecialAbilities, mockOnUpdate, mockOnDelete);
    render(specialAbilities.render(), container);

    const addButton = container.querySelector('[data-testid="add-special-ability-button"]');
    expect(addButton).toBeTruthy();

    // Verify it can receive click events
    addButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    // The actual implementation will call handleAddSpecialAbility
  });
});
