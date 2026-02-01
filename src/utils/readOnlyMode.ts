/**
 * ReadOnlyModeManager - Manages read-only mode for viewing old character versions
 * Disables all interactive elements to prevent editing while viewing history
 */

interface DisabledElementState {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | HTMLSelectElement;
  wasDisabled: boolean;
}

export class ReadOnlyModeManager {
  private enabled = false;
  private disabledElements: DisabledElementState[] = [];

  /**
   * Enable read-only mode - disable all interactive elements in container
   */
  enable(container: HTMLElement): void {
    // Clear any previous state
    this.disable();

    this.enabled = true;

    // Find all interactive elements
    const inputs = container.querySelectorAll<HTMLInputElement>("input");
    const textareas = container.querySelectorAll<HTMLTextAreaElement>("textarea");
    const buttons = container.querySelectorAll<HTMLButtonElement>("button");
    const selects = container.querySelectorAll<HTMLSelectElement>("select");

    // Disable each element and track its original state
    const allElements = [...inputs, ...textareas, ...buttons, ...selects];

    allElements.forEach((element) => {
      // Skip elements marked as exempt from read-only mode
      if (element.hasAttribute("data-read-only-exempt")) {
        return;
      }

      // Track original disabled state
      const wasDisabled = element.disabled;

      // Disable element and add visual indicator
      element.disabled = true;
      element.classList.add("read-only-disabled");

      // Store state for later restoration
      this.disabledElements.push({
        element,
        wasDisabled,
      });
    });
  }

  /**
   * Disable read-only mode - restore elements to their original state
   */
  disable(): void {
    if (!this.enabled) {
      return;
    }

    // Restore each element to its original state
    this.disabledElements.forEach(({ element, wasDisabled }) => {
      // Only re-enable if it wasn't originally disabled
      if (!wasDisabled) {
        element.disabled = false;
      }
      element.classList.remove("read-only-disabled");
    });

    // Clear state
    this.disabledElements = [];
    this.enabled = false;
  }

  /**
   * Check if read-only mode is currently enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
