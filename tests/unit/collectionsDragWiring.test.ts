import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "lit-html";
import type { TemplateResult } from "lit-html";
import { CyphersBox } from "@/components/CyphersBox";
import { Abilities } from "@/components/Abilities";
import { Attacks } from "@/components/Attacks";
import { SpecialAbilities } from "@/components/SpecialAbilities";
import type { Character } from "@/types/character";
import { setupTestContainer } from "./helpers/testSetup.js";
import { createTestCharacter } from "../factories/character";

function fire(target: HTMLElement, type: "dragstart" | "dragover" | "drop"): void {
  target.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
}

interface Wiring {
  name: string;
  itemSelector: string;
  seed: Partial<Character>;
  mount: (character: Character) => { render: () => TemplateResult };
  read: (character: Character) => string[];
  updatedEvent: string;
}

const names = (items: { name: string }[]): string[] => items.map((i) => i.name);
const LABELS = ["A", "B", "C"];

const WIRINGS: Wiring[] = [
  {
    name: "CyphersBox",
    itemSelector: '[data-testid="cypher-item"]',
    seed: { cyphers: LABELS.map((name) => ({ name, level: "1", effect: "" })) },
    mount: (c) => new CyphersBox(c, vi.fn()),
    read: (c) => names(c.cyphers),
    updatedEvent: "cyphers-updated",
  },
  {
    name: "Abilities",
    itemSelector: '[data-testid^="ability-item"]',
    seed: {
      abilities: LABELS.map((name) => ({
        name,
        description: "",
        cost: 1,
        pool: "might" as const,
        action: "Action",
      })),
    },
    mount: (c) => new Abilities(c),
    read: (c) => names(c.abilities),
    updatedEvent: "collection-updated",
  },
  {
    name: "Attacks",
    itemSelector: '[data-testid="attack-item"]',
    seed: { attacks: LABELS.map((name) => ({ name, damage: 1, modifier: 0, range: "" })) },
    mount: (c) => new Attacks(c, vi.fn()),
    read: (c) => names(c.attacks),
    updatedEvent: "collection-updated",
  },
  {
    name: "SpecialAbilities",
    itemSelector: '[data-testid="special-ability-item"]',
    seed: { specialAbilities: LABELS.map((name) => ({ name, source: "", description: "" })) },
    mount: (c) => new SpecialAbilities(c),
    read: (c) => names(c.specialAbilities),
    updatedEvent: "collection-updated",
  },
];

describe.each(WIRINGS)("$name drag reordering wiring", (wiring) => {
  const getContainer = setupTestContainer();
  let container: HTMLElement;
  let character: Character;
  let updates: string[];

  beforeEach(() => {
    container = getContainer();
    const app = document.createElement("div");
    app.id = "app";
    document.body.appendChild(app);
    updates = [];
    app.addEventListener(wiring.updatedEvent, () => updates.push(wiring.updatedEvent));
    character = createTestCharacter(wiring.seed);
    render(wiring.mount(character).render(), container);
  });

  function items(): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(wiring.itemSelector));
  }

  it("reorders the collection and dispatches its update event", () => {
    fire(items()[0], "dragstart");
    fire(items()[2], "dragover");
    fire(items()[2], "drop");

    expect(wiring.read(character)).toEqual(["B", "C", "A"]);
    expect(updates).toEqual([wiring.updatedEvent]);
  });

  it("leaves the collection unchanged when a drop has no dragged index", () => {
    fire(items()[1], "drop");

    expect(wiring.read(character)).toEqual(["A", "B", "C"]);
    expect(updates).toEqual([]);
  });
});
