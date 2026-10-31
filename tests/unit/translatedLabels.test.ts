import { afterEach, describe, expect, it } from "vitest";
import { render } from "lit-html";
import { changeLanguage, t } from "@/i18n/index";
import { CypherItem } from "@/components/CypherItem";
import { StatPool } from "@/components/StatPool";
import { setupTestContainer } from "./helpers/testSetup.js";

describe("Translated labels", () => {
  const getContainer = setupTestContainer();

  afterEach(async () => {
    await changeLanguage("en");
  });

  it("renders the one-use warning in the active language", async () => {
    await changeLanguage("de");
    const cypher = new CypherItem({ name: "Test", level: "1", effect: "Effect" }, 0);
    render(cypher.render(), getContainer());

    const badge = getContainer().querySelector('[data-testid="cypher-warning"]');
    expect(badge?.textContent).toContain(t("cyphers.oneUse"));
    expect(badge?.textContent).not.toContain("ONE-USE");
  });

  it("names the stat in the stat pool's edit labels in the active language", async () => {
    await changeLanguage("de");
    const pool = new StatPool("might", { pool: 10, edge: 1, current: 8 }, () => {});
    render(pool.render(), getContainer());

    const label = getContainer().querySelector('[data-testid="stat-might-pool"]');
    expect(label?.getAttribute("aria-label")).toBe(t("stats.editPool", { name: t("stats.might") }));
    expect(label?.getAttribute("aria-label")).not.toContain("Edit");
  });
});
