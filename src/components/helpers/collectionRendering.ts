// collectionRendering - Shared render helpers (add button, empty state, collection list)
// for container components managing collections

import { html, TemplateResult } from "lit-html";
import type { CollectionDragReorder } from "./CollectionDragReorder.js";

/**
 * Color themes available for the add button.
 */
export type AddButtonColorTheme = "indigo" | "purple" | "red" | "green" | "teal";

/**
 * Complete, literal Tailwind class strings per color theme. Tailwind only
 * generates CSS for class names it finds as literal text during its
 * build-time scan - `` `bg-${colorTheme}-100` `` never produces generated
 * CSS no matter what colorTheme is at runtime, so every combination needed
 * has to appear here in full.
 */
const ADD_BUTTON_THEME_CLASSES: Record<AddButtonColorTheme, string> = {
  indigo: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700",
  purple: "bg-purple-100 hover:bg-purple-200 text-purple-700",
  red: "bg-red-100 hover:bg-red-200 text-red-700",
  green: "bg-green-100 hover:bg-green-200 text-green-700",
  teal: "bg-teal-100 hover:bg-teal-200 text-teal-700",
};

/**
 * Configuration for rendering an add button
 */
export interface AddButtonConfig {
  /** Click handler for the button */
  onClick: () => void;
  /** Test ID for the button */
  testId: string;
  /** Color theme */
  colorTheme?: AddButtonColorTheme;
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
      class="add-button p-2 ${ADD_BUTTON_THEME_CLASSES[colorTheme]} rounded-full transition-colors"
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
  /** CSS class name of the empty state container */
  className: string;
  /** Message to display (typically from i18n) */
  message: string;
  /** Wrap the message in a paragraph */
  paragraph?: boolean;
}

/**
 * Renders a standardized empty state message
 */
export function renderEmptyState(config: EmptyStateConfig): TemplateResult {
  const { testId, className, message, paragraph } = config;

  return html`
    <div data-testid="${testId}" class="${className}">
      ${paragraph ? html`<p>${message}</p>` : message}
    </div>
  `;
}

/**
 * Configuration for rendering a collection that is either empty or a draggable list
 */
export interface CollectionConfig {
  /** Whether the collection has no items */
  isEmpty: boolean;
  /** Shown instead of the list when the collection is empty */
  emptyState: EmptyStateConfig;
  /** Test ID of the list container */
  listTestId: string;
  /** CSS class name of the list container */
  listClassName: string;
  /** Drag-reorder behaviour wired to the list container */
  drag: CollectionDragReorder;
  /** The rendered items: a template array or a keyed `repeat` result (typed unknown by lit) */
  items: unknown;
}

/**
 * Renders the empty state, or the item list wired for drag-reorder.
 */
export function renderCollection(config: CollectionConfig): TemplateResult {
  const { isEmpty, emptyState, listTestId, listClassName, drag, items } = config;

  if (isEmpty) {
    return renderEmptyState(emptyState);
  }

  return html`
    <div
      data-testid="${listTestId}"
      class="${listClassName}"
      @dragstart=${(e: Event) => drag.handleDragStart(e)}
      @dragover=${(e: Event) => drag.handleDragOver(e)}
      @drop=${(e: Event) => drag.handleDrop(e)}
      @dragend=${() => drag.handleDragEnd()}
    >
      ${items}
    </div>
  `;
}
