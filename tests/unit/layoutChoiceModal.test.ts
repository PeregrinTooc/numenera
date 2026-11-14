import { describe, it, expect, vi, beforeEach } from "vitest";
import { ModalService } from "@/services/modalService";

function open() {
  const handlers = { onKeep: vi.fn(), onUseImported: vi.fn() };
  ModalService.openLayoutChoiceModal(handlers);
  return handlers;
}

const byId = (id: string): HTMLElement =>
  document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;

describe("LayoutChoiceModal", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("runs the matching handler and closes for each button", () => {
    for (const [id, key] of [
      ["keep-current-layout", "onKeep"],
      ["use-imported-layout", "onUseImported"],
    ] as const) {
      const handlers = open();
      byId(id).click();
      expect(handlers[key]).toHaveBeenCalledOnce();
      expect(byId("layout-choice-modal")).toBeNull();
    }
  });

  it("keeps the current layout on Escape", () => {
    const handlers = open();

    byId("layout-choice-modal-backdrop").dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
    );

    expect(handlers.onKeep).toHaveBeenCalledOnce();
    expect(handlers.onUseImported).not.toHaveBeenCalled();
    expect(byId("layout-choice-modal")).toBeNull();
  });

  it("keeps the current layout on a backdrop click", () => {
    const handlers = open();

    byId("layout-choice-modal-backdrop").click();

    expect(handlers.onKeep).toHaveBeenCalledOnce();
  });

  it("focuses keeping the current layout as soon as it opens", () => {
    open();

    expect(document.activeElement).toBe(byId("keep-current-layout"));
  });
});
