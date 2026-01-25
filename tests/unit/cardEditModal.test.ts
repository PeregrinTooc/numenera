// Unit tests for CardEditModal component
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/dom";
import { html } from "lit-html";
import { openCardEditModal } from "../../src/components/CardEditModal.js";

describe("CardEditModal", () => {
  let container: HTMLElement;
  let confirmSpy: () => void;
  let cancelSpy: () => void;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    confirmSpy = vi.fn();
    cancelSpy = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should render modal with provided content", () => {
    const testContent = html`<div data-testid="test-content">Test Card Content</div>`;

    openCardEditModal({
      content: testContent,
      onConfirm: confirmSpy,
      onCancel: cancelSpy,
    });

    expect(screen.getByTestId("card-modal-backdrop")).toBeTruthy();
    expect(screen.getByTestId("card-edit-modal")).toBeTruthy();
    expect(screen.getByTestId("test-content")).toBeTruthy();
    expect(screen.getByText("Test Card Content")).toBeTruthy();
  });

  it("should show confirm and cancel buttons", () => {
    const testContent = html`<div>Content</div>`;

    openCardEditModal({
      content: testContent,
      onConfirm: confirmSpy,
      onCancel: cancelSpy,
    });

    expect(screen.getByTestId("card-modal-confirm")).toBeTruthy();
    expect(screen.getByTestId("card-modal-cancel")).toBeTruthy();
  });

  it("should call onConfirm and close modal when confirm button is clicked", () => {
    const testContent = html`<div>Content</div>`;

    openCardEditModal({
      content: testContent,
      onConfirm: confirmSpy,
      onCancel: cancelSpy,
    });

    const confirmButton = screen.getByTestId("card-modal-confirm");
    fireEvent.click(confirmButton);

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("card-modal-backdrop")).toBeNull();
  });

  it("should call onCancel and close modal when cancel button is clicked", () => {
    const testContent = html`<div>Content</div>`;

    openCardEditModal({
      content: testContent,
      onConfirm: confirmSpy,
      onCancel: cancelSpy,
    });

    const cancelButton = screen.getByTestId("card-modal-cancel");
    fireEvent.click(cancelButton);

    expect(cancelSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("card-modal-backdrop")).toBeNull();
  });

  it("should close modal when backdrop is clicked", () => {
    const testContent = html`<div>Content</div>`;

    openCardEditModal({
      content: testContent,
      onConfirm: confirmSpy,
      onCancel: cancelSpy,
    });

    const backdrop = screen.getByTestId("card-modal-backdrop");
    fireEvent.click(backdrop);

    expect(cancelSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("card-modal-backdrop")).toBeNull();
  });

  it("should not close modal when modal content is clicked", () => {
    const testContent = html`<div>Content</div>`;

    openCardEditModal({
      content: testContent,
      onConfirm: confirmSpy,
      onCancel: cancelSpy,
    });

    const modal = screen.getByTestId("card-edit-modal");
    fireEvent.click(modal);

    expect(cancelSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId("card-modal-backdrop")).toBeTruthy();
  });

  it("should close modal when ESC key is pressed", () => {
    const testContent = html`<div>Content</div>`;

    openCardEditModal({
      content: testContent,
      onConfirm: confirmSpy,
      onCancel: cancelSpy,
    });

    const backdrop = screen.getByTestId("card-modal-backdrop");
    fireEvent.keyDown(backdrop, { key: "Escape", code: "Escape" });

    expect(cancelSpy).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("card-modal-backdrop")).toBeNull();
  });

  it("should allow multiple modals to be opened sequentially", () => {
    const content1 = html`<div data-testid="content-1">Content 1</div>`;
    const content2 = html`<div data-testid="content-2">Content 2</div>`;

    // Open first modal
    openCardEditModal({
      content: content1,
      onConfirm: confirmSpy,
      onCancel: cancelSpy,
    });

    expect(screen.getByTestId("content-1")).toBeTruthy();

    // Close first modal
    const cancelButton = screen.getByTestId("card-modal-cancel");
    fireEvent.click(cancelButton);

    expect(screen.queryByTestId("content-1")).toBeNull();

    // Open second modal
    openCardEditModal({
      content: content2,
      onConfirm: confirmSpy,
      onCancel: cancelSpy,
    });

    expect(screen.getByTestId("content-2")).toBeTruthy();
  });
});
