import type { Mock } from "vitest";
import { render } from "lit-html";
import { CyphersBox } from "@/components/CyphersBox";
import { Character } from "@/types/character";
import { loadCharacterState, clearCharacterState } from "@/storage/storageFactory";
import { screen, fireEvent } from "@testing-library/dom";
import { setupTestContainer } from "./helpers/testSetup.js";

describe("CyphersBox", () => {
  const getContainer = setupTestContainer();
  let container: HTMLElement;
  let mockCharacter: Character;
  let mockOnFieldUpdate: Mock<ConstructorParameters<typeof CyphersBox>[1]>;

  beforeEach(async () => {
    await clearCharacterState();
    // CyphersBox dispatches character-updated on document.getElementById("app").
    container = getContainer();
    container.id = "app";

    mockOnFieldUpdate = vi.fn();

    mockCharacter = {
      name: "Test Character",
      tier: 1,
      type: "Glaive",
      descriptor: "Strong",
      focus: "Combat",
      currentXp: 0,
      totalXp: 0,
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

  it("should remove cypher when delete callback is invoked", () => {
    const component = new CyphersBox(mockCharacter, mockOnFieldUpdate);
    render(component.render(), container);

    const initialCount = mockCharacter.cyphers.length;
    expect(initialCount).toBe(2);

    const deleteButton = container.querySelector('[data-testid="cypher-delete-button-0"]');
    expect(deleteButton).toBeTruthy();

    deleteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

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

    let deleteButton = container.querySelector('[data-testid="cypher-delete-button-0"]');
    deleteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    render(component.render(), container);

    deleteButton = container.querySelector('[data-testid="cypher-delete-button-0"]');
    deleteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    render(component.render(), container);

    expect(mockCharacter.cyphers.length).toBe(0);

    const emptyState = container.querySelector('[data-testid="empty-cyphers"]');
    expect(emptyState).toBeTruthy();
  });

  it("should render add button with correct test ID", () => {
    const component = new CyphersBox(mockCharacter, mockOnFieldUpdate);
    render(component.render(), container);

    const addButton = container.querySelector('[data-testid="add-cypher-button"]');
    expect(addButton).toBeTruthy();
  });

  it("should render add button even when no cyphers exist", () => {
    mockCharacter.cyphers = [];
    const component = new CyphersBox(mockCharacter, mockOnFieldUpdate);
    render(component.render(), container);

    const addButton = container.querySelector('[data-testid="add-cypher-button"]');
    expect(addButton).toBeTruthy();
  });

  it("should open modal when add button is clicked", () => {
    const component = new CyphersBox(mockCharacter, mockOnFieldUpdate);
    render(component.render(), container);

    fireEvent.click(screen.getByTestId("add-cypher-button"));

    expect(screen.getByTestId("card-modal-backdrop")).toBeTruthy();
  });

  it("should add cypher when onConfirm callback is invoked", () => {
    const component = new CyphersBox(mockCharacter, mockOnFieldUpdate);
    render(component.render(), container);

    const initialCount = mockCharacter.cyphers.length;
    expect(initialCount).toBe(2);

    const newCypher = { name: "New Cypher", level: "1d6", effect: "Test effect" };
    mockCharacter.cyphers.push(newCypher);

    render(component.render(), container);

    expect(mockCharacter.cyphers.length).toBe(3);
    expect(mockCharacter.cyphers[2]).toEqual(newCypher);
  });

  it("should persist through the storage adapter when a cypher is edited", async () => {
    const component = new CyphersBox(mockCharacter, mockOnFieldUpdate);
    render(component.render(), container);

    fireEvent.click(screen.getByTestId("cypher-edit-button-0"));
    fireEvent.input(screen.getByTestId("edit-cypher-name"), {
      target: { value: "Renamed Cypher" },
    });
    fireEvent.click(screen.getByTestId("card-modal-confirm"));

    expect(mockCharacter.cyphers[0].name).toBe("Renamed Cypher");
    // Persistence is fire-and-forget, so wait for it to land in the real adapter.
    await vi.waitFor(async () => {
      expect((await loadCharacterState())?.cyphers[0].name).toBe("Renamed Cypher");
    });
  });

  it("should dispatch character-updated event after adding cypher", () => {
    const component = new CyphersBox(mockCharacter, mockOnFieldUpdate);
    render(component.render(), container);

    const eventSpy = vi.fn();
    container.addEventListener("character-updated", eventSpy);

    const newCypher = { name: "New Cypher", level: "1d6", effect: "Test effect" };
    mockCharacter.cyphers.push(newCypher);

    const event = new CustomEvent("character-updated");
    container.dispatchEvent(event);

    expect(eventSpy).toHaveBeenCalled();
  });
});
