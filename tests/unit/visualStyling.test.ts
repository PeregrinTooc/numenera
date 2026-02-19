/**
 * Visual Styling Tests
 *
 * These tests verify that components have the correct CSS classes applied
 * for visual styling. This replaces E2E tests that only check for CSS classes
 * (stats-visual-styling.feature, items-visual-styling.feature, etc.).
 *
 * Note: These tests verify CLASS application, not computed styles.
 * Computed style testing requires a real browser and belongs in E2E tests
 * only when visual regression is critical.
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "lit-html";
import { CypherItem } from "../../src/components/CypherItem.js";
import { ArtifactItem } from "../../src/components/ArtifactItem.js";
import { OddityItem } from "../../src/components/OddityItem.js";
import { EquipmentItem } from "../../src/components/EquipmentItem.js";
import { CyphersBox } from "../../src/components/CyphersBox.js";
import { ItemsBox } from "../../src/components/ItemsBox.js";
import { Stats } from "../../src/components/Stats.js";
import { StatPool } from "../../src/components/StatPool.js";
import { BottomTextFields } from "../../src/components/BottomTextFields.js";
import type { Cypher, Artifact, Oddity } from "../../src/types/character.js";
import {
  setupTestContainer,
  createMockCharacter,
  createEmptyCharacter,
} from "./helpers/testSetup.js";

describe("Visual Styling Tests", () => {
  const getContainer = setupTestContainer();

  describe("Cypher Items - Blue Theme", () => {
    it("should apply cypher-item-card class to cypher cards", () => {
      const cypher: Cypher = { name: "Test Cypher", level: "5", effect: "Test effect" };
      const cypherItem = new CypherItem(cypher, 0);
      render(cypherItem.render(), getContainer());

      const card = getContainer().querySelector('[data-testid="cypher-item"]');
      expect(card?.classList.contains("cypher-item-card")).toBe(true);
    });

    it("should render ONE-USE warning badge", () => {
      const cypher: Cypher = { name: "Test Cypher", level: "5", effect: "Test effect" };
      const cypherItem = new CypherItem(cypher, 0);
      render(cypherItem.render(), getContainer());

      const warningBadge = getContainer().querySelector('[data-testid="cypher-warning"]');
      expect(warningBadge).toBeTruthy();
      expect(warningBadge?.classList.contains("cypher-warning")).toBe(true);
      expect(warningBadge?.textContent).toContain("ONE-USE");
    });

    it("should render cypher level badge with correct class", () => {
      const cypher: Cypher = { name: "Test Cypher", level: "5", effect: "Test effect" };
      const cypherItem = new CypherItem(cypher, 0);
      render(cypherItem.render(), getContainer());

      const levelBadge = getContainer().querySelector(".cypher-level-badge");
      expect(levelBadge).toBeTruthy();
    });
  });

  describe("Artifact Items - Gold Theme", () => {
    it("should apply artifact-item-card class to artifact cards", () => {
      const artifact: Artifact = {
        name: "Test Artifact",
        level: "6",
        depletion: "1 in 1d20",
        effect: "Test effect",
      };
      const artifactItem = new ArtifactItem(artifact, 0);
      render(artifactItem.render(), getContainer());

      // Artifact items use dynamic testid with name
      const card = getContainer().querySelector('[data-testid="artifact-item-Test Artifact"]');
      expect(card?.classList.contains("artifact-item-card")).toBe(true);
    });

    it("should apply artifact-name class to artifact name", () => {
      const artifact: Artifact = {
        name: "Test Artifact",
        level: "6",
        depletion: "1 in 1d20",
        effect: "Test effect",
      };
      const artifactItem = new ArtifactItem(artifact, 0);
      render(artifactItem.render(), getContainer());

      const nameEl = getContainer().querySelector(".artifact-name");
      expect(nameEl).toBeTruthy();
    });

    it("should render artifact level badge with correct class", () => {
      const artifact: Artifact = {
        name: "Test Artifact",
        level: "6",
        depletion: "1 in 1d20",
        effect: "Test effect",
      };
      const artifactItem = new ArtifactItem(artifact, 0);
      render(artifactItem.render(), getContainer());

      const levelBadge = getContainer().querySelector(".artifact-level-badge");
      expect(levelBadge).toBeTruthy();
    });
  });

  describe("Oddity Items - Brown Theme", () => {
    it("should apply oddity-item-card class to oddity cards", () => {
      const oddity: Oddity = { description: "A glowing cube" };
      const oddityItem = new OddityItem(oddity, 0);
      render(oddityItem.render(), getContainer());

      const card = getContainer().querySelector('[data-testid="oddity-item"]');
      expect(card?.classList.contains("oddity-item-card")).toBe(true);
    });
  });

  describe("Equipment Items - Green Theme", () => {
    it("should apply equipment-item-card class to equipment cards", () => {
      // EquipmentItem expects an object with name property
      const equipmentItem = new EquipmentItem({ name: "Sword" }, 0);
      render(equipmentItem.render(), getContainer());

      // Equipment items use dynamic testid with name
      const card = getContainer().querySelector('[data-testid="equipment-item-Sword"]');
      expect(card?.classList.contains("equipment-item-card")).toBe(true);
    });
  });

  describe("Empty State Styling", () => {
    it("should apply empty-cyphers-styled class when no cyphers", () => {
      const character = createEmptyCharacter();
      const cyphersBox = new CyphersBox(character, vi.fn());
      render(cyphersBox.render(), getContainer());

      const emptyState = getContainer().querySelector('[data-testid="empty-cyphers"]');
      expect(emptyState?.classList.contains("empty-cyphers-styled")).toBe(true);
    });

    it("should apply empty-artifacts-styled class when no artifacts", () => {
      const character = createEmptyCharacter();
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), getContainer());

      const emptyState = getContainer().querySelector('[data-testid="empty-artifacts"]');
      expect(emptyState?.classList.contains("empty-artifacts-styled")).toBe(true);
    });

    it("should apply empty-oddities-styled class when no oddities", () => {
      const character = createEmptyCharacter();
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), getContainer());

      const emptyState = getContainer().querySelector('[data-testid="empty-oddities"]');
      expect(emptyState?.classList.contains("empty-oddities-styled")).toBe(true);
    });

    it("should apply empty-equipment-styled class when no equipment", () => {
      const character = createEmptyCharacter();
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), getContainer());

      const emptyState = getContainer().querySelector('[data-testid="empty-equipment"]');
      expect(emptyState?.classList.contains("empty-equipment-styled")).toBe(true);
    });
  });

  describe("Stats Section Styling", () => {
    it("should apply stat-pool-card class to stat pool containers", () => {
      const character = createMockCharacter();
      const stats = new Stats(character, vi.fn());
      render(stats.render(), getContainer());

      const container = getContainer();

      // All three stat pools should have the card class
      const mightPool = container.querySelector('[data-testid="stat-might"]');
      const speedPool = container.querySelector('[data-testid="stat-speed"]');
      const intellectPool = container.querySelector('[data-testid="stat-intellect"]');

      expect(mightPool?.classList.contains("stat-pool-card")).toBe(true);
      expect(speedPool?.classList.contains("stat-pool-card")).toBe(true);
      expect(intellectPool?.classList.contains("stat-pool-card")).toBe(true);
    });

    it("should apply stat-badge class to effort badge", () => {
      const character = createMockCharacter();
      const stats = new Stats(character, vi.fn());
      render(stats.render(), getContainer());

      const effortBadge = getContainer().querySelector('[data-testid="effort-badge"]');
      // The effort badge uses stat-badge class, not effort-badge
      expect(effortBadge?.classList.contains("stat-badge")).toBe(true);
    });

    it("should render stat values as editable fields", () => {
      const character = createMockCharacter();
      const stats = new Stats(character, vi.fn());
      render(stats.render(), getContainer());

      const container = getContainer();

      // Check that stat values have editable-field class
      const mightPool = container.querySelector('[data-testid="stat-might-pool"]');
      const mightEdge = container.querySelector('[data-testid="stat-might-edge"]');
      const mightCurrent = container.querySelector('[data-testid="stat-might-current"]');

      expect(mightPool?.classList.contains("editable-field")).toBe(true);
      expect(mightEdge?.classList.contains("editable-field")).toBe(true);
      expect(mightCurrent?.classList.contains("editable-field")).toBe(true);
    });
  });

  describe("Text Fields Styling", () => {
    it("should apply parchment-field class to text field containers", () => {
      const character = createMockCharacter();
      const textFields = new BottomTextFields(character);
      render(textFields.render(), getContainer());

      const container = getContainer();
      const backgroundField = container.querySelector('[data-testid="character-background"]');
      const notesField = container.querySelector('[data-testid="character-notes"]');

      // The parent container should have parchment-field class
      expect(backgroundField?.closest(".parchment-field")).toBeTruthy();
      expect(notesField?.closest(".parchment-field")).toBeTruthy();
    });

    it("should apply inline-edit-textarea class to text areas", () => {
      const character = createMockCharacter();
      const textFields = new BottomTextFields(character);
      render(textFields.render(), getContainer());

      const container = getContainer();
      const backgroundField = container.querySelector('[data-testid="character-background"]');
      const notesField = container.querySelector('[data-testid="character-notes"]');

      expect(backgroundField?.classList.contains("inline-edit-textarea")).toBe(true);
      expect(notesField?.classList.contains("inline-edit-textarea")).toBe(true);
    });
  });

  describe("StatPool Individual Component", () => {
    it("should apply stat-pool-card class to might stat pool", () => {
      const character = createMockCharacter();
      const statPool = new StatPool("might", character.stats.might, vi.fn());
      render(statPool.render(), getContainer());

      const pool = getContainer().querySelector('[data-testid="stat-might"]');
      // StatPool uses stat-pool-card class for all stat types
      expect(pool?.classList.contains("stat-pool-card")).toBe(true);
    });

    it("should apply stat-pool-card class to speed stat pool", () => {
      const character = createMockCharacter();
      const statPool = new StatPool("speed", character.stats.speed, vi.fn());
      render(statPool.render(), getContainer());

      const pool = getContainer().querySelector('[data-testid="stat-speed"]');
      expect(pool?.classList.contains("stat-pool-card")).toBe(true);
    });

    it("should apply stat-pool-card class to intellect stat pool", () => {
      const character = createMockCharacter();
      const statPool = new StatPool("intellect", character.stats.intellect, vi.fn());
      render(statPool.render(), getContainer());

      const pool = getContainer().querySelector('[data-testid="stat-intellect"]');
      expect(pool?.classList.contains("stat-pool-card")).toBe(true);
    });

    it("should render stat pool label with correct class", () => {
      const character = createMockCharacter();
      const statPool = new StatPool("might", character.stats.might, vi.fn());
      render(statPool.render(), getContainer());

      const label = getContainer().querySelector('[data-testid="stat-might-label"]');
      expect(label?.classList.contains("stat-pool-label")).toBe(true);
    });

    it("should render stat pool number with correct class", () => {
      const character = createMockCharacter();
      const statPool = new StatPool("might", character.stats.might, vi.fn());
      render(statPool.render(), getContainer());

      const poolNumber = getContainer().querySelector('[data-testid="stat-might-pool"]');
      expect(poolNumber?.classList.contains("stat-pool-number")).toBe(true);
    });
  });
});
