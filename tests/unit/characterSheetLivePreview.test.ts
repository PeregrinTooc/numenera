import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CharacterSheet } from "@/components/CharacterSheet";
import { createTestCharacter } from "../factories/character.js";
import {
  mouseDrag,
  mountSheet,
  placeSection,
  section,
  sectionOrder,
  touch,
  touchDragOver,
} from "./helpers/sectionDragFixture";

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
