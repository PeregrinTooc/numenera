import { describe, it, expect, vi, beforeEach } from "vitest";
import { CharacterSheet } from "@/components/CharacterSheet";
import { t } from "@/i18n/index";
import { SECTION_COLUMNS_STORAGE_KEY } from "@/storage/storageConstants";
import { createCharacterWithItems } from "../factories/character.js";

function mountSheet(): CharacterSheet {
  document.body.innerHTML = '<div id="app"></div>';
  const sheet = new CharacterSheet(
    createCharacterWithItems(),
    vi.fn(),
    vi.fn(),
    vi.fn(),
    vi.fn(),
    vi.fn()
  );
  sheet.mount(document.getElementById("app") as HTMLElement);
  return sheet;
}

function columnsWrapper(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-testid="section-columns-${id}"]`);
}

function switchIn(id: string): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>(
    `[data-section-id="${id}"] [data-testid="section-columns-button"]`
  );
}

describe("CharacterSheet section columns", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("a card section is wrapped in a column container with its column count", () => {
    mountSheet();

    expect(columnsWrapper("cyphers")?.dataset.columns).toBe("2");
    expect(columnsWrapper("cyphers")?.classList.contains("section-columns-2")).toBe(true);
    expect(columnsWrapper("attacks")?.dataset.columns).toBe("1");
    expect(columnsWrapper("attacks")?.classList.contains("section-columns-2")).toBe(false);
  });

  it("a stored choice sets the column count", () => {
    localStorage.setItem(SECTION_COLUMNS_STORAGE_KEY, '{"cyphers":1}');

    mountSheet();

    expect(columnsWrapper("cyphers")?.dataset.columns).toBe("1");
  });

  it("non-card sections get no column container", () => {
    mountSheet();

    expect(columnsWrapper("stats")).toBeNull();
  });

  it("card lists use the section card grid", () => {
    mountSheet();

    for (const list of [
      "abilities-list",
      "special-abilities-list",
      "attacks-list",
      "cyphers-list",
      "equipment-list",
    ]) {
      const element = document.querySelector(`[data-testid="${list}"]`);
      expect(element?.classList.contains("section-card-grid"), list).toBe(true);
      expect(element?.classList.contains("md:grid-cols-2"), list).toBe(false);
    }
  });

  it("Items' Artifacts and Oddities split follows the same columns", () => {
    mountSheet();

    const split = document.querySelector('[data-testid="artifacts-section"]')?.parentElement;
    expect(split?.classList.contains("section-card-grid")).toBe(true);
  });

  it("layout edit mode shows a column switch on card sections only", () => {
    const sheet = mountSheet();
    sheet.toggleLayoutEditMode();

    for (const id of ["abilities", "specialAbilities", "attacks", "cyphers", "items"]) {
      expect(switchIn(id), id).not.toBeNull();
    }
    expect(switchIn("stats")).toBeNull();
  });

  it("no column switch outside layout edit mode", () => {
    mountSheet();

    expect(switchIn("abilities")).toBeNull();
  });

  it("the switch says what pressing it will do", () => {
    const sheet = mountSheet();
    sheet.toggleLayoutEditMode();

    const button = switchIn("cyphers");
    expect(button?.getAttribute("aria-pressed")).toBe("true");
    expect(button?.getAttribute("aria-label")).toBe(t("layout.columns.showOne"));
    expect(button?.getAttribute("title")).toBe(t("layout.columns.showOne"));
    expect(switchIn("attacks")?.getAttribute("aria-pressed")).toBe("false");
    expect(switchIn("attacks")?.getAttribute("aria-label")).toBe(t("layout.columns.showTwo"));
  });

  it("pressing the switch toggles and stores the choice", () => {
    const sheet = mountSheet();
    sheet.toggleLayoutEditMode();

    switchIn("cyphers")?.click();

    expect(columnsWrapper("cyphers")?.dataset.columns).toBe("1");
    expect(localStorage.getItem(SECTION_COLUMNS_STORAGE_KEY)).toBe('{"cyphers":1}');

    switchIn("cyphers")?.click();

    expect(columnsWrapper("cyphers")?.dataset.columns).toBe("2");
    expect(localStorage.getItem(SECTION_COLUMNS_STORAGE_KEY)).toBe("{}");
  });

  it("pressing the switch does not start a section drag", () => {
    vi.useFakeTimers();
    try {
      const sheet = mountSheet();
      sheet.toggleLayoutEditMode();
      const button = switchIn("cyphers") as HTMLButtonElement;

      // A finger held on the switch past the long-press delay, then lifted
      const press = new TouchEvent("touchstart", { bubbles: true, cancelable: true });
      Object.defineProperty(press, "touches", { value: [{ clientX: 10, clientY: 10 }] });
      button.dispatchEvent(press);
      vi.advanceTimersByTime(1000);

      expect(document.querySelector(".dragging")).toBeNull();

      button.dispatchEvent(new TouchEvent("touchend", { bubbles: true }));
      button.click();

      expect(document.querySelector(".dragging")).toBeNull();
      expect(columnsWrapper("cyphers")?.dataset.columns).toBe("1");
    } finally {
      vi.useRealTimers();
    }
  });

  it("Reset Layout restores the default columns", () => {
    const sheet = mountSheet();
    sheet.toggleLayoutEditMode();
    switchIn("cyphers")?.click();

    sheet.resetLayoutToDefault();

    expect(columnsWrapper("cyphers")?.dataset.columns).toBe("2");
  });

  it("the switch's icon is drawn as SVG", () => {
    const sheet = mountSheet();
    sheet.toggleLayoutEditMode();

    const bars = switchIn("cyphers")?.querySelectorAll("rect") ?? [];
    expect(bars).toHaveLength(2);
    for (const bar of bars) {
      expect(bar.namespaceURI).toBe("http://www.w3.org/2000/svg");
    }
    expect(switchIn("attacks")?.querySelectorAll("rect")).toHaveLength(1);
  });
});
