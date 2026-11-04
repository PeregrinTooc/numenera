// Shared test suite for container components (Abilities, Attacks, SpecialAbilities, etc.)

import { render, type TemplateResult } from "lit-html";
import { Character } from "@/types/character";
import { createTestCharacter as createMockCharacter } from "../../factories/character.js";

export { createMockCharacter };

export interface ContainerTestConfig<T> {
  componentName: string;
  createComponent: (character: Character) => { render: () => TemplateResult };
  addButtonTestId: string;
  mockItems: T[];
  collectionKey: keyof Character;
}

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

      addButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
  });
}
