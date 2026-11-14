import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ManualClock } from "@/services/manualClock";
import { CharacterSheet } from "@/components/CharacterSheet";
import { createTestCharacter } from "../factories/character.js";
import {
  layOutByRows,
  mouseDrag,
  mountSheet,
  placeSection,
  ROW_HEIGHT,
  section,
  sectionOrder,
  touch,
  touchDragOver,
} from "./helpers/sectionDragFixture";

let clock: ManualClock;

describe("CharacterSheet live layout preview", () => {
  let sheet: CharacterSheet;

  beforeEach(() => {
    clock = new ManualClock();
    localStorage.clear();
    document.elementFromPoint = (): Element | null => null;
    sheet = mountSheet(createTestCharacter(), clock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const pairGrid = (): Element | null =>
    document.querySelector('[data-testid="layout-grid-items-cyphers"]');

  it("shows the resulting layout after the intent has held for 300 ms, without saving", () => {
    placeSection("items", 0, 1000, 800, 200);
    touchDragOver(clock, "cyphers", "items", 600, 1120); // middle right: pair

    clock.advance(299);
    expect(pairGrid()).toBeNull();
    clock.advance(1);
    expect(pairGrid()).not.toBeNull();
    expect(localStorage.getItem("numenera-layout")).toBeNull();
  });

  it("an intent change restarts the wait", () => {
    placeSection("items", 0, 1000, 800, 200);
    touchDragOver(clock, "cyphers", "items", 200, 1120); // middle left
    clock.advance(200);
    touch(section("cyphers"), "touchmove", [{ x: 600, y: 1120 }]); // middle right

    clock.advance(299);
    expect(pairGrid()).toBeNull();
    clock.advance(1);
    expect(pairGrid()).not.toBeNull();
  });

  it("keeps the section under the finger where it was on screen when the live preview appears", () => {
    layOutByRows();
    const before = section("items").getBoundingClientRect().top;
    touchDragOver(clock, "cyphers", "items", 600, before + 120); // middle right: pair

    clock.advance(300);

    // Cyphers' own row above Items is gone, which would lift Items a row
    expect(pairGrid()).not.toBeNull();
    expect(section("items").getBoundingClientRect().top).toBe(before);
  });

  it("releasing during the live preview commits what is shown", () => {
    placeSection("items", 0, 1000, 800, 200);
    touchDragOver(clock, "cyphers", "items", 600, 1120);
    clock.advance(300);
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
    touchDragOver(clock, "cyphers", "items", 600, 1120);
    clock.advance(300);
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
    touchDragOver(clock, "cyphers", "items", 600, 1120);
    clock.advance(300);
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
    clock.advance(300);
    expect(pairGrid()).not.toBeNull();
    section("cyphers").dispatchEvent(new Event("dragend", { bubbles: true }));

    expect(sectionOrder()).toEqual(before);
    expect(localStorage.getItem("numenera-layout")).toBeNull();
  });

  it("a live preview holds until the pointer moves more than a few pixels", () => {
    placeSection("items", 0, 1000, 800, 200);
    touchDragOver(clock, "cyphers", "items", 600, 1120);
    clock.advance(300); // Cyphers paired with Items
    // Cyphers is taller in its narrower new place, so the still pointer now
    // lies in its bottom quarter, which would take it out of the pair again.
    placeSection("cyphers", 400, 900, 400, 240);
    vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("cyphers"));

    touch(section("cyphers"), "touchmove", [{ x: 602, y: 1121 }]); // a wobble
    clock.advance(600);
    expect(pairGrid()).not.toBeNull();

    touch(section("cyphers"), "touchmove", [{ x: 602, y: 1140 }]); // a real move
    clock.advance(300);
    expect(pairGrid()).toBeNull();
  });

  it("releasing on a live preview that is back at the saved layout writes nothing", () => {
    const before = sectionOrder();
    placeSection("items", 0, 1000, 800, 200);
    touchDragOver(clock, "cyphers", "items", 600, 1120);
    clock.advance(300); // Cyphers paired with Items
    // The top edge of Items, now in the pair: Cyphers back to its own row above
    placeSection("items", 0, 1000, 400, 200);
    vi.spyOn(document, "elementFromPoint").mockImplementation(() => section("items"));
    touch(section("cyphers"), "touchmove", [{ x: 200, y: 1010 }]);
    clock.advance(300);
    touch(section("cyphers"), "touchend");

    expect(sectionOrder()).toEqual(before);
    expect(localStorage.getItem("numenera-layout")).toBeNull();
  });

  it("a touch drag follows the finger on after the live preview re-rendered the touched element", () => {
    layOutByRows(); // Cyphers is row 5, Items row 6
    document.elementFromPoint = (x, y): Element | null =>
      Array.from(document.querySelectorAll("[data-section-id]")).find((el) => {
        const box = el.getBoundingClientRect();
        return x >= box.left && x < box.right && y >= box.top && y < box.bottom;
      }) ?? null;
    const touched = section("cyphers").querySelector(".section-box") as Element;
    touch(touched, "touchstart", [{ x: 20, y: 5 * ROW_HEIGHT + 20 }]);
    clock.advance(250);
    touch(touched, "touchmove", [{ x: 20, y: 7 * ROW_HEIGHT - 20 }]); // bottom edge of Items
    clock.advance(300);
    // Browsers send the rest of the touch to the element it started on
    expect(touched.isConnected).toBe(false);

    // The preview scrolled the page to keep Items under the finger
    const abilities = section("abilities").getBoundingClientRect();
    touch(touched, "touchmove", [{ x: 20, y: abilities.top + 20 }]);
    touch(touched, "touchend");

    const order = sectionOrder();
    expect(order.indexOf("cyphers")).toBe(order.indexOf("abilities") - 1);
  });

  /** A mouse drag of Cyphers whose live preview pairs it with Items. */
  function mouseLivePreview(): void {
    placeSection("items", 0, 1000, 800, 200);
    mouseDrag(section("cyphers"), "dragstart");
    mouseDrag(section("items"), "dragover", 600, 1120);
    clock.advance(300);
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
