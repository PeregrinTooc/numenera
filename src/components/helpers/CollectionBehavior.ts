// CollectionBehavior - Reusable helpers for container components managing collections
// Eliminates duplication across Abilities, Attacks, Cyphers, Items, and SpecialAbilities

import { html, TemplateResult } from "lit-html";
import { Character } from "../../types/character.js";
import { saveCharacterState } from "../../storage/localStorage.js";

/**
 * Configuration for creating an add handler for a collection
 */
export interface AddHandlerConfig<T, ItemComponent> {
  /** Empty/default item to use for creation */
  emptyItem: T;
  /** Constructor for the item component class */
  ItemComponentClass: new (
    item: T,
    index: number,
    onUpdate?: (updated: T) => void,
    onDelete?: () => void
  ) => ItemComponent;
  /** Collection array to add to */
  collection: T[];
  /** Character reference (for event-based updates) */
  character?: Character;
  /** Callback-based update handler (alternative to character) */
  onUpdate?: (index: number, updated: T) => void;
}

/**
 * Creates a generic add handler for collection items
 * Handles the pattern: create temp item → create temp component → trigger edit → add to collection
 */
export function createAddHandler<T, ItemComponent extends { handleEdit: () => void }>(
  config: AddHandlerConfig<T, ItemComponent>
): () => void {
  return () => {
    const { emptyItem, ItemComponentClass, collection, character, onUpdate } = config;

    // Create temporary item component with onUpdate callback that adds to collection
    const tempItem = new ItemComponentClass(emptyItem, -1, (updated: T) => {
      // Add the new item to the collection
      collection.push(updated);

      if (character) {
        // Event-based update (CyphersBox, ItemsBox pattern)
        saveCharacterState(character);
        const event = new CustomEvent("character-updated");
        document.getElementById("app")?.dispatchEvent(event);
      } else if (onUpdate) {
        // Callback-based update (Abilities, Attacks, SpecialAbilities pattern)
        const newIndex = collection.length - 1;
        onUpdate(newIndex, updated);
      }
    });

    // Trigger edit on the temporary item
    tempItem.handleEdit();
  };
}

/**
 * Configuration for creating item instances with update/delete handlers
 */
export interface ItemInstancesConfig<T, ItemComponent> {
  /** Collection array to map */
  collection: T[];
  /** Constructor for the item component class */
  ItemComponentClass: new (
    item: T,
    index: number,
    onUpdate?: (updated: T) => void,
    onDelete?: () => void
  ) => ItemComponent;
  /** Character reference (for event-based updates) */
  character?: Character;
  /** Callback-based update handler (alternative to character) */
  onUpdate?: (index: number, updated: T) => void;
  /** Callback-based delete handler (alternative to character) */
  onDelete?: (index: number) => void;
}

/**
 * Creates item component instances with standardized update/delete handlers
 * Supports both event-based (character) and callback-based update patterns
 */
export function createItemInstances<T, ItemComponent extends { render: () => TemplateResult }>(
  config: ItemInstancesConfig<T, ItemComponent>
): ItemComponent[] {
  const { collection, ItemComponentClass, character, onUpdate, onDelete } = config;

  return collection.map((item, index) => {
    // Determine update handler based on pattern
    const updateHandler = character
      ? // Event-based update pattern (CyphersBox, ItemsBox)
        (updated: T) => {
          collection[index] = updated;
          saveCharacterState(character);
          const event = new CustomEvent("character-updated");
          document.getElementById("app")?.dispatchEvent(event);
        }
      : onUpdate
        ? // Callback-based update pattern (Abilities, Attacks, SpecialAbilities)
          (updated: T) => {
            onUpdate(index, updated);
          }
        : undefined;

    // Determine delete handler based on pattern
    const deleteHandler = character
      ? // Event-based delete pattern (CyphersBox, ItemsBox)
        () => {
          // Filter out the item at this index - need to update the original array reference
          const filtered = collection.filter((_, i) => i !== index);
          collection.length = 0;
          collection.push(...filtered);
          saveCharacterState(character);
          const event = new CustomEvent("character-updated");
          document.getElementById("app")?.dispatchEvent(event);
        }
      : onDelete
        ? // Callback-based delete pattern (Abilities, Attacks, SpecialAbilities)
          () => {
            onDelete(index);
          }
        : undefined;

    return new ItemComponentClass(item, index, updateHandler, deleteHandler);
  });
}

/**
 * Configuration for rendering an add button
 */
export interface AddButtonConfig {
  /** Click handler for the button */
  onClick: () => void;
  /** Test ID for the button */
  testId: string;
  /** Color theme (e.g., 'indigo', 'red', 'purple', 'teal', 'green') */
  colorTheme?: string;
  /** Accessible label for screen readers */
  ariaLabel: string;
}

/**
 * Renders a standardized add button with SVG icon
 * Provides consistent styling and behavior across all containers
 */
export function renderAddButton(config: AddButtonConfig): TemplateResult {
  const { onClick, testId, colorTheme = "indigo", ariaLabel } = config;

  return html`
    <button
      @click=${onClick}
      class="add-button p-2 bg-${colorTheme}-100 hover:bg-${colorTheme}-200 text-${colorTheme}-700 rounded-full transition-colors"
      data-testid="${testId}"
      aria-label="${ariaLabel}"
      title="${ariaLabel}"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  `;
}

/**
 * Configuration for rendering an empty state message
 */
export interface EmptyStateConfig {
  /** Test ID for the empty state container */
  testId: string;
  /** Message to display (typically from i18n) */
  message: string;
  /** Optional custom CSS class name */
  className?: string;
}

/**
 * Renders a standardized empty state message
 * Provides consistent styling across all containers
 */
export function renderEmptyState(config: EmptyStateConfig): TemplateResult {
  const { testId, message, className } = config;

  return html`
    <div data-testid="${testId}" class="${className || "empty-state"}">${message}</div>
  `;
}

/**
 * Helper for rendering a collection with conditional empty state
 * Simplifies the isEmpty ? empty : items pattern used in all containers
 */
export interface CollectionRenderConfig<ItemComponent extends { render: () => TemplateResult }> {
  /** Collection items */
  items: ItemComponent[];
  /** Empty state configuration (shown when items.length === 0) */
  emptyState: EmptyStateConfig;
  /** Optional container CSS classes for the items grid/list */
  containerClass?: string;
}

/**
 * Renders a collection with automatic empty state handling
 */
export function renderCollection<ItemComponent extends { render: () => TemplateResult }>(
  config: CollectionRenderConfig<ItemComponent>
): TemplateResult {
  const { items, emptyState, containerClass = "grid grid-cols-1 gap-4" } = config;

  if (items.length === 0) {
    return renderEmptyState(emptyState);
  }

  return html` <div class="${containerClass}">${items.map((item) => item.render())}</div> `;
}
