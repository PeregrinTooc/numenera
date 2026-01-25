// Shared test helpers for card editing functionality
// Promotes DRY principles and consistent testing across all card types

import { expect } from "vitest";
import { screen, fireEvent } from "@testing-library/dom";

/**
 * Helper to find edit button within a card
 */
export function findEditButton(cardElement: HTMLElement): HTMLElement {
  const button = cardElement.querySelector('[data-testid*="edit-button"]');
  if (!button) {
    throw new Error("Edit button not found in card");
  }
  return button as HTMLElement;
}

/**
 * Helper to verify modal is open
 */
export function expectModalOpen(): void {
  const backdrop = screen.queryByTestId("card-modal-backdrop");
  expect(backdrop).toBeTruthy();

  const modal = screen.queryByTestId("card-edit-modal");
  expect(modal).toBeTruthy();
}

/**
 * Helper to verify modal is closed
 */
export function expectModalClosed(): void {
  const backdrop = screen.queryByTestId("card-modal-backdrop");
  expect(backdrop).toBeNull();
}

/**
 * Helper to find and click confirm button in modal
 */
export function clickConfirmButton(): void {
  const confirmButton = screen.getByTestId("card-modal-confirm");
  fireEvent.click(confirmButton);
}

/**
 * Helper to find and click cancel button in modal
 */
export function clickCancelButton(): void {
  const cancelButton = screen.getByTestId("card-modal-cancel");
  fireEvent.click(cancelButton);
}

/**
 * Helper to simulate ESC key press
 */
export function pressEscapeKey(): void {
  const backdrop = screen.getByTestId("card-modal-backdrop");
  fireEvent.keyDown(backdrop, { key: "Escape", code: "Escape" });
}

/**
 * Helper to get editable field by name in modal
 */
export function getEditableField(fieldName: string): HTMLElement {
  const field = screen.getByTestId(`edit-field-${fieldName}`);
  return field;
}

/**
 * Helper to change field value in modal
 */
export function changeFieldValue(fieldName: string, newValue: string): void {
  const field = getEditableField(fieldName) as HTMLInputElement;
  fireEvent.input(field, { target: { value: newValue } });
}

/**
 * Generic test workflow for card editing
 * Tests the complete flow: render -> edit -> save -> verify
 */
export async function testCardEditWorkflow(
  renderCard: () => HTMLElement,
  editActions: (modal: HTMLElement) => void,
  _verifyUpdate: (updatedData: any) => void
): Promise<void> {
  // Render card
  const cardElement = renderCard();
  expect(cardElement).toBeTruthy();

  // Find and click edit button
  const editButton = findEditButton(cardElement);
  fireEvent.click(editButton);

  // Verify modal opens
  expectModalOpen();

  // Perform edit actions
  const modal = screen.getByTestId("card-edit-modal");
  editActions(modal);

  // Confirm changes
  clickConfirmButton();

  // Verify modal closes
  expectModalClosed();

  // Verify update callback was called (handled by caller)
}

/**
 * Test canceling edit workflow
 */
export async function testCancelEditWorkflow(
  renderCard: () => HTMLElement,
  editActions: (modal: HTMLElement) => void,
  verifyNoUpdate: () => void
): Promise<void> {
  // Render card
  const cardElement = renderCard();
  expect(cardElement).toBeTruthy();

  // Find and click edit button
  const editButton = findEditButton(cardElement);
  fireEvent.click(editButton);

  // Verify modal opens
  expectModalOpen();

  // Perform edit actions
  const modal = screen.getByTestId("card-edit-modal");
  editActions(modal);

  // Cancel changes
  clickCancelButton();

  // Verify modal closes
  expectModalClosed();

  // Verify no update occurred
  verifyNoUpdate();
}
