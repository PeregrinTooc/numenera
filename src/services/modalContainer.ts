export class ModalContainer {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement("div");
    document.body.appendChild(this.container);
  }

  getElement(): HTMLElement {
    return this.container;
  }

  remove(): void {
    if (this.container.parentNode) {
      document.body.removeChild(this.container);
    }
  }

  focusElement(selector: string, select = false): void {
    const element = this.container.querySelector<HTMLElement>(selector);
    if (element) {
      element.focus();
      if (select && element instanceof HTMLInputElement) {
        element.select();
      }
    }
  }
}
