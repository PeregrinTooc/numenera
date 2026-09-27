import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CharacterSheet } from "@/components/CharacterSheet";
import { createTestCharacter } from "../factories/character.js";

type TouchType = "touchstart" | "touchmove" | "touchend" | "touchcancel";

/** jsdom has TouchEvent but no Touch constructor, so `touches` is stubbed. */
function touch(
  target: Element,
  type: TouchType,
  points: { x: number; y: number }[] = [],
  options: { cancelable?: boolean } = {}
): TouchEvent {
  const event = new TouchEvent(type, {
    bubbles: true,
    cancelable: options.cancelable ?? true,
  });
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

function sectionOrder(): string[] {
  return Array.from(document.querySelectorAll("[data-section-id]")).map(
    (el) => el.getAttribute("data-section-id") ?? ""
  );
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

  it("moves a long-pressed section before the section it is released over", () => {
    const cyphers = section("cyphers");
    vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("abilities"));

    touch(cyphers, "touchstart", [{ x: 20, y: 500 }]);
    vi.advanceTimersByTime(250);
    touch(cyphers, "touchmove", [{ x: 20, y: 120 }]);
    expect(section("abilities").classList.contains("drop-target")).toBe(true);
    touch(cyphers, "touchend");

    const order = sectionOrder();
    expect(order.indexOf("cyphers")).toBeLessThan(order.indexOf("abilities"));
    expect(section("cyphers").classList.contains("dragging")).toBe(false);
  });

  it("releasing over no other section does not reorder (Review Focus 3)", () => {
    const before = sectionOrder();
    const cyphers = section("cyphers");
    vi.spyOn(document, "elementFromPoint").mockReturnValue(document.body);

    touch(cyphers, "touchstart", [{ x: 20, y: 500 }]);
    vi.advanceTimersByTime(250);
    touch(cyphers, "touchmove", [{ x: 20, y: 5 }]);
    touch(cyphers, "touchend");

    expect(sectionOrder()).toEqual(before);
    expect(section("cyphers").classList.contains("dragging")).toBe(false);
  });

  it("a second finger cancels the touch drag (Review Focus 1)", () => {
    const before = sectionOrder();
    const cyphers = section("cyphers");
    vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("abilities"));

    touch(cyphers, "touchstart", [{ x: 20, y: 500 }]);
    vi.advanceTimersByTime(250);
    touch(cyphers, "touchstart", [
      { x: 20, y: 500 },
      { x: 200, y: 500 },
    ]);
    // Keep both fingers down past the hold time: a restarted gesture would re-activate.
    vi.advanceTimersByTime(250);

    expect(section("cyphers").classList.contains("dragging")).toBe(false);
    touch(cyphers, "touchend");
    expect(sectionOrder()).toEqual(before);
  });

  it("exiting edit mode cancels an active touch drag (Review Focus 2)", () => {
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
    vi.advanceTimersByTime(250);

    sheet.toggleLayoutEditMode();
    sheet.toggleLayoutEditMode();

    expect(section("cyphers").classList.contains("dragging")).toBe(false);
  });

  it("native dragstart is blocked during a touch drag (Review Focus 4)", () => {
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
    vi.advanceTimersByTime(250);

    const dragStart = new Event("dragstart", { bubbles: true, cancelable: true });
    section("cyphers").dispatchEvent(dragStart);

    expect(dragStart.defaultPrevented).toBe(true);
  });

  it("contextmenu is blocked during a touch drag (Review Focus 4)", () => {
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
    vi.advanceTimersByTime(250);

    const contextMenu = new Event("contextmenu", { bubbles: true, cancelable: true });
    section("cyphers").dispatchEvent(contextMenu);

    expect(contextMenu.defaultPrevented).toBe(true);
  });

  it("contextmenu is left alone when no touch drag is active", () => {
    const contextMenu = new Event("contextmenu", { bubbles: true, cancelable: true });
    section("cyphers").dispatchEvent(contextMenu);

    expect(contextMenu.defaultPrevented).toBe(false);
  });

  it("touchcancel aborts an active touch drag without reordering", () => {
    const before = sectionOrder();
    const cyphers = section("cyphers");
    vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("abilities"));

    touch(cyphers, "touchstart", [{ x: 20, y: 500 }]);
    vi.advanceTimersByTime(250);
    touch(cyphers, "touchmove", [{ x: 20, y: 120 }]);
    touch(cyphers, "touchcancel");

    expect(sectionOrder()).toEqual(before);
    expect(section("cyphers").classList.contains("dragging")).toBe(false);
  });

  it("a touchmove that the browser can't prevent cancels the drag (already scrolling)", () => {
    const before = sectionOrder();
    const cyphers = section("cyphers");
    vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("abilities"));

    touch(cyphers, "touchstart", [{ x: 20, y: 500 }]);
    vi.advanceTimersByTime(250);
    touch(cyphers, "touchmove", [{ x: 20, y: 120 }], { cancelable: false });
    touch(cyphers, "touchend");

    expect(sectionOrder()).toEqual(before);
    expect(section("cyphers").classList.contains("dragging")).toBe(false);
  });

  it("a second touch point arriving mid-drag cancels it (pinch)", () => {
    const before = sectionOrder();
    const cyphers = section("cyphers");
    vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("abilities"));

    touch(cyphers, "touchstart", [{ x: 20, y: 500 }]);
    vi.advanceTimersByTime(250);
    touch(cyphers, "touchmove", [
      { x: 20, y: 120 },
      { x: 200, y: 120 },
    ]);
    touch(cyphers, "touchend");

    expect(sectionOrder()).toEqual(before);
    expect(section("cyphers").classList.contains("dragging")).toBe(false);
  });

  it("blocks a card's dragstart from reaching it during an active touch drag", () => {
    const withAbilities = new CharacterSheet(
      createTestCharacter({
        abilities: [{ name: "Trained in Defense", description: "Reduces difficulty by 1" }],
      }),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn()
    );
    withAbilities.mount(document.getElementById("app") as HTMLElement);
    withAbilities.toggleLayoutEditMode();

    touch(section("abilities"), "touchstart", [{ x: 20, y: 500 }]);
    vi.advanceTimersByTime(250);

    const card = document.querySelector<HTMLElement>("[data-testid^='ability-item']");
    if (!card) throw new Error("No ability card rendered");
    const dragStart = new Event("dragstart", { bubbles: true, cancelable: true });
    card.dispatchEvent(dragStart);

    expect(dragStart.defaultPrevented).toBe(true);
    expect(card.getAttribute("data-dragging")).not.toBe("true");
  });
});

describe("CharacterSheet touch listener passivity outside edit mode", () => {
  let sheet: CharacterSheet;
  let addSpy: ReturnType<typeof vi.spyOn>;
  let removeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    document.elementFromPoint = (): Element | null => null;
    document.body.innerHTML = '<div id="app"></div>';
    addSpy = vi.spyOn(EventTarget.prototype, "addEventListener");
    removeSpy = vi.spyOn(EventTarget.prototype, "removeEventListener");
    const container = document.getElementById("app") as HTMLElement;
    sheet = new CharacterSheet(createTestCharacter(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn());
    sheet.mount(container);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function touchmoveCalls(spy: ReturnType<typeof vi.spyOn>): unknown[][] {
    return spy.mock.calls.filter(([type]) => type === "touchmove");
  }

  it("does not register a touchmove listener on section wrappers outside edit mode", () => {
    expect(touchmoveCalls(addSpy)).toHaveLength(0);
  });

  it("registers a non-passive touchmove listener once edit mode is entered", () => {
    addSpy.mockClear();

    sheet.toggleLayoutEditMode();

    const calls = touchmoveCalls(addSpy);
    expect(calls.length).toBeGreaterThan(0);
    for (const [, , options] of calls) {
      expect((options as AddEventListenerOptions).passive).toBe(false);
    }
  });

  it("removes the touchmove listener when edit mode is exited", () => {
    sheet.toggleLayoutEditMode();
    removeSpy.mockClear();

    sheet.toggleLayoutEditMode();

    expect(touchmoveCalls(removeSpy).length).toBeGreaterThan(0);
  });
});
