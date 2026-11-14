import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CharacterSheet } from "@/components/CharacterSheet";
import { createTestCharacter } from "../factories/character.js";
import { mountSheet } from "./helpers/sectionDragFixture";
import { ManualClock } from "@/services/manualClock";

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

let clock: ManualClock;

describe("CharacterSheet touch long-press drag", () => {
  let sheet: CharacterSheet;

  beforeEach(() => {
    clock = new ManualClock();
    localStorage.clear();
    // jsdom does not implement elementFromPoint; tests spy on this stub.
    document.elementFromPoint = (): Element | null => null;
    document.body.innerHTML = '<div id="app"></div>';
    const container = document.getElementById("app") as HTMLElement;
    sheet = new CharacterSheet(
      createTestCharacter(),
      clock,
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn()
    );
    sheet.mount(container);
    sheet.toggleLayoutEditMode();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("marks a section as dragging after a 250ms long-press", () => {
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
    clock.advance(250);

    expect(section("cyphers").classList.contains("dragging")).toBe(true);
  });

  it("a touch that moves before the hold elapses never activates and is not prevented", () => {
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
    const move = touch(section("cyphers"), "touchmove", [{ x: 20, y: 450 }]);
    clock.advance(250);

    expect(move.defaultPrevented).toBe(false);
    expect(section("cyphers").classList.contains("dragging")).toBe(false);
  });

  it("prevents the page from scrolling once the long-press is active", () => {
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
    clock.advance(250);
    vi.spyOn(document, "elementFromPoint").mockReturnValue(null);
    const move = touch(section("cyphers"), "touchmove", [{ x: 20, y: 450 }]);

    expect(move.defaultPrevented).toBe(true);
  });

  it("does nothing on long-press when layout edit mode is off", () => {
    sheet.toggleLayoutEditMode();

    touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
    clock.advance(250);

    expect(section("cyphers").classList.contains("dragging")).toBe(false);
  });

  it("moves a long-pressed section before the section it is released over", () => {
    const cyphers = section("cyphers");
    vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("abilities"));
    // jsdom lays nothing out; y = 120 must fall in the top zone of Abilities.
    vi.spyOn(section("abilities"), "getBoundingClientRect").mockReturnValue(
      new globalThis.DOMRect(0, 100, 800, 400)
    );

    touch(cyphers, "touchstart", [{ x: 20, y: 500 }]);
    clock.advance(250);
    touch(cyphers, "touchmove", [{ x: 20, y: 120 }]);
    expect(section("abilities").classList.contains("drop-line-before")).toBe(true);
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
    clock.advance(250);
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
    clock.advance(250);
    touch(cyphers, "touchstart", [
      { x: 20, y: 500 },
      { x: 200, y: 500 },
    ]);
    // Keep both fingers down past the hold time: a restarted gesture would re-activate.
    clock.advance(250);

    expect(section("cyphers").classList.contains("dragging")).toBe(false);
    touch(cyphers, "touchend");
    expect(sectionOrder()).toEqual(before);
  });

  it("exiting edit mode cancels an active touch drag (Review Focus 2)", () => {
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
    clock.advance(250);

    sheet.toggleLayoutEditMode();
    sheet.toggleLayoutEditMode();

    expect(section("cyphers").classList.contains("dragging")).toBe(false);
  });

  it("native dragstart is blocked during a touch drag (Review Focus 4)", () => {
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
    clock.advance(250);

    const dragStart = new Event("dragstart", { bubbles: true, cancelable: true });
    section("cyphers").dispatchEvent(dragStart);

    expect(dragStart.defaultPrevented).toBe(true);
  });

  it("contextmenu is blocked during a touch drag (Review Focus 4)", () => {
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
    clock.advance(250);

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
    clock.advance(250);
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
    clock.advance(250);
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
    clock.advance(250);
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
      clock,
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn()
    );
    withAbilities.mount(document.getElementById("app") as HTMLElement);
    withAbilities.toggleLayoutEditMode();

    touch(section("abilities"), "touchstart", [{ x: 20, y: 500 }]);
    clock.advance(250);

    const card = document.querySelector<HTMLElement>("[data-testid^='ability-item']");
    if (!card) throw new Error("No ability card rendered");
    const dragStart = new Event("dragstart", { bubbles: true, cancelable: true });
    card.dispatchEvent(dragStart);

    expect(dragStart.defaultPrevented).toBe(true);
    expect(card.getAttribute("data-dragging")).not.toBe("true");
  });
});

describe("CharacterSheet touch drag edge auto-scroll", () => {
  /** Total vertical scroll requested so far. */
  let scrolledY = 0;

  beforeEach(() => {
    vi.useFakeTimers(); // EdgeAutoScroll steps on animation frames
    clock = new ManualClock();
    localStorage.clear();
    document.elementFromPoint = (): Element | null => null;
    mountSheet(createTestCharacter(), clock);
    // jsdom does not scroll; record what the drag asks the window to scroll.
    scrolledY = 0;
    vi.spyOn(window, "scrollBy").mockImplementation(((_x: number, y: number) => {
      scrolledY += y;
    }) as typeof window.scrollBy);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /** The hold timers and the animation frames move on together, millisecond by millisecond. */
  function elapse(ms: number): void {
    for (let elapsed = 0; elapsed < ms; elapsed++) {
      clock.advance(1);
      vi.advanceTimersByTime(1);
    }
  }

  function dragTo(y: number): void {
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 400 }]);
    elapse(250);
    touch(section("cyphers"), "touchmove", [{ x: 20, y }]);
  }

  it("scrolls the page up while the drag is held at the top edge", () => {
    dragTo(5);
    elapse(500);

    expect(scrolledY).toBeLessThan(-100);
  });

  it("scrolls the page down while the drag is held at the bottom edge", () => {
    dragTo(window.innerHeight - 5);
    elapse(500);

    expect(scrolledY).toBeGreaterThan(100);
  });

  it("scrolls faster the closer the finger is to the edge", () => {
    dragTo(50);
    elapse(500);
    touch(section("cyphers"), "touchend");
    const nearZoneStart = scrolledY;
    scrolledY = 0;

    dragTo(5);
    elapse(500);

    expect(scrolledY).toBeLessThan(nearZoneStart * 2);
  });

  it("targets the section scrolled under the finger while it holds still", () => {
    // Stats comes under the finger once the page has scrolled up a little.
    vi.spyOn(document, "elementFromPoint").mockImplementation(() =>
      scrolledY < -50 ? section("stats") : null
    );
    vi.spyOn(section("stats"), "getBoundingClientRect").mockReturnValue(
      new globalThis.DOMRect(0, 0, 800, 400)
    );

    dragTo(5);
    elapse(200);

    expect(section("stats").classList.contains("drop-line-before")).toBe(true);
  });

  it("shows no live preview while the page is scrolling", () => {
    const before = sectionOrder();
    vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("stats"));
    vi.spyOn(section("stats"), "getBoundingClientRect").mockReturnValue(
      new globalThis.DOMRect(0, 0, 800, 400)
    );

    dragTo(5);
    elapse(1000);

    expect(sectionOrder()).toEqual(before);
    expect(section("stats").classList.contains("drop-line-before")).toBe(true);
  });

  it("stops scrolling when the drag is released", () => {
    dragTo(5);
    elapse(100);
    touch(section("cyphers"), "touchend");
    const atRelease = scrolledY;
    elapse(500);

    expect(scrolledY).toBe(atRelease);
  });

  it("stops scrolling when the finger moves away from the edge", () => {
    dragTo(5);
    elapse(100);
    touch(section("cyphers"), "touchmove", [{ x: 20, y: 300 }]);
    const atLeave = scrolledY;
    elapse(500);

    expect(scrolledY).toBe(atLeave);
  });
});

describe("CharacterSheet touch scrolling outside and inside edit mode", () => {
  let sheet: CharacterSheet;

  beforeEach(() => {
    clock = new ManualClock();
    localStorage.clear();
    document.elementFromPoint = (): Element | null => null;
    document.body.innerHTML = '<div id="app"></div>';
    const container = document.getElementById("app") as HTMLElement;
    sheet = new CharacterSheet(
      createTestCharacter(),
      clock,
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn()
    );
    sheet.mount(container);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function longPressThenMove(): TouchEvent {
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 500 }]);
    clock.advance(250);
    return touch(section("cyphers"), "touchmove", [{ x: 20, y: 450 }]);
  }

  it("leaves touchmove scrolling alone outside edit mode", () => {
    const move = longPressThenMove();

    expect(move.defaultPrevented).toBe(false);
    expect(section("cyphers").classList.contains("dragging")).toBe(false);
  });

  it("can prevent touchmove scrolling once edit mode is entered", () => {
    sheet.toggleLayoutEditMode();

    const move = longPressThenMove();

    expect(move.defaultPrevented).toBe(true);
  });

  it("leaves touchmove scrolling alone again when edit mode is exited", () => {
    sheet.toggleLayoutEditMode();
    sheet.toggleLayoutEditMode();

    const move = longPressThenMove();

    expect(move.defaultPrevented).toBe(false);
  });
});
