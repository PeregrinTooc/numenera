/**
 * DOM Structure Tests
 *
 * These tests verify that all required data-testid attributes and DOM structure
 * are present in the rendered components. This replaces E2E tests that only
 * check for element existence (character-dom.feature).
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "lit-html";
import { CharacterSheet } from "@/components/CharacterSheet";
import { CyphersBox } from "@/components/CyphersBox";
import { ItemsBox } from "@/components/ItemsBox";
import { setupTestContainer } from "./helpers/testSetup.js";
import {
  createTestCharacter as createMockCharacter,
  createEmptyCharacter,
} from "../factories/character.js";

describe("DOM Structure Tests - empty states and integration", () => {
  const getContainer = setupTestContainer();
  describe("Empty State DOM Markers", () => {
    it("should show empty cyphers marker when no cyphers", () => {
      const character = createEmptyCharacter();
      const cyphersBox = new CyphersBox(character, vi.fn());
      render(cyphersBox.render(), getContainer());

      expect(getContainer().querySelector('[data-testid="empty-cyphers"]')).toBeTruthy();
    });

    it("should show empty artifacts marker when no artifacts", () => {
      const character = createEmptyCharacter();
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), getContainer());

      expect(getContainer().querySelector('[data-testid="empty-artifacts"]')).toBeTruthy();
    });

    it("should show empty oddities marker when no oddities", () => {
      const character = createEmptyCharacter();
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), getContainer());

      expect(getContainer().querySelector('[data-testid="empty-oddities"]')).toBeTruthy();
    });

    it("should show empty equipment marker when no equipment", () => {
      const character = createEmptyCharacter();
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), getContainer());

      expect(getContainer().querySelector('[data-testid="empty-equipment"]')).toBeTruthy();
    });

    it("should not show empty markers when items exist", () => {
      const character = createMockCharacter({
        artifacts: [{ name: "Test", level: "5", effect: "" }],
        oddities: ["Test oddity"],
      });
      const itemsBox = new ItemsBox(character, vi.fn());
      render(itemsBox.render(), getContainer());

      expect(getContainer().querySelector('[data-testid="empty-artifacts"]')).toBeFalsy();
      expect(getContainer().querySelector('[data-testid="empty-oddities"]')).toBeFalsy();
    });
  });

  describe("CharacterSheet Full Integration", () => {
    it("should render all major sections", () => {
      const character = createMockCharacter();
      const sheet = new CharacterSheet(character, vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn());
      sheet.mount(getContainer());

      const container = getContainer();

      // Verify main container
      expect(container.querySelector(".parchment-container")).toBeTruthy();

      // Verify all major sections are present
      expect(container.querySelector('[data-testid="character-header"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="basic-info"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="stats-section"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="cyphers-section"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="artifacts-section"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="oddities-section"]')).toBeTruthy();
      // Background and notes are now rendered as separate sections via layout system
      expect(container.querySelector('[data-testid="character-background"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="character-notes"]')).toBeTruthy();
    });

    it("should render edit layout button", () => {
      const character = createMockCharacter();
      const sheet = new CharacterSheet(character, vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn());
      sheet.mount(getContainer());

      expect(getContainer().querySelector('[data-testid="edit-layout-button"]')).toBeTruthy();
    });

    it("should render layout sections with data-section-id attributes", () => {
      const character = createMockCharacter();
      const sheet = new CharacterSheet(character, vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn());
      sheet.mount(getContainer());

      const container = getContainer();

      // Verify layout section wrappers exist
      expect(container.querySelector('[data-testid="layout-section-basicInfo"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="layout-section-stats"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="layout-section-recoveryDamage"]')).toBeTruthy();
    });
  });
});
