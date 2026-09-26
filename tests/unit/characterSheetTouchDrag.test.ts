import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CharacterSheet } from "@/components/CharacterSheet";
import { createTestCharacter } from "../factories/character.js";

type TouchType = "touchstart" | "touchmove" | "touchend" | "touchcancel";

/** jsdom has TouchEvent but no Touch constructor, so `touches` is stubbed. */
function touch(
  target: Element,
  type: TouchType,
  points: { x: number; y: number }[] = []
): TouchEvent {
  const event = new TouchEvent(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", {
    value: points.map((p) => ({ clientX: p.x, clientY: p.y })),
  });
  target.dispatchEvent(event);
  return event;
}

function section(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-section-id="${id}"]`);
  if (!element) throw new Error(`No section ${id}`);
  return element;
}

describe("CharacterSheet touch long-press drag", () => {
  let sheet: CharacterSheet;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    // jsdom does not implement elementFromPoint; tests spy on this stub.
    document.elementFromPoint = (): Element | null => null;
    document.body.innerHTML = '<div id="app"></div>';
    const container = document.getElementById("app") as HTMLElement;
    sheet = new CharacterSheet(createTestCharacter(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn());
    sheet.mount(container);
    sheet.toggleLayoutEditMode();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("marks a section as dragging after a 250ms long-press", () => {
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
    vi.advanceTimersByTime(250);

    expect(section("cyphers").classList.contains("dragging")).toBe(true);
  });

  it("a touch that moves before the hold elapses never activates and is not prevented", () => {
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
    const move = touch(section("cyphers"), "touchmove", [{ x: 20, y: 450 }]);
    vi.advanceTimersByTime(250);

    expect(move.defaultPrevented).toBe(false);
    expect(section("cyphers").classList.contains("dragging")).toBe(false);
  });

  it("prevents the page from scrolling once the long-press is active", () => {
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
    vi.advanceTimersByTime(250);
    vi.spyOn(document, "elementFromPoint").mockReturnValue(null);
    const move = touch(section("cyphers"), "touchmove", [{ x: 20, y: 450 }]);

    expect(move.defaultPrevented).toBe(true);
  });

  it("does nothing on long-press when layout edit mode is off", () => {
    sheet.toggleLayoutEditMode();

    touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
    vi.advanceTimersByTime(250);

    expect(section("cyphers").classList.contains("dragging")).toBe(false);
  });
});
