/**
 * DOM Structure Tests
 *
 * These tests verify that all required data-testid attributes and DOM structure
 * are present in the rendered components. This replaces E2E tests that only
 * check for element existence (character-dom.feature).
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "lit-html";
import { Header } from "@/components/Header";
import { BasicInfo } from "@/components/BasicInfo";
import { Stats } from "@/components/Stats";
import { CyphersBox } from "@/components/CyphersBox";
import { ItemsBox } from "@/components/ItemsBox";
import { BottomTextFields } from "@/components/BottomTextFields";
import { setupTestContainer } from "./helpers/testSetup.js";
import { createTestCharacter as createMockCharacter } from "../factories/character.js";

describe("DOM Structure Tests", () => {
  const getContainer = setupTestContainer();

  describe("Header Component", () => {
    it("should render all required buttons with correct testids", () => {
      const header = new Header(vi.fn(), vi.fn(), vi.fn(), vi.fn());
      render(header.render(), getContainer());

      // Verify all header buttons exist
      expect(getContainer().querySelector('[data-testid="character-header"]')).toBeTruthy();
      expect(getContainer().querySelector('[data-testid="load-button"]')).toBeTruthy();
      expect(getContainer().querySelector('[data-testid="new-button"]')).toBeTruthy();
      expect(getContainer().querySelector('[data-testid="import-button"]')).toBeTruthy();
      expect(getContainer().querySelector('[data-testid="export-button"]')).toBeTruthy();
      expect(getContainer().querySelector('[data-testid="settings-gear-button"]')).toBeTruthy();
    });

    it("should render page title", () => {
      const header = new Header(vi.fn(), vi.fn(), vi.fn(), vi.fn());
      render(header.render(), getContainer());

      expect(getContainer().querySelector('[data-testid="page-title"]')).toBeTruthy();
    });

    it("should render settings gear container", () => {
      const header = new Header(vi.fn(), vi.fn(), vi.fn(), vi.fn());
      render(header.render(), getContainer());

      expect(getContainer().querySelector('[data-testid="settings-container"]')).toBeTruthy();
    });
  });

  describe("BasicInfo Component", () => {
    it("should render all required field testids", () => {
      const character = createMockCharacter();
      const basicInfo = new BasicInfo(character, vi.fn());
      render(basicInfo.render(), getContainer());

      // Verify basic info section
      expect(getContainer().querySelector('[data-testid="basic-info"]')).toBeTruthy();

      // Verify all sentence format fields
      expect(getContainer().querySelector('[data-testid="character-name"]')).toBeTruthy();
      expect(getContainer().querySelector('[data-testid="character-tier"]')).toBeTruthy();
      expect(getContainer().querySelector('[data-testid="character-type-select"]')).toBeTruthy();
      expect(getContainer().querySelector('[data-testid="character-descriptor"]')).toBeTruthy();
      expect(getContainer().querySelector('[data-testid="character-focus"]')).toBeTruthy();
    });

    it("should render editable fields with correct classes", () => {
      const character = createMockCharacter();
      const basicInfo = new BasicInfo(character, vi.fn());
      render(basicInfo.render(), getContainer());

      const nameField = getContainer().querySelector('[data-testid="character-name"]');
      expect(nameField?.classList.contains("editable-field")).toBe(true);

      const tierField = getContainer().querySelector('[data-testid="character-tier"]');
      expect(tierField?.classList.contains("editable-field")).toBe(true);
    });
  });

  describe("Stats Component", () => {
    it("should render stats section with correct testid", () => {
      const character = createMockCharacter();
      const stats = new Stats(character, vi.fn());
      render(stats.render(), getContainer());

      expect(getContainer().querySelector('[data-testid="stats-section"]')).toBeTruthy();
    });

    it("should render all three stat pools with correct structure", () => {
      const character = createMockCharacter();
      const stats = new Stats(character, vi.fn());
      render(stats.render(), getContainer());

      const container = getContainer();

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
      render(stats.render(), getContainer());

      expect(getContainer().querySelector('[data-testid="effort-badge"]')).toBeTruthy();
    });
  });

  describe("CyphersBox Component", () => {
    it("should render cyphers section with heading and list", () => {
      const character = createMockCharacter({
        cyphers: [
          { name: "Detonation", level: "1d6+2", effect: "Explodes in immediate radius" },
          { name: "Stim", level: "4", effect: "Restores 5 points to any pool" },
        ],
      });
      const cyphersBox = new CyphersBox(character, vi.fn());
      render(cyphersBox.render(), getContainer());

      expect(getContainer().querySelector('[data-testid="cyphers-section"]')).toBeTruthy();
      expect(getContainer().querySelector('[data-testid="cyphers-heading"]')).toBeTruthy();
      expect(getContainer().querySelector('[data-testid="cyphers-list"]')).toBeTruthy();
    });

    it("should render correct number of cypher items", () => {
      const character = createMockCharacter({
        cyphers: [
          { name: "Detonation", level: "1d6+2", effect: "Explodes in immediate radius" },
          { name: "Stim", level: "4", effect: "Restores 5 points to any pool" },
        ],
      });
      const cyphersBox = new CyphersBox(character, vi.fn());
      render(cyphersBox.render(), getContainer());

      const cypherItems = getContainer().querySelectorAll('[data-testid="cypher-item"]');
      expect(cypherItems.length).toBe(2);
    });
  });

  describe("ItemsBox Component", () => {
    it("should render artifacts section with heading and list", () => {
      const character = createMockCharacter({
        artifacts: [{ name: "Lightning Rod", level: "6", effect: "Shoots lightning" }],
      });
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), getContainer());

      expect(getContainer().querySelector('[data-testid="artifacts-section"]')).toBeTruthy();
      expect(getContainer().querySelector('[data-testid="artifacts-heading"]')).toBeTruthy();
      expect(getContainer().querySelector('[data-testid="artifacts-list"]')).toBeTruthy();
    });

    it("should render oddities section with heading and list", () => {
      const character = createMockCharacter({
        oddities: ["A glowing cube that hums", "A metal flower that blooms at night"],
      });
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), getContainer());

      expect(getContainer().querySelector('[data-testid="oddities-section"]')).toBeTruthy();
      expect(getContainer().querySelector('[data-testid="oddities-heading"]')).toBeTruthy();
      expect(getContainer().querySelector('[data-testid="oddities-list"]')).toBeTruthy();
    });

    it("should render correct number of artifact items", () => {
      const character = createMockCharacter({
        artifacts: [{ name: "Lightning Rod", level: "6", effect: "Shoots lightning" }],
      });
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), getContainer());

      const artifactItems = getContainer().querySelectorAll('[data-testid^="artifact-item"]');
      expect(artifactItems.length).toBe(1);
    });

    it("should render correct number of oddity items", () => {
      const character = createMockCharacter({
        oddities: ["A glowing cube that hums", "A metal flower that blooms at night"],
      });
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), getContainer());

      const oddityItems = getContainer().querySelectorAll('[data-testid^="oddity-item"]');
      expect(oddityItems.length).toBe(2);
    });
  });

  describe("BottomTextFields Component", () => {
    it("should render text fields section", () => {
      const character = createMockCharacter();
      const textFields = new BottomTextFields(character);
      render(textFields.render(), getContainer());

      expect(getContainer().querySelector('[data-testid="character-background"]')).toBeTruthy();
      expect(getContainer().querySelector('[data-testid="character-notes"]')).toBeTruthy();
    });
  });
});
