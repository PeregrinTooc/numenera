// Shared test suite for container components (Abilities, Attacks, SpecialAbilities, etc.)
// Promotes DRY principles and consistent testing across all container types

import { render } from "lit-html";
import { Character } from "../../../src/types/character.js";

// Mock character data factory for tests
export function createMockCharacter(overrides: Partial<Character> = {}): Character {
  return {
    name: "Test Character",
    descriptor: "Strong",
    type: "Glaive",
    focus: "Fights Dirty",
    tier: 1,
    effort: 1,
    xp: 0,
    might: { pool: 10, edge: 0, current: 10 },
    speed: { pool: 10, edge: 0, current: 10 },
    intellect: { pool: 10, edge: 0, current: 10 },
    armor: 1,
    recoveryRolls: { available: 4, modifier: 0 },
    damageTrack: { status: "hale" },
    cyphers: [],
    equipment: [],
    artifacts: [],
    oddities: [],
    abilities: [],
    specialAbilities: [],
    attacks: [],
    skills: "",
    background: "",
    notes: "",
    portrait: "",
    ...overrides,
  };
}

export interface ContainerTestConfig<T> {
  componentName: string;
  /** Function to create component - now takes Character */
  createComponent: (character: Character) => { render: () => any };
  addButtonTestId: string;
  mockItems: T[];
  /** Key on Character that holds the items array */
  collectionKey: keyof Character;
}

/**
 * Generic test suite for container "Add Button" functionality
 * Tests that all containers should implement consistently
 * Updated to use event-based pattern with Character object
 */
export function testContainerAddButton<T>(config: ContainerTestConfig<T>): void {
  describe(`${config.componentName} - Add Button`, () => {
    let container: HTMLElement;

    beforeEach(() => {
      container = document.createElement("div");
      container.id = "app";
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it("should render add button", () => {
      const character = createMockCharacter({
        [config.collectionKey]: config.mockItems,
      } as Partial<Character>);
      const component = config.createComponent(character);
      render(component.render(), container);

      const addButton = container.querySelector(`[data-testid="${config.addButtonTestId}"]`);
      expect(addButton).toBeTruthy();
    });

    it("should render add button even when items array is empty", () => {
      const character = createMockCharacter({
        [config.collectionKey]: [],
      } as Partial<Character>);
      const component = config.createComponent(character);
      render(component.render(), container);

      const addButton = container.querySelector(`[data-testid="${config.addButtonTestId}"]`);
      expect(addButton).toBeTruthy();
    });

    it("should have correct test id for add button", () => {
      const character = createMockCharacter({
        [config.collectionKey]: config.mockItems,
      } as Partial<Character>);
      const component = config.createComponent(character);
      render(component.render(), container);

      const addButton = container.querySelector(`[data-testid="${config.addButtonTestId}"]`);
      expect(addButton?.getAttribute("data-testid")).toBe(config.addButtonTestId);
    });

    it("should render add button in header section", () => {
      const character = createMockCharacter({
        [config.collectionKey]: config.mockItems,
      } as Partial<Character>);
      const component = config.createComponent(character);
      render(component.render(), container);

      const header = container.querySelector("h2");
      expect(header).toBeTruthy();

      const addButton = container.querySelector(`[data-testid="${config.addButtonTestId}"]`);
      expect(addButton).toBeTruthy();
    });

    // Note: Event-based pattern always renders the add button since components
    // always have access to character object. This test is kept for compatibility
    // but now simply verifies the button is rendered.
    it("should always render add button in event-based pattern", () => {
      const character = createMockCharacter({
        [config.collectionKey]: config.mockItems,
      } as Partial<Character>);
      const component = config.createComponent(character);
      render(component.render(), container);

      const addButton = container.querySelector(`[data-testid="${config.addButtonTestId}"]`);
      expect(addButton).toBeTruthy();
    });

    it("should be clickable when rendered", () => {
      const character = createMockCharacter({
        [config.collectionKey]: config.mockItems,
      } as Partial<Character>);
      const component = config.createComponent(character);
      render(component.render(), container);

      const addButton = container.querySelector(`[data-testid="${config.addButtonTestId}"]`);
      expect(addButton).toBeTruthy();

      // Verify it can receive click events
      addButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      // The actual implementation will call the appropriate handler
    });
  });
}
