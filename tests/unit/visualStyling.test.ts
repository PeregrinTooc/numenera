/**
 * Visual Styling Tests
 *
 * Covers visible content that item cards add for styling purposes (the
 * cypher ONE-USE warning badge). CSS class names are not asserted: they are
 * implementation, and computed styles belong in E2E tests.
 */

import { describe, it, expect } from "vitest";
import { render } from "lit-html";
import { CypherItem } from "@/components/CypherItem";
import type { Cypher } from "@/types/character";
import { setupTestContainer } from "./helpers/testSetup.js";

describe("Visual Styling Tests", () => {
  const getContainer = setupTestContainer();

  describe("Cypher Items - Blue Theme", () => {
    it("should render ONE-USE warning badge", () => {
      const cypher: Cypher = { name: "Test Cypher", level: "5", effect: "Test effect" };
      const cypherItem = new CypherItem(cypher, 0);
      render(cypherItem.render(), getContainer());

      const warningBadge = getContainer().querySelector('[data-testid="cypher-warning"]');
      expect(warningBadge).toBeTruthy();
      expect(warningBadge?.textContent).toContain("ONE-USE");
    });
  });
});
