import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CharacterSheet } from "@/components/CharacterSheet";
import { createCharacterWithItems, createTestCharacter } from "../factories/character.js";
import type { Character } from "@/types/character";

type TouchType = "touchstart" | "touchmove" | "touchend";

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

function sectionOrder(): string[] {
  return Array.from(document.querySelectorAll("[data-section-id]")).map(
    (el) => el.getAttribute("data-section-id") ?? ""
  );
}

/** jsdom lays nothing out: give a section the box a browser would. */
function placeSection(id: string, left: number, top: number, width: number, height: number): void {
  vi.spyOn(section(id), "getBoundingClientRect").mockReturnValue(
    new globalThis.DOMRect(left, top, width, height)
  );
}

/** jsdom has no DragEvent; the controller only reads the pointer position. */
function mouseDrag(target: Element, type: "dragstart" | "dragover" | "drop", x = 0, y = 0): void {
  target.dispatchEvent(
    new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y })
  );
}

function mountSheet(character: Character): void {
  document.body.innerHTML = '<div id="app"></div>';
  const sheet = new CharacterSheet(character, vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn());
  sheet.mount(document.getElementById("app") as HTMLElement);
  sheet.toggleLayoutEditMode();
}

/** Long-press `sourceId`, then move the finger to (x, y) over `targetId`. */
function touchDragOver(sourceId: string, targetId: string, x: number, y: number): void {
  vi.spyOn(document, "elementFromPoint").mockImplementation(() => section(targetId));
  touch(section(sourceId), "touchstart", [{ x: 20, y: 500 }]);
  vi.advanceTimersByTime(250);
  touch(section(sourceId), "touchmove", [{ x, y }]);
}

describe("CharacterSheet section drop zones", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    // jsdom does not implement elementFromPoint; tests spy on this stub.
    document.elementFromPoint = (): Element | null => null;
    mountSheet(createTestCharacter());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("dropping on the bottom edge of a section moves the dragged section below it", () => {
    placeSection("items", 0, 1000, 800, 200);

    touchDragOver("abilities", "items", 400, 1180);
    touch(section("abilities"), "touchend");

    const order = sectionOrder();
    expect(order.indexOf("items")).toBeLessThan(order.indexOf("abilities"));
  });

  it("a mouse dragover on a card nested in a section uses the whole section's zones", () => {
    mountSheet(createCharacterWithItems());
    placeSection("abilities", 0, 1000, 800, 200);
    const card = section("abilities").querySelector('[data-testid="abilities-list"] > *');
    if (!card) throw new Error("No ability card");

    mouseDrag(section("cyphers"), "dragstart");
    mouseDrag(card, "dragover", 400, 1180);
    mouseDrag(card, "drop", 400, 1180);

    const order = sectionOrder();
    expect(order.indexOf("cyphers")).toBe(order.indexOf("abilities") + 1);
  });

  it("dragging a card inside a paired section reorders cards, not the section", () => {
    mountSheet(createCharacterWithItems());
    placeSection("attacks", 400, 1000, 400, 200);
    const cards = section("attacks").querySelectorAll('[draggable="true"]');
    if (cards.length < 2) throw new Error("Attacks needs two cards");

    // The card is the drag source: dragstart starts on it and bubbles out.
    mouseDrag(cards[0], "dragstart");
    mouseDrag(cards[1], "dragover", 600, 1180);
    mouseDrag(cards[1], "drop", 600, 1180);

    expect(
      document.querySelector('[data-testid="layout-grid-specialAbilities-attacks"]')
    ).not.toBeNull();
  });
});
