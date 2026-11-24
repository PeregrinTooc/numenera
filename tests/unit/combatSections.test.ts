import { render } from "lit-html";
import { screen } from "@testing-library/dom";
import { Attacks } from "@/components/Attacks";
import { SpecialAbilities } from "@/components/SpecialAbilities";
import { t } from "@/i18n/index";
import type { Attack, SpecialAbility } from "@/types/character";
import { createTestCharacter } from "../factories/character.js";
import { setupTestContainer } from "./helpers/testSetup.js";

function shownText(testId: string): string {
  return (screen.getByTestId(testId).textContent ?? "").replace(/\s+/g, " ").trim();
}

describe("Attacks section", () => {
  const getContainer = setupTestContainer();

  function showAttacks(attacks: Attack[], armor = 0): void {
    render(new Attacks(createTestCharacter({ attacks, armor }), vi.fn()).render(), getContainer());
  }

  it("shows every property of an attack", () => {
    showAttacks([
      { name: "Broadsword", damage: 6, modifier: 2, range: "Short", notes: "Notched blade" },
    ]);

    expect(shownText("attack-name-Broadsword")).toBe("Broadsword");
    expect(shownText("attack-damage-0")).toBe(`${t("attacks.damage")}: 6`);
    expect(shownText("attack-modifier-0")).toBe(`${t("attacks.modifier")}: +2`);
    expect(shownText("attack-range-0")).toBe(`${t("attacks.range")}: Short`);
    expect(shownText("attack-notes-0")).toBe("Notched blade");
  });

  it("shows a zero modifier without a sign and leaves out missing notes", () => {
    showAttacks([{ name: "Crossbow", damage: 4, modifier: 0, range: "Long" }]);

    expect(shownText("attack-modifier-0")).toBe(`${t("attacks.modifier")}: 0`);
    expect(screen.queryByTestId("attack-notes-0")).toBeNull();
  });

  it("themes an attack card red", () => {
    showAttacks([{ name: "Broadsword", damage: 6, modifier: 2, range: "Short" }]);

    expect(screen.getByTestId("attack-item").className).toMatch(/\bfrom-red-50\b/);
  });

  it("shows the character's armor beside the attacks", () => {
    showAttacks([], 2);

    expect(shownText("armor-value")).toBe("2");
  });

  it("says when there are no attacks", () => {
    showAttacks([]);

    expect(shownText("empty-attacks")).toBe(t("attacks.empty"));
  });
});

describe("Special abilities section", () => {
  const getContainer = setupTestContainer();

  function showSpecialAbilities(specialAbilities: SpecialAbility[]): void {
    render(
      new SpecialAbilities(createTestCharacter({ specialAbilities })).render(),
      getContainer()
    );
  }

  it("shows a special ability's description and source", () => {
    showSpecialAbilities([
      {
        name: "Lightning Bolt",
        source: "Storm Lens artifact",
        description: "Arcs to three targets",
      },
    ]);

    expect(shownText("special-ability-name-Lightning Bolt")).toBe("Lightning Bolt");
    expect(shownText("special-ability-description-0")).toBe("Arcs to three targets");
    expect(shownText("special-ability-source-0")).toBe("Storm Lens artifact");
  });

  it("themes a special ability card teal", () => {
    showSpecialAbilities([{ name: "Fire Affinity", source: "Focus", description: "Fire" }]);

    expect(screen.getByTestId("special-ability-item").className).toMatch(/\bfrom-cyan-50\b/);
  });

  it("says when there are no special abilities", () => {
    showSpecialAbilities([]);

    expect(shownText("empty-special-abilities")).toBe(t("specialAbilities.empty"));
  });
});
