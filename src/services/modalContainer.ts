/**
 * Modal container lifecycle management
 */
export class ModalContainer {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement("div");
    document.body.appendChild(this.container);
  }

  /**
   * Gets the container element for rendering
   */
  getElement(): HTMLElement {
    return this.container;
  }

  /**
   * Removes the modal container from DOM
   */
  remove(): void {
    if (this.container.parentNode) {
      document.body.removeChild(this.container);
    }
  }

  /**
   * Focuses an element within the modal after render
   * @param selector - CSS selector for element to focus
   * @param select - Whether to select content (for inputs)
   */
  focusElement(selector: string, select = false): void {
    setTimeout(() => {
      const element = this.container.querySelector<HTMLElement>(selector);
      if (element) {
        element.focus();
        if (select && element instanceof HTMLInputElement) {
          element.select();
        }
      }
    }, 0);
  }
}
