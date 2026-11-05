export class FocusTrappingBehavior {
  static handleTabKey(e: KeyboardEvent, modalSelector: string): void {
    const modalContent = document.querySelector(modalSelector);
    if (!modalContent) return;

    const focusableElements = modalContent.querySelectorAll(
      'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    );
    const focusableArray = Array.from(focusableElements) as HTMLElement[];

    if (focusableArray.length === 0) return;

    const firstElement = focusableArray[0];
    const lastElement = focusableArray[focusableArray.length - 1];
    const activeElement = document.activeElement as HTMLElement;
    const currentIndex = focusableArray.indexOf(activeElement);

    e.preventDefault();

    if (e.shiftKey) {
      if (currentIndex <= 0) {
        lastElement.focus();
      } else {
        focusableArray[currentIndex - 1].focus();
      }
    } else {
      if (currentIndex < 0 || currentIndex >= focusableArray.length - 1) {
        firstElement.focus();
      } else {
        focusableArray[currentIndex + 1].focus();
      }
    }
  }
}
