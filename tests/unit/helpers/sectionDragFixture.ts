import { vi } from "vitest";
import { CharacterSheet } from "@/components/CharacterSheet";
import type { Character } from "@/types/character";

type TouchType = "touchstart" | "touchmove" | "touchend" | "touchcancel";

/** jsdom has TouchEvent but no Touch constructor, so `touches` is stubbed. */
export function touch(
  target: Element,
  type: TouchType,
  points: { x: number; y: number }[] = []
): void {
  const event = new TouchEvent(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", {
    value: points.map((p) => ({ clientX: p.x, clientY: p.y })),
  });
  target.dispatchEvent(event);
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

/** jsdom lays nothing out: give a section the box a browser would. */
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
