// collectionRendering - Shared render helpers (add button, empty state, collection list)
// for container components managing collections

import { html, TemplateResult } from "lit-html";

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
