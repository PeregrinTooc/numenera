import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CharacterSheet } from "@/components/CharacterSheet";
import { createCharacterWithItems, createTestCharacter } from "../factories/character.js";
import type { Character } from "@/types/character";

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

function mountSheet(character: Character): CharacterSheet {
  document.body.innerHTML = '<div id="app"></div>';
  const sheet = new CharacterSheet(character, vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn());
  sheet.mount(document.getElementById("app") as HTMLElement);
  sheet.toggleLayoutEditMode();
  return sheet;
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

  it("re-evaluates the layout width on every hover, not once per drag (Review Focus 4)", () => {
    const original = window.matchMedia;
    let wide = true;
    window.matchMedia = (query: string): MediaQueryList =>
      ({ matches: wide, media: query }) as MediaQueryList;
    try {
      placeSection("items", 0, 1000, 800, 200);
      touchDragOver("cyphers", "items", 600, 1120); // middle right: would pair
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

  it("previews with overlays only: the target gets no extra elements (Review Focus 5)", () => {
    placeSection("items", 0, 1000, 800, 200);
    const childrenBefore = section("items").querySelectorAll("*").length;

    mouseDrag(section("cyphers"), "dragstart");
    mouseDrag(section("items"), "dragover", 600, 1120);

    expect(section("items").classList.contains("drop-ghost-right")).toBe(true);
    expect(section("items").querySelectorAll("*").length).toBe(childrenBefore);
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

describe("CharacterSheet live layout preview", () => {
  let sheet: CharacterSheet;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    document.elementFromPoint = (): Element | null => null;
    sheet = mountSheet(createTestCharacter());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const pairGrid = (): Element | null =>
    document.querySelector('[data-testid="layout-grid-items-cyphers"]');

  it("shows the resulting layout after the intent has held for 300 ms, without saving", () => {
    placeSection("items", 0, 1000, 800, 200);
    touchDragOver("cyphers", "items", 600, 1120); // middle right: pair

    vi.advanceTimersByTime(299);
    expect(pairGrid()).toBeNull();
    vi.advanceTimersByTime(1);
    expect(pairGrid()).not.toBeNull();
    expect(localStorage.getItem("numenera-layout")).toBeNull();
  });

  it("an intent change restarts the wait", () => {
    placeSection("items", 0, 1000, 800, 200);
    touchDragOver("cyphers", "items", 200, 1120); // middle left
    vi.advanceTimersByTime(200);
    touch(section("cyphers"), "touchmove", [{ x: 600, y: 1120 }]); // middle right

    vi.advanceTimersByTime(299);
    expect(pairGrid()).toBeNull();
    vi.advanceTimersByTime(1);
    expect(pairGrid()).not.toBeNull();
  });

  it("releasing during the live preview commits what is shown", () => {
    placeSection("items", 0, 1000, 800, 200);
    touchDragOver("cyphers", "items", 600, 1120);
    vi.advanceTimersByTime(300);
    // The finger now rests on Cyphers in its new place (the right half of the
    // pair): dropping a section on itself is a no-op zone
    placeSection("cyphers", 400, 1000, 400, 200);
    vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("cyphers"));
    touch(section("cyphers"), "touchmove", [{ x: 601, y: 1121 }]);
    touch(section("cyphers"), "touchend");

    expect(pairGrid()).not.toBeNull();
    expect(localStorage.getItem("numenera-layout")).toContain('"items","cyphers"');
  });

  it("after the live preview, the next hover builds on the previewed layout", () => {
    placeSection("items", 0, 1000, 800, 200);
    touchDragOver("cyphers", "items", 600, 1120);
    vi.advanceTimersByTime(300);
    // Over the top edge of Items, now Cyphers' partner. Against the preview
    // that takes Cyphers out of the pair to the row above; against the saved
    // layout it would be a no-op (Cyphers is already right above Items).
    placeSection("items", 0, 1000, 400, 200);
    vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("items"));
    touch(section("cyphers"), "touchmove", [{ x: 200, y: 1010 }]);
    touch(section("cyphers"), "touchend");

    expect(pairGrid()).toBeNull();
    const order = sectionOrder();
    expect(order.indexOf("cyphers")).toBe(order.indexOf("items") - 1);
  });

  it("a cancelled touch drag restores the layout from before the drag and saves nothing", () => {
    const before = sectionOrder();
    placeSection("items", 0, 1000, 800, 200);
    touchDragOver("cyphers", "items", 600, 1120);
    vi.advanceTimersByTime(300);
    touch(section("cyphers"), "touchcancel");

    expect(sectionOrder()).toEqual(before);
    expect(pairGrid()).toBeNull();
    expect(localStorage.getItem("numenera-layout")).toBeNull();
  });

  it("a mouse drag that ends without a drop restores the layout", () => {
    const before = sectionOrder();
    placeSection("items", 0, 1000, 800, 200);
    mouseDrag(section("cyphers"), "dragstart");
    mouseDrag(section("items"), "dragover", 600, 1120);
    vi.advanceTimersByTime(300);
    expect(pairGrid()).not.toBeNull();
    section("cyphers").dispatchEvent(new Event("dragend", { bubbles: true }));

    expect(sectionOrder()).toEqual(before);
    expect(localStorage.getItem("numenera-layout")).toBeNull();
  });

  it("a live preview holds until the pointer moves more than a few pixels", () => {
    placeSection("items", 0, 1000, 800, 200);
    touchDragOver("cyphers", "items", 600, 1120);
    vi.advanceTimersByTime(300); // Cyphers paired with Items
    // Cyphers is taller in its narrower new place, so the still pointer now
    // lies in its bottom quarter, which would take it out of the pair again.
    placeSection("cyphers", 400, 900, 400, 240);
    vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("cyphers"));

    touch(section("cyphers"), "touchmove", [{ x: 602, y: 1121 }]); // a wobble
    vi.advanceTimersByTime(600);
    expect(pairGrid()).not.toBeNull();

    touch(section("cyphers"), "touchmove", [{ x: 602, y: 1140 }]); // a real move
    vi.advanceTimersByTime(300);
    expect(pairGrid()).toBeNull();
  });

  it("releasing on a live preview that is back at the saved layout writes nothing", () => {
    const before = sectionOrder();
    placeSection("items", 0, 1000, 800, 200);
    touchDragOver("cyphers", "items", 600, 1120);
    vi.advanceTimersByTime(300); // Cyphers paired with Items
    // The top edge of Items, now in the pair: Cyphers back to its own row above
    placeSection("items", 0, 1000, 400, 200);
    vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("items"));
    touch(section("cyphers"), "touchmove", [{ x: 200, y: 1010 }]);
    vi.advanceTimersByTime(300);
    touch(section("cyphers"), "touchend");

    expect(sectionOrder()).toEqual(before);
    expect(localStorage.getItem("numenera-layout")).toBeNull();
  });

  /** A mouse drag of Cyphers whose live preview pairs it with Items. */
  function mouseLivePreview(): void {
    placeSection("items", 0, 1000, 800, 200);
    mouseDrag(section("cyphers"), "dragstart");
    mouseDrag(section("items"), "dragover", 600, 1120);
    vi.advanceTimersByTime(300);
    expect(pairGrid()).not.toBeNull();
  }

  // Firefox (and WebKit in some cases) sends no dragend when the drag source
  // was removed from the page, which a live preview can do.
  describe("when a mouse drag ends without a dragend", () => {
    it("the next drag starts from the saved layout", () => {
      mouseLivePreview();
      mouseDrag(section("abilities"), "dragstart");

      expect(pairGrid()).toBeNull();
      mouseDrag(section("abilities"), "drop");
      expect(localStorage.getItem("numenera-layout")).toBeNull();
    });

    it("the first pointer move with no button pressed ends it, saving nothing", () => {
      mouseLivePreview();
      document.dispatchEvent(new MouseEvent("pointermove", { bubbles: true, buttons: 0 }));

      expect(pairGrid()).toBeNull();
      expect(localStorage.getItem("numenera-layout")).toBeNull();
    });

    it("a pointer move with the button still held does not end the drag", () => {
      mouseLivePreview();
      document.dispatchEvent(new MouseEvent("pointermove", { bubbles: true, buttons: 1 }));

      expect(pairGrid()).not.toBeNull();
    });

    it("leaving layout edit mode drops the live preview", () => {
      mouseLivePreview();
      sheet.toggleLayoutEditMode();

      expect(pairGrid()).toBeNull();
      expect(localStorage.getItem("numenera-layout")).toBeNull();
    });
  });
});
