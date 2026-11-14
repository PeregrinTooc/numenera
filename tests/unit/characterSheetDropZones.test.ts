import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createCharacterWithItems, createTestCharacter } from "../factories/character.js";
import { ManualClock } from "@/services/manualClock";
import {
  mouseDrag,
  mountSheet,
  placeSection,
  section,
  sectionOrder,
  touch,
  touchDragOver,
} from "./helpers/sectionDragFixture";

let clock: ManualClock;

describe("CharacterSheet section drop zones", () => {
  beforeEach(() => {
    clock = new ManualClock();
    localStorage.clear();
    // jsdom does not implement elementFromPoint; tests spy on this stub.
    document.elementFromPoint = (): Element | null => null;
    mountSheet(createTestCharacter(), clock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("dropping on the bottom edge of a section moves the dragged section below it", () => {
    placeSection("items", 0, 1000, 800, 200);

    touchDragOver(clock, "abilities", "items", 400, 1180);
    touch(section("abilities"), "touchend");

    const order = sectionOrder();
    expect(order.indexOf("items")).toBeLessThan(order.indexOf("abilities"));
  });

  it("re-evaluates the layout width on every hover, not once per drag (Review Focus 4)", () => {
    const original = window.matchMedia;
    let wide = true;
    window.matchMedia = (query: string): MediaQueryList =>
      ({ matches: wide, media: query }) as MediaQueryList;
    try {
      placeSection("items", 0, 1000, 800, 200);
      touchDragOver(clock, "cyphers", "items", 600, 1120); // middle right: would pair
      wide = false; // e.g. the window was narrowed mid-drag
      touch(section("cyphers"), "touchmove", [{ x: 600, y: 1121 }]);
      touch(section("cyphers"), "touchend");
    } finally {
      window.matchMedia = original;
    }

    expect(document.querySelector('[data-testid="layout-grid-items-cyphers"]')).toBeNull();
    const order = sectionOrder();
    expect(order.indexOf("cyphers")).toBe(order.indexOf("items") + 1);
  });

  it("a mouse dragover on a card nested in a section uses the whole section's zones", () => {
    mountSheet(createCharacterWithItems(), clock);
    placeSection("abilities", 0, 1000, 800, 200);
    const card = section("abilities").querySelector('[data-testid="abilities-list"] > *');
    if (!card) throw new Error("No ability card");

    mouseDrag(section("cyphers"), "dragstart");
    mouseDrag(card, "dragover", 400, 1180);
    mouseDrag(card, "drop", 400, 1180);

    const order = sectionOrder();
    expect(order.indexOf("cyphers")).toBe(order.indexOf("abilities") + 1);
  });

  it("a mouse drop over the gutter between sections keeps the last intent (Review Focus 1)", () => {
    placeSection("items", 0, 1000, 800, 200);
    const gutter = document.querySelector('[data-testid="layout-grid-background-notes"]');
    if (!gutter) throw new Error("No pair grid");

    mouseDrag(section("cyphers"), "dragstart");
    mouseDrag(section("items"), "dragover", 600, 1120); // middle right of Items
    mouseDrag(gutter, "dragover", 400, 1250); // between the pair's columns: no section
    mouseDrag(gutter, "drop", 400, 1250);

    expect(document.querySelector('[data-testid="layout-grid-items-cyphers"]')).not.toBeNull();
  });

  it("a touch release over the gutter between sections keeps the last intent (Review Focus 1)", () => {
    placeSection("items", 0, 1000, 800, 200);
    touchDragOver(clock, "cyphers", "items", 600, 1120); // middle right of Items
    vi.spyOn(document, "elementFromPoint").mockReturnValue(null); // a gutter: no section
    touch(section("cyphers"), "touchmove", [{ x: 600, y: 1210 }]);
    touch(section("cyphers"), "touchend");

    expect(document.querySelector('[data-testid="layout-grid-items-cyphers"]')).not.toBeNull();
  });

  it("previews with overlays only: the target gets no extra elements (Review Focus 5)", () => {
    placeSection("items", 0, 1000, 800, 200);
    const childrenBefore = section("items").querySelectorAll("*").length;

    mouseDrag(section("cyphers"), "dragstart");
    mouseDrag(section("items"), "dragover", 600, 1120);

    expect(section("items").classList.contains("drop-ghost-right")).toBe(true);
    expect(section("items").querySelectorAll("*").length).toBe(childrenBefore);
  });

  it("dragging a card inside a paired section reorders cards, not the section", () => {
    mountSheet(createCharacterWithItems(), clock);
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
