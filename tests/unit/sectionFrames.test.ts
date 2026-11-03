import { describe, it, expect, vi, beforeEach } from "vitest";
import { CharacterSheet } from "@/components/CharacterSheet";
import { getAllSectionIds, DEFAULT_LAYOUT } from "@/types/layout";
import { createCharacterWithItems } from "../factories/character.js";

function mountSheet(): void {
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
}

describe("section frames", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("every section sits in the same frame", () => {
    mountSheet();

    for (const id of getAllSectionIds(DEFAULT_LAYOUT)) {
      const frame = id === "basicInfo" ? ".basic-info-card" : ".section-box";
      const section = document.querySelector(`[data-section-id="${id}"]`);
      expect(section?.querySelector(frame), id).not.toBeNull();
    }
  });

  it("no section keeps the amber text-field frame", () => {
    mountSheet();

    expect(document.querySelector("#app .parchment-field")).toBeNull();
  });

  it("Recovery and Damage keep their own boxes inside the frame", () => {
    mountSheet();

    const frame = document.querySelector('[data-testid="recovery-damage-section"].section-box');
    expect(frame?.querySelector(".recovery-rolls-section")).not.toBeNull();
    expect(frame?.querySelector(".damage-track-section")).not.toBeNull();
  });

  it("Cypher and Items badges lead their heading row", () => {
    mountSheet();

    for (const [badgeId, sectionId] of [
      ["max-cyphers-badge", "cyphers-section"],
      ["shins-badge", "items-section"],
    ]) {
      const badge = document.querySelector(`[data-testid="${badgeId}"]`);
      const row = badge?.parentElement;
      expect(badge?.classList.contains("badge-top-right"), badgeId).toBe(false);
      expect(row?.classList.contains("section-box-heading-row"), badgeId).toBe(true);
      expect(row?.firstElementChild, badgeId).toBe(badge);
      expect(row?.querySelector("h2"), badgeId).not.toBeNull();
      expect(row?.parentElement?.getAttribute("data-testid"), badgeId).toBe(sectionId);
    }
  });
});
