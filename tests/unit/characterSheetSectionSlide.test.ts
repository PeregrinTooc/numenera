import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { CharacterSheet } from "@/components/CharacterSheet";
import { createTestCharacter } from "../factories/character.js";

type TouchType = "touchstart" | "touchmove" | "touchend" | "touchcancel";

/** jsdom has TouchEvent but no Touch constructor, so `touches` is stubbed. */
function touch(target: Element, type: TouchType, points: { x: number; y: number }[] = []): void {
  const event = new TouchEvent(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", {
    value: points.map((p) => ({ clientX: p.x, clientY: p.y })),
  });
  target.dispatchEvent(event);
}

function section(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-section-id="${id}"]`);
  if (!element) throw new Error(`No section ${id}`);
  return element;
}

function pairGrid(): Element | null {
  return document.querySelector('[data-testid="layout-grid-items-cyphers"]');
}

const ROW_HEIGHT = 200;

/**
 * jsdom lays nothing out: place every section the way a wide browser would,
 * from where it is in the DOM. Row n starts at n * ROW_HEIGHT; a single row is
 * 800 wide, a pair's halves 400 each.
 */
function layOutByRows(): void {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement
  ) {
    const rows = Array.from(
      document.querySelectorAll('[data-testid^="layout-grid-"], [data-section-id]')
    ).filter((el) => !el.parentElement?.closest('[data-testid^="layout-grid-"]'));
    const grid = this.parentElement?.closest('[data-testid^="layout-grid-"]');
    const top = rows.indexOf(grid ?? this) * ROW_HEIGHT;
    if (!grid) return new globalThis.DOMRect(0, top, 800, ROW_HEIGHT);
    const left = grid.firstElementChild === this ? 0 : 400;
    return new globalThis.DOMRect(left, top, 400, ROW_HEIGHT);
  });
}

/** A Web Animations stand-in whose `finished` the test settles. */
interface FakeAnimation {
  id: string;
  target: Element;
  finished: Promise<void>;
  finish: () => void;
  cancel: Mock;
}

function fakeAnimation(id: string, target: Element): FakeAnimation {
  let finish = (): void => {};
  let abort = (): void => {};
  const finished = new Promise<void>((resolve, reject) => {
    finish = resolve;
    // As in browsers: cancelling rejects `finished`
    abort = (): void => reject(new DOMException("The animation was cancelled", "AbortError"));
  });
  return { id, target, finished, finish, cancel: vi.fn(abort) };
}

/** Let promise callbacks (a slide's `finished` and what waits on it) run. */
async function flushPromises(): Promise<void> {
  for (let i = 0; i < 10; i++) await Promise.resolve();
}

/** Stub `matchMedia`: wide viewport, motion allowed unless `reducedMotion`. */
function stubMedia(reducedMotion: boolean): void {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query.includes("prefers-reduced-motion") ? reducedMotion : true,
        media: query,
      }) as MediaQueryList
  );
}

/** "translate(-400px, 0px)" → "translate(400px, 0px)" */
function negate(transform: string): string {
  return transform.replace(/(-?[\d.]+)px/g, (_, n: string) => `${-Number(n)}px`);
}

describe("CharacterSheet sections slide into a live preview", () => {
  let sheet: CharacterSheet;
  let animate: Mock;
  let animations: FakeAnimation[];

  /** Long-press Cyphers and hold it over the middle right of Items: a pair. */
  function holdCyphersOverItems(): void {
    vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("items"));
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 1020 }]);
    vi.advanceTimersByTime(250);
    const items = section("items").getBoundingClientRect();
    touch(section("cyphers"), "touchmove", [
      { x: items.left + 600, y: items.top + ROW_HEIGHT * 0.6 },
    ]);
  }

  /** The sections `animate` was called on, by id. */
  function slidSections(): string[] {
    return animate.mock.contexts.map((el) => (el as HTMLElement).dataset.sectionId ?? "");
  }

  /** The keyframes of every slide of Cyphers, oldest first. */
  function cyphersSlides(): { transform: string }[][] {
    return animate.mock.calls
      .filter((_, i) => (animate.mock.contexts[i] as HTMLElement).dataset.sectionId === "cyphers")
      .map(([keyframes]) => keyframes as { transform: string }[]);
  }

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    stubMedia(false);
    layOutByRows();
    animations = [];
    animate = vi.fn(function (this: Element, _keyframes: unknown, options: { id?: string }) {
      const animation = fakeAnimation(String(options.id), this);
      animations.push(animation);
      return animation;
    });
    HTMLElement.prototype.animate = animate as unknown as HTMLElement["animate"];
    HTMLElement.prototype.getAnimations = function (this: Element) {
      return animations.filter((a) => a.target === this) as unknown as ReturnType<
        HTMLElement["getAnimations"]
      >;
    };
    // jsdom does not implement elementFromPoint; tests spy on this stub.
    document.elementFromPoint = (): Element | null => null;
    document.body.innerHTML = '<div id="app"></div>';
    sheet = new CharacterSheet(createTestCharacter(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn());
    sheet.mount(document.getElementById("app") as HTMLElement);
    sheet.toggleLayoutEditMode();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete (HTMLElement.prototype as Partial<HTMLElement>).animate;
    delete (HTMLElement.prototype as Partial<HTMLElement>).getAnimations;
  });

  it("slides the moved sections when the live preview appears", () => {
    holdCyphersOverItems();
    vi.advanceTimersByTime(300);

    expect(pairGrid()).not.toBeNull();
    // Cyphers and Items now share one row, so the rows below them move up too
    expect(slidSections().sort()).toEqual(["background", "cyphers", "items", "notes"]);
    expect(animate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ id: "section-slide", duration: 200, easing: "ease-in-out" })
    );
  });

  it("slides the sections back when a cancel restores the saved layout", () => {
    holdCyphersOverItems();
    vi.advanceTimersByTime(300);
    const there = cyphersSlides()[0];
    touch(section("cyphers"), "touchcancel");

    expect(pairGrid()).toBeNull();
    const back = cyphersSlides()[1];
    expect(back).toEqual([{ transform: negate(there[0].transform) }, { transform: "none" }]);
  });

  it("slides nothing when reduced motion is preferred", () => {
    stubMedia(true);
    holdCyphersOverItems();
    vi.advanceTimersByTime(300);

    expect(pairGrid()).not.toBeNull();
    expect(animate).not.toHaveBeenCalled();
  });

  it("a cancel during the slide cancels it before measuring", () => {
    // Over the top edge of Abilities: Cyphers moves up between single rows,
    // so lit reuses the row elements, still sliding, for the restored layout
    vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("abilities"));
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 1020 }]);
    vi.advanceTimersByTime(250);
    const abilities = section("abilities").getBoundingClientRect();
    touch(section("cyphers"), "touchmove", [{ x: 400, y: abilities.top + ROW_HEIGHT * 0.1 }]);
    vi.advanceTimersByTime(300);
    const sliding = [...animations];
    touch(section("cyphers"), "touchcancel");

    const stillShown = sliding.filter((a) => a.target.isConnected);
    expect(stillShown.length).toBeGreaterThan(0);
    stillShown.forEach((a) => expect(a.cancel).toHaveBeenCalled());
  });

  it("leaving layout edit mode during a live preview does not slide", () => {
    holdCyphersOverItems();
    vi.advanceTimersByTime(300);
    const slides = animate.mock.calls.length;
    sheet.toggleLayoutEditMode();

    expect(pairGrid()).toBeNull();
    expect(animate).toHaveBeenCalledTimes(slides);
  });

  function moveOverTopEdgeOfItems(x: number): void {
    const items = section("items").getBoundingClientRect();
    touch(section("cyphers"), "touchmove", [{ x, y: items.top + ROW_HEIGHT * 0.1 }]);
  }

  it("ignores hovers until the slide into the live preview has finished", async () => {
    holdCyphersOverItems();
    vi.advanceTimersByTime(300); // Cyphers paired with Items, still sliding
    moveOverTopEdgeOfItems(200);
    vi.advanceTimersByTime(300);
    expect(pairGrid()).not.toBeNull();

    animations.forEach((a) => a.finish());
    await flushPromises();
    moveOverTopEdgeOfItems(201);
    vi.advanceTimersByTime(300);
    expect(pairGrid()).toBeNull();
  });

  it("does not ignore hovers when nothing slides", () => {
    stubMedia(true);
    holdCyphersOverItems();
    vi.advanceTimersByTime(300);
    moveOverTopEdgeOfItems(200);
    vi.advanceTimersByTime(300);

    expect(pairGrid()).toBeNull();
  });

  it("a slide from an ended drag does not lift the gate of the next one", async () => {
    holdCyphersOverItems();
    vi.advanceTimersByTime(300);
    const firstSlide = [...animations];
    touch(section("cyphers"), "touchcancel"); // its slide still running

    holdCyphersOverItems();
    vi.advanceTimersByTime(300);
    expect(pairGrid()).not.toBeNull();
    firstSlide.forEach((a) => a.finish());
    await flushPromises();
    moveOverTopEdgeOfItems(200);
    vi.advanceTimersByTime(300);

    expect(pairGrid()).not.toBeNull();
  });

  it("leaving layout edit mode stops the slide into the live preview", () => {
    // Cyphers above Abilities: single rows reorder, so lit keeps the row
    // elements, still sliding, for the sheet outside edit mode
    vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("abilities"));
    touch(section("cyphers"), "touchstart", [{ x: 20, y: 1020 }]);
    vi.advanceTimersByTime(250);
    const abilities = section("abilities").getBoundingClientRect();
    touch(section("cyphers"), "touchmove", [{ x: 400, y: abilities.top + ROW_HEIGHT * 0.1 }]);
    vi.advanceTimersByTime(300);
    const sliding = [...animations];
    sheet.toggleLayoutEditMode();

    const stillShown = sliding.filter((a) => a.target.isConnected);
    expect(stillShown.length).toBeGreaterThan(0);
    stillShown.forEach((a) => expect(a.cancel).toHaveBeenCalled());
  });
});
