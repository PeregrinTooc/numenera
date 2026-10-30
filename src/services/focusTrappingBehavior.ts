/**
 * Focus trapping behavior for modals
 * Keeps tab navigation within modal elements
 */
export class FocusTrappingBehavior {
  /**
   * Handles Tab key to trap focus within modal
   * @param e - Keyboard event
   * @param modalSelector - CSS selector for modal container
   */
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

    // Always trap Tab key when modal is open
    e.preventDefault();

    if (e.shiftKey) {
      // Shift+Tab: moving backwards
      if (currentIndex <= 0) {
        // At or before first element, wrap to last
        lastElement.focus();
      } else {
        // Move to previous element
        focusableArray[currentIndex - 1].focus();
      }
    } else {
      // Tab: moving forwards
      if (currentIndex < 0 || currentIndex >= focusableArray.length - 1) {
        // Not in list or at last element, wrap to first
        firstElement.focus();
      } else {
        // Move to next element
        focusableArray[currentIndex + 1].focus();
      }
    }
  }
}
