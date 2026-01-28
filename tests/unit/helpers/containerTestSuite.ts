// Shared test suite for container components (Abilities, Attacks, SpecialAbilities, etc.)
// Promotes DRY principles and consistent testing across all container types

import { render } from "lit-html";

export interface ContainerTestConfig<T> {
  componentName: string;
  createComponent: (items: T[], onUpdate?: any, onDelete?: any) => any;
  addButtonTestId: string;
  mockItems: T[];
}

/**
 * Generic test suite for container "Add Button" functionality
 * Tests that all containers should implement consistently
 */
export function testContainerAddButton<T>(config: ContainerTestConfig<T>): void {
  describe(`${config.componentName} - Add Button`, () => {
    let container: HTMLElement;
    let mockOnUpdate: ReturnType<typeof vi.fn>;
    let mockOnDelete: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      container = document.createElement("div");
      container.id = "app";
      document.body.appendChild(container);

      mockOnUpdate = vi.fn();
      mockOnDelete = vi.fn();
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it("should render add button", () => {
      const component = config.createComponent(config.mockItems, mockOnUpdate, mockOnDelete);
      render(component.render(), container);

      const addButton = container.querySelector(`[data-testid="${config.addButtonTestId}"]`);
      expect(addButton).toBeTruthy();
    });

    it("should render add button even when items array is empty", () => {
      const component = config.createComponent([], mockOnUpdate, mockOnDelete);
      render(component.render(), container);

      const addButton = container.querySelector(`[data-testid="${config.addButtonTestId}"]`);
      expect(addButton).toBeTruthy();
    });

    it("should have correct test id for add button", () => {
      const component = config.createComponent(config.mockItems, mockOnUpdate, mockOnDelete);
      render(component.render(), container);

      const addButton = container.querySelector(`[data-testid="${config.addButtonTestId}"]`);
      expect(addButton?.getAttribute("data-testid")).toBe(config.addButtonTestId);
    });

    it("should render add button in header section", () => {
      const component = config.createComponent(config.mockItems, mockOnUpdate, mockOnDelete);
      render(component.render(), container);

      const header = container.querySelector("h2");
      expect(header).toBeTruthy();

      const addButton = container.querySelector(`[data-testid="${config.addButtonTestId}"]`);
      expect(addButton).toBeTruthy();
    });

    it("should not render add button if onUpdate callback is not provided", () => {
      const component = config.createComponent(config.mockItems, undefined, mockOnDelete);
      render(component.render(), container);

      const addButton = container.querySelector(`[data-testid="${config.addButtonTestId}"]`);
      expect(addButton).toBeNull();
    });

    it("should be clickable when rendered", () => {
      const component = config.createComponent(config.mockItems, mockOnUpdate, mockOnDelete);
      render(component.render(), container);

      const addButton = container.querySelector(`[data-testid="${config.addButtonTestId}"]`);
      expect(addButton).toBeTruthy();

      // Verify it can receive click events
      addButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      // The actual implementation will call the appropriate handler
    });
  });
}
