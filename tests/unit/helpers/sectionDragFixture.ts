import { vi } from "vitest";
import { CharacterSheet } from "@/components/CharacterSheet";
import type { Character } from "@/types/character";
import { SECTION_IDS } from "@/types/layout";

type TouchType = "touchstart" | "touchmove" | "touchend" | "touchcancel";

/** The element the current one-finger touch started on. */
let startedOn: Element | null = null;

/**
 * jsdom has TouchEvent but no Touch constructor, so `touches` is stubbed.
 * As in browsers, the rest of a touch goes to the element it started on,
 * whatever `target` is now: a re-render may have replaced that element.
 */
export function touch(
  target: Element,
  type: TouchType,
  points: { x: number; y: number }[] = []
): void {
  if (type === "touchstart" && points.length === 1) startedOn = target;
  const event = new TouchEvent(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", {
    value: points.map((p) => ({ clientX: p.x, clientY: p.y })),
  });
  (type === "touchstart" ? target : (startedOn ?? target)).dispatchEvent(event);
  if (type === "touchend" || type === "touchcancel") startedOn = null;
}

export function section(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-section-id="${id}"]`);
  if (!element) throw new Error(`No section ${id}`);
  return element;
}

export function sectionOrder(): string[] {
  return Array.from(document.querySelectorAll("[data-section-id]")).map(
    (el) => el.getAttribute("data-section-id") ?? ""
  );
}

/**
 * jsdom lays nothing out: give a section the box a browser would, on screen
 * (see showOnScreen).
 */
export function placeSection(
  id: string,
  left: number,
  top: number,
  width: number,
  height: number
): void {
  vi.spyOn(section(id), "getBoundingClientRect").mockReturnValue(
    new globalThis.DOMRect(left, top, width, height)
  );
  showOnScreen(top + height);
}

/**
 * Make the viewport a row taller than `bottom` if it is not already, so a box
 * reaching down to `bottom` is on screen and clear of the bottom edge zone,
 * where a held touch drag scrolls the page.
 */
function showOnScreen(bottom: number): void {
  const height = bottom + ROW_HEIGHT;
  if (window.innerHeight < height) {
    vi.spyOn(window, "innerHeight", "get").mockReturnValue(height);
  }
}

export const ROW_HEIGHT = 200;

/**
 * jsdom lays nothing out: place every section the way a wide browser would,
 * from where it is in the DOM. Row n starts at n * ROW_HEIGHT; a single row is
 * 800 wide, a pair's halves 400 each. Boxes are on screen, so they move
 * against `window.scrollBy`, which jsdom does not implement either.
 */
export function layOutByRows(): void {
  showOnScreen(SECTION_IDS.length * ROW_HEIGHT);
  let scrollTop = 0;
  vi.spyOn(window, "scrollBy").mockImplementation(((_x: number, y: number) => {
    scrollTop += y;
  }) as typeof window.scrollBy);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement
  ) {
    const rows = Array.from(
      document.querySelectorAll('[data-testid^="layout-grid-"], [data-section-id]')
    ).filter((el) => !el.parentElement?.closest('[data-testid^="layout-grid-"]'));
    const grid = this.parentElement?.closest('[data-testid^="layout-grid-"]');
    const top = rows.indexOf(grid ?? this) * ROW_HEIGHT - scrollTop;
    if (!grid) return new globalThis.DOMRect(0, top, 800, ROW_HEIGHT);
    const left = grid.firstElementChild === this ? 0 : 400;
    return new globalThis.DOMRect(left, top, 400, ROW_HEIGHT);
  });
}

/** jsdom has no DragEvent; the controller only reads the pointer position. */
export function mouseDrag(
  target: Element,
  type: "dragstart" | "dragover" | "drop",
  x = 0,
  y = 0
): void {
  target.dispatchEvent(
    new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y })
  );
}

export function mountSheet(character: Character): CharacterSheet {
  document.body.innerHTML = '<div id="app"></div>';
  const sheet = new CharacterSheet(character, vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn());
  sheet.mount(document.getElementById("app") as HTMLElement);
  sheet.toggleLayoutEditMode();
  return sheet;
}

/** Long-press `sourceId`, then move the finger to (x, y) over `targetId`. */
export function touchDragOver(sourceId: string, targetId: string, x: number, y: number): void {
  vi.spyOn(document, "elementFromPoint").mockImplementation(() => section(targetId));
  touch(section(sourceId), "touchstart", [{ x: 20, y: 500 }]);
  vi.advanceTimersByTime(250);
  touch(section(sourceId), "touchmove", [{ x, y }]);
}
