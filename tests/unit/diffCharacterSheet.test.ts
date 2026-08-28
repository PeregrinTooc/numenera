import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render } from "lit-html";
import { DiffCharacterSheet } from "../../src/components/DiffCharacterSheet";
import { diffCharacters } from "../../src/utils/characterDiff";
import type { Character } from "../../src/types/character";

function createBaseCharacter(): Character {
  return {
    name: "Test Character",
    tier: 1,
    type: "Glaive",
    descriptor: "Strong",
    focus: "Battles",
    currentXp: 0,
    totalXp: 0,
    shins: 10,
    armor: 1,
    effort: 1,
    maxCyphers: 2,
    stats: {
      might: { pool: 10, edge: 0, current: 10 },
      speed: { pool: 10, edge: 0, current: 10 },
      intellect: { pool: 10, edge: 0, current: 10 },
    },
    cyphers: [],
    artifacts: [],
    oddities: [],
    abilities: [],
    equipment: [],
    attacks: [],
    specialAbilities: [],
    recoveryRolls: {
      action: false,
      tenMinutes: false,
      oneHour: false,
      tenHours: false,
      modifier: 0,
    },
    damageTrack: { impairment: "healthy" },
    textFields: { background: "", notes: "" },
  };
}

describe("DiffCharacterSheet", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("renders no inputs or buttons - the view is fully read-only", () => {
    const left = createBaseCharacter();
    const right = createBaseCharacter();
    right.name = "New Name";
    const diff = diffCharacters(left, right);

    const sheet = new DiffCharacterSheet(right, diff).forSide("right");
    render(sheet.render(), container);

    expect(container.querySelectorAll("input, textarea, button, select")).toHaveLength(0);
  });

  it("highlights a changed scalar field with diff-modified on both sides", () => {
    const left = createBaseCharacter();
    const right = createBaseCharacter();
    right.name = "New Name";
    const diff = diffCharacters(left, right);

    const leftSheet = new DiffCharacterSheet(left, diff).forSide("left");
    render(leftSheet.render(), container);
    expect(
      container.querySelector('[data-testid="character-name"]')?.classList.contains("diff-modified")
    ).toBe(true);

    const rightSheet = new DiffCharacterSheet(right, diff).forSide("right");
    render(rightSheet.render(), container);
    expect(
      container.querySelector('[data-testid="character-name"]')?.classList.contains("diff-modified")
    ).toBe(true);
  });

  it("does not highlight an unchanged scalar field", () => {
    const left = createBaseCharacter();
    const right = createBaseCharacter();
    right.name = "New Name";
    const diff = diffCharacters(left, right);

    const sheet = new DiffCharacterSheet(right, diff).forSide("right");
    render(sheet.render(), container);

    expect(
      container.querySelector('[data-testid="character-tier"]')?.classList.contains("diff-modified")
    ).toBe(false);
  });

  it("shows an added cypher only on the right pane, highlighted diff-added", () => {
    const left = createBaseCharacter();
    const right = createBaseCharacter();
    right.cyphers = [{ name: "Detonation", level: "1d6", effect: "boom" }];
    const diff = diffCharacters(left, right);

    const leftSheet = new DiffCharacterSheet(left, diff).forSide("left");
    render(leftSheet.render(), container);
    expect(container.querySelector('[data-testid="cypher-item"]')).toBeNull();

    const rightSheet = new DiffCharacterSheet(right, diff).forSide("right");
    render(rightSheet.render(), container);
    const card = container.querySelector('[data-testid="cypher-item"]');
    expect(card?.classList.contains("diff-added")).toBe(true);
  });

  it("shows a removed cypher only on the left pane, highlighted diff-removed", () => {
    const left = createBaseCharacter();
    left.cyphers = [{ name: "Detonation", level: "1d6", effect: "boom" }];
    const right = createBaseCharacter();
    const diff = diffCharacters(left, right);

    const rightSheet = new DiffCharacterSheet(right, diff).forSide("right");
    render(rightSheet.render(), container);
    expect(container.querySelector('[data-testid="cypher-item"]')).toBeNull();

    const leftSheet = new DiffCharacterSheet(left, diff).forSide("left");
    render(leftSheet.render(), container);
    const card = container.querySelector('[data-testid="cypher-item"]');
    expect(card?.classList.contains("diff-removed")).toBe(true);
  });

  it("highlights a modified cypher diff-modified on both panes", () => {
    const left = createBaseCharacter();
    left.cyphers = [{ name: "Detonation", level: "1d6", effect: "boom" }];
    const right = createBaseCharacter();
    right.cyphers = [{ name: "Detonation", level: "1d6", effect: "bigger boom" }];
    const diff = diffCharacters(left, right);

    const leftSheet = new DiffCharacterSheet(left, diff).forSide("left");
    render(leftSheet.render(), container);
    expect(
      container.querySelector('[data-testid="cypher-item"]')?.classList.contains("diff-modified")
    ).toBe(true);

    const rightSheet = new DiffCharacterSheet(right, diff).forSide("right");
    render(rightSheet.render(), container);
    expect(
      container.querySelector('[data-testid="cypher-item"]')?.classList.contains("diff-modified")
    ).toBe(true);
  });

  it("omits the cyphers section entirely when there are no cyphers on that side", () => {
    const left = createBaseCharacter();
    const right = createBaseCharacter();
    const diff = diffCharacters(left, right);

    const sheet = new DiffCharacterSheet(right, diff).forSide("right");
    render(sheet.render(), container);

    expect(container.querySelector('[data-testid="cyphers-section"]')).toBeNull();
  });
});
