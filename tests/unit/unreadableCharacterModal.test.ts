import { describe, it, expect, vi, beforeEach } from "vitest";
import { ModalService } from "@/services/modalService";

function open() {
  const handlers = { onDownload: vi.fn(), onDiscard: vi.fn(), onLater: vi.fn() };
  ModalService.openUnreadableCharacterModal(handlers);
  return handlers;
}

const byId = (id: string): HTMLElement =>
  document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;

describe("UnreadableCharacterModal", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("runs the matching handler and closes for each button", () => {
    for (const [id, key] of [
      ["unreadable-download-button", "onDownload"],
      ["unreadable-discard-button", "onDiscard"],
      ["unreadable-later-button", "onLater"],
    ] as const) {
      const handlers = open();
      byId(id).click();
      expect(handlers[key]).toHaveBeenCalledOnce();
      expect(byId("unreadable-modal")).toBeNull();
    }
  });

  it("treats Escape as ask-me-later", () => {
    const handlers = open();

    byId("unreadable-modal-backdrop").dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    );

    expect(handlers.onLater).toHaveBeenCalledOnce();
    expect(handlers.onDiscard).not.toHaveBeenCalled();
    expect(byId("unreadable-modal")).toBeNull();
  });

  it("treats a backdrop click as ask-me-later", () => {
    const handlers = open();

    byId("unreadable-modal-backdrop").click();

    expect(handlers.onLater).toHaveBeenCalledOnce();
  });
});
