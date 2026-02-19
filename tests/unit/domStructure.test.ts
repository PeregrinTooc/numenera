/**
 * DOM Structure Tests
 *
 * These tests verify that all required data-testid attributes and DOM structure
 * are present in the rendered components. This replaces E2E tests that only
 * check for element existence (character-dom.feature).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render } from "lit-html";
import { CharacterSheet } from "../../src/components/CharacterSheet.js";
import { Header } from "../../src/components/Header.js";
import { BasicInfo } from "../../src/components/BasicInfo.js";
import { Stats } from "../../src/components/Stats.js";
import { CyphersBox } from "../../src/components/CyphersBox.js";
import { ItemsBox } from "../../src/components/ItemsBox.js";
import { BottomTextFields } from "../../src/components/BottomTextFields.js";
import type { Character } from "../../src/types/character.js";

// Create a full mock character with all required fields
function createMockCharacter(): Character {
  return {
    name: "Test Character",
    type: "Glaive",
    descriptor: "Strong",
    focus: "Bears a Halo of Fire",
    tier: 3,
    xp: 5,
    effort: 1,
    stats: {
      might: { pool: 12, edge: 1, current: 10 },
      speed: { pool: 10, edge: 0, current: 10 },
      intellect: { pool: 14, edge: 2, current: 14 },
    },
    armor: 2,
    shins: 50,
    maxCyphers: 3,
    cyphers: [
      { name: "Detonation", level: "1d6+2", effect: "Explodes in immediate radius" },
      { name: "Stim", level: "4", effect: "Restores 5 points to any pool" },
    ],
    artifacts: [
      { name: "Lightning Rod", level: "6", depletion: "1 in 1d20", effect: "Shoots lightning" },
    ],
    oddities: [
      { description: "A glowing cube that hums" },
      { description: "A metal flower that blooms at night" },
    ],
    equipment: ["Sword", "Shield", "Backpack"],
    abilities: [{ name: "Practiced in Armor", cost: "", description: "Can wear armor" }],
    specialAbilities: [
      { name: "Bash", cost: "1 Might", description: "Deals extra damage", pool: "might" },
    ],
    attacks: [{ name: "Longsword", modifier: 0, damage: 4, type: "medium", notes: "" }],
    recoveryRolls: {
      action: false,
      tenMinutes: false,
      oneHour: false,
      tenHours: false,
      modifier: 1,
    },
    damageTrack: { impairment: "healthy" },
    textFields: {
      background: "A mysterious past...",
      notes: "Remember to level up",
    },
  };
}

// Create empty character for testing empty states
function createEmptyCharacter(): Character {
  return {
    name: "",
    type: "Jack",
    descriptor: "",
    focus: "",
    tier: 1,
    xp: 0,
    effort: 1,
    stats: {
      might: { pool: 10, edge: 0, current: 10 },
      speed: { pool: 10, edge: 0, current: 10 },
      intellect: { pool: 10, edge: 0, current: 10 },
    },
    armor: 0,
    shins: 0,
    maxCyphers: 2,
    cyphers: [],
    artifacts: [],
    oddities: [],
    equipment: [],
    abilities: [],
    specialAbilities: [],
    attacks: [],
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

describe("DOM Structure Tests", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });

  describe("Header Component", () => {
    it("should render all required buttons with correct testids", () => {
      const header = new Header(vi.fn(), vi.fn(), vi.fn(), vi.fn());
      render(header.render(), container);

      // Verify all header buttons exist
      expect(container.querySelector('[data-testid="character-header"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="load-button"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="new-button"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="import-button"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="export-button"]')).toBeTruthy();
    });

    it("should have exactly 4 buttons in header", () => {
      const header = new Header(vi.fn(), vi.fn(), vi.fn(), vi.fn());
      render(header.render(), container);

      const headerEl = container.querySelector('[data-testid="character-header"]');
      const buttons = headerEl?.querySelectorAll("button");
      expect(buttons?.length).toBe(4);
    });

    it("should render page title", () => {
      const header = new Header(vi.fn(), vi.fn(), vi.fn(), vi.fn());
      render(header.render(), container);

      expect(container.querySelector('[data-testid="page-title"]')).toBeTruthy();
    });
  });

  describe("BasicInfo Component", () => {
    it("should render all required field testids", () => {
      const character = createMockCharacter();
      const basicInfo = new BasicInfo(character, vi.fn());
      render(basicInfo.render(), container);

      // Verify basic info section
      expect(container.querySelector('[data-testid="basic-info"]')).toBeTruthy();

      // Verify all sentence format fields
      expect(container.querySelector('[data-testid="character-name"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="character-tier"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="character-type-select"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="character-descriptor"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="character-focus"]')).toBeTruthy();
    });

    it("should render editable fields with correct classes", () => {
      const character = createMockCharacter();
      const basicInfo = new BasicInfo(character, vi.fn());
      render(basicInfo.render(), container);

      const nameField = container.querySelector('[data-testid="character-name"]');
      expect(nameField?.classList.contains("editable-field")).toBe(true);

      const tierField = container.querySelector('[data-testid="character-tier"]');
      expect(tierField?.classList.contains("editable-field")).toBe(true);
    });
  });

  describe("Stats Component", () => {
    it("should render stats section with correct testid", () => {
      const character = createMockCharacter();
      const stats = new Stats(character, vi.fn());
      render(stats.render(), container);

      expect(container.querySelector('[data-testid="stats-section"]')).toBeTruthy();
    });

    it("should render all three stat pools with correct structure", () => {
      const character = createMockCharacter();
      const stats = new Stats(character, vi.fn());
      render(stats.render(), container);

      // Verify Might stat pool
      expect(container.querySelector('[data-testid="stat-might"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="stat-might-label"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="stat-might-pool"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="stat-might-edge"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="stat-might-current"]')).toBeTruthy();

      // Verify Speed stat pool
      expect(container.querySelector('[data-testid="stat-speed"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="stat-speed-label"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="stat-speed-pool"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="stat-speed-edge"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="stat-speed-current"]')).toBeTruthy();

      // Verify Intellect stat pool
      expect(container.querySelector('[data-testid="stat-intellect"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="stat-intellect-label"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="stat-intellect-pool"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="stat-intellect-edge"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="stat-intellect-current"]')).toBeTruthy();
    });

    it("should render effort badge", () => {
      const character = createMockCharacter();
      const stats = new Stats(character, vi.fn());
      render(stats.render(), container);

      expect(container.querySelector('[data-testid="effort-badge"]')).toBeTruthy();
    });
  });

  describe("CyphersBox Component", () => {
    it("should render cyphers section with heading and list", () => {
      const character = createMockCharacter();
      const cyphersBox = new CyphersBox(character, vi.fn());
      render(cyphersBox.render(), container);

      expect(container.querySelector('[data-testid="cyphers-section"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="cyphers-heading"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="cyphers-list"]')).toBeTruthy();
    });

    it("should render correct number of cypher items", () => {
      const character = createMockCharacter();
      const cyphersBox = new CyphersBox(character, vi.fn());
      render(cyphersBox.render(), container);

      const cypherItems = container.querySelectorAll('[data-testid="cypher-item"]');
      expect(cypherItems.length).toBe(2);
    });
  });

  describe("ItemsBox Component", () => {
    it("should render artifacts section with heading and list", () => {
      const character = createMockCharacter();
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), container);

      expect(container.querySelector('[data-testid="artifacts-section"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="artifacts-heading"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="artifacts-list"]')).toBeTruthy();
    });

    it("should render oddities section with heading and list", () => {
      const character = createMockCharacter();
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), container);

      expect(container.querySelector('[data-testid="oddities-section"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="oddities-heading"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="oddities-list"]')).toBeTruthy();
    });

    it("should render correct number of artifact items", () => {
      const character = createMockCharacter();
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), container);

      const artifactItems = container.querySelectorAll('[data-testid^="artifact-item"]');
      expect(artifactItems.length).toBe(1);
    });

    it("should render correct number of oddity items", () => {
      const character = createMockCharacter();
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), container);

      const oddityItems = container.querySelectorAll('[data-testid^="oddity-item"]');
      expect(oddityItems.length).toBe(2);
    });
  });

  describe("BottomTextFields Component", () => {
    it("should render text fields section", () => {
      const character = createMockCharacter();
      const textFields = new BottomTextFields(character);
      render(textFields.render(), container);

      expect(container.querySelector('[data-testid="character-background"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="character-notes"]')).toBeTruthy();
    });
  });

  describe("Empty State DOM Markers", () => {
    it("should show empty cyphers marker when no cyphers", () => {
      const character = createEmptyCharacter();
      const cyphersBox = new CyphersBox(character, vi.fn());
      render(cyphersBox.render(), container);

      expect(container.querySelector('[data-testid="empty-cyphers"]')).toBeTruthy();
    });

    it("should show empty artifacts marker when no artifacts", () => {
      const character = createEmptyCharacter();
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), container);

      expect(container.querySelector('[data-testid="empty-artifacts"]')).toBeTruthy();
    });

    it("should show empty oddities marker when no oddities", () => {
      const character = createEmptyCharacter();
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), container);

      expect(container.querySelector('[data-testid="empty-oddities"]')).toBeTruthy();
    });

    it("should show empty equipment marker when no equipment", () => {
      const character = createEmptyCharacter();
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), container);

      expect(container.querySelector('[data-testid="empty-equipment"]')).toBeTruthy();
    });

    it("should not show empty markers when items exist", () => {
      const character = createMockCharacter();
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), container);

      expect(container.querySelector('[data-testid="empty-artifacts"]')).toBeFalsy();
      expect(container.querySelector('[data-testid="empty-oddities"]')).toBeFalsy();
    });
  });

  describe("CharacterSheet Full Integration", () => {
    it("should render all major sections", () => {
      const character = createMockCharacter();
      const sheet = new CharacterSheet(character, vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn());
      render(sheet.render(), container);

      // Verify main container
      expect(container.querySelector(".parchment-container")).toBeTruthy();

      // Verify all major sections are present
      expect(container.querySelector('[data-testid="character-header"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="basic-info"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="stats-section"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="cyphers-section"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="artifacts-section"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="oddities-section"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="text-fields-section"]')).toBeTruthy();
    });
  });
});
