import { describe, it, expect } from "vitest";
import { render } from "lit-html";
import { DiffCharacterSheet } from "../../src/components/DiffCharacterSheet";
import { diffCharacters } from "../../src/utils/characterDiff";
import { createTestCharacter as createBaseCharacter } from "../factories/character.js";
import { setupTestContainer } from "./helpers/testSetup.js";

describe("DiffCharacterSheet", () => {
  const getContainer = setupTestContainer();

  it("renders no inputs or buttons - the view is fully read-only", () => {
    const left = createBaseCharacter();
    const right = createBaseCharacter();
    right.name = "New Name";
    const diff = diffCharacters(left, right);

    const sheet = new DiffCharacterSheet(right, diff).forSide("right");
    render(sheet.render(), getContainer());

    expect(getContainer().querySelectorAll("input, textarea, button, select")).toHaveLength(0);
  });

  it("highlights a changed scalar field with diff-modified on both sides", () => {
    const left = createBaseCharacter();
    const right = createBaseCharacter();
    right.name = "New Name";
    const diff = diffCharacters(left, right);

    const leftSheet = new DiffCharacterSheet(left, diff).forSide("left");
    render(leftSheet.render(), getContainer());
    expect(
      getContainer()
        .querySelector('[data-testid="character-name"]')
        ?.classList.contains("diff-modified")
    ).toBe(true);

    const rightSheet = new DiffCharacterSheet(right, diff).forSide("right");
    render(rightSheet.render(), getContainer());
    expect(
      getContainer()
        .querySelector('[data-testid="character-name"]')
        ?.classList.contains("diff-modified")
    ).toBe(true);
  });

  it("does not highlight an unchanged scalar field", () => {
    const left = createBaseCharacter();
    const right = createBaseCharacter();
    right.name = "New Name";
    const diff = diffCharacters(left, right);

    const sheet = new DiffCharacterSheet(right, diff).forSide("right");
    render(sheet.render(), getContainer());

    expect(
      getContainer()
        .querySelector('[data-testid="character-tier"]')
        ?.classList.contains("diff-modified")
    ).toBe(false);
  });

  it("shows an added cypher only on the right pane, highlighted diff-added", () => {
    const left = createBaseCharacter();
    const right = createBaseCharacter();
    right.cyphers = [{ name: "Detonation", level: "1d6", effect: "boom" }];
    const diff = diffCharacters(left, right);

    const leftSheet = new DiffCharacterSheet(left, diff).forSide("left");
    render(leftSheet.render(), getContainer());
    expect(getContainer().querySelector('[data-testid="cypher-item"]')).toBeNull();

    const rightSheet = new DiffCharacterSheet(right, diff).forSide("right");
    render(rightSheet.render(), getContainer());
    const card = getContainer().querySelector('[data-testid="cypher-item"]');
    expect(card?.classList.contains("diff-added")).toBe(true);
  });

  it("shows a removed cypher only on the left pane, highlighted diff-removed", () => {
    const left = createBaseCharacter();
    left.cyphers = [{ name: "Detonation", level: "1d6", effect: "boom" }];
    const right = createBaseCharacter();
    const diff = diffCharacters(left, right);

    const rightSheet = new DiffCharacterSheet(right, diff).forSide("right");
    render(rightSheet.render(), getContainer());
    expect(getContainer().querySelector('[data-testid="cypher-item"]')).toBeNull();

    const leftSheet = new DiffCharacterSheet(left, diff).forSide("left");
    render(leftSheet.render(), getContainer());
    const card = getContainer().querySelector('[data-testid="cypher-item"]');
    expect(card?.classList.contains("diff-removed")).toBe(true);
  });

  it("highlights a modified cypher diff-modified on both panes", () => {
    const left = createBaseCharacter();
    left.cyphers = [{ name: "Detonation", level: "1d6", effect: "boom" }];
    const right = createBaseCharacter();
    right.cyphers = [{ name: "Detonation", level: "1d6", effect: "bigger boom" }];
    const diff = diffCharacters(left, right);

    const leftSheet = new DiffCharacterSheet(left, diff).forSide("left");
    render(leftSheet.render(), getContainer());
    expect(
      getContainer()
        .querySelector('[data-testid="cypher-item"]')
        ?.classList.contains("diff-modified")
    ).toBe(true);

    const rightSheet = new DiffCharacterSheet(right, diff).forSide("right");
    render(rightSheet.render(), getContainer());
    expect(
      getContainer()
        .querySelector('[data-testid="cypher-item"]')
        ?.classList.contains("diff-modified")
    ).toBe(true);
  });

  it("omits the cyphers section entirely when there are no cyphers on that side", () => {
    const left = createBaseCharacter();
    const right = createBaseCharacter();
    const diff = diffCharacters(left, right);

    const sheet = new DiffCharacterSheet(right, diff).forSide("right");
    render(sheet.render(), getContainer());

    expect(getContainer().querySelector('[data-testid="cyphers-section"]')).toBeNull();
  });
});
