// Unit tests for CyphersBox component
/* global describe, it, expect, beforeEach, afterEach, vi, MouseEvent */

import { render } from "lit-html";
import { CyphersBox } from "../../src/components/CyphersBox.js";
import { Character } from "../../src/types/character.js";

vi.mock("../../src/storage/localStorage.js");

describe("CyphersBox", () => {
  let container: HTMLElement;
  let mockCharacter: Character;
  let mockOnFieldUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "app";
    document.body.appendChild(container);

    mockOnFieldUpdate = vi.fn();

    mockCharacter = {
      name: "Test Character",
      tier: 1,
      type: "Glaive",
      descriptor: "Strong",
      focus: "Combat",
      xp: 0,
      shins: 10,
      armor: 1,
      effort: 1,
      maxCyphers: 2,
      stats: {
        might: { pool: 10, edge: 0, current: 10 },
        speed: { pool: 10, edge: 0, current: 10 },
        intellect: { pool: 10, edge: 0, current: 10 },
      },
      cyphers: [
        { name: "Cypher 1", level: "3", effect: "Effect 1" },
        { name: "Cypher 2", level: "5", effect: "Effect 2" },
      ],
      artifacts: [],
      oddities: [],
      abilities: [],
      equipment: [],
      attacks: [],
      specialAbilities: [],
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
      textFields: {
        background: "",
        notes: "",
      },
    };
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should remove cypher when delete callback is invoked", () => {
    const component = new CyphersBox(mockCharacter, mockOnFieldUpdate);
    render(component.render(), container);

    const initialCount = mockCharacter.cyphers.length;
    expect(initialCount).toBe(2);

    // Find and click delete button for first cypher
    const deleteButton = container.querySelector('[data-testid="cypher-delete-button-0"]');
    expect(deleteButton).toBeTruthy();

    deleteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    // Re-render to see the effect
    render(component.render(), container);

    expect(mockCharacter.cyphers.length).toBe(1);
    expect(mockCharacter.cyphers[0].name).toBe("Cypher 2");
  });

  it("should dispatch character-updated event after deletion", () => {
    const component = new CyphersBox(mockCharacter, mockOnFieldUpdate);
    render(component.render(), container);

    const eventSpy = vi.fn();
    container.addEventListener("character-updated", eventSpy);

    const deleteButton = container.querySelector('[data-testid="cypher-delete-button-0"]');
    deleteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(eventSpy).toHaveBeenCalled();
  });

  it("should handle deletion of first item", () => {
    const component = new CyphersBox(mockCharacter, mockOnFieldUpdate);
    render(component.render(), container);

    const deleteButton = container.querySelector('[data-testid="cypher-delete-button-0"]');
    deleteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockCharacter.cyphers.length).toBe(1);
    expect(mockCharacter.cyphers[0].name).toBe("Cypher 2");
  });

  it("should handle deletion of last item", () => {
    const component = new CyphersBox(mockCharacter, mockOnFieldUpdate);
    render(component.render(), container);

    const deleteButton = container.querySelector('[data-testid="cypher-delete-button-1"]');
    deleteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockCharacter.cyphers.length).toBe(1);
    expect(mockCharacter.cyphers[0].name).toBe("Cypher 1");
  });

  it("should handle deletion of all items", () => {
    const component = new CyphersBox(mockCharacter, mockOnFieldUpdate);
    render(component.render(), container);

    // Delete first cypher
    let deleteButton = container.querySelector('[data-testid="cypher-delete-button-0"]');
    deleteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    render(component.render(), container);

    // Delete second cypher (now at index 0)
    deleteButton = container.querySelector('[data-testid="cypher-delete-button-0"]');
    deleteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    render(component.render(), container);

    expect(mockCharacter.cyphers.length).toBe(0);

    // Should show empty state
    const emptyState = container.querySelector('[data-testid="empty-cyphers"]');
    expect(emptyState).toBeTruthy();
  });
});
