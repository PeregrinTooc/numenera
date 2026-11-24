import { render, type TemplateResult } from "lit-html";
import { fireEvent, screen } from "@testing-library/dom";
import { Abilities } from "@/components/Abilities";
import { Attacks } from "@/components/Attacks";
import { CyphersBox } from "@/components/CyphersBox";
import { ItemsBox } from "@/components/ItemsBox";
import { SpecialAbilities } from "@/components/SpecialAbilities";
import { clearCharacterState } from "@/storage/storageFactory";
import type { Character } from "@/types/character";
import { createTestCharacter } from "../factories/character.js";
import { setupTestContainer } from "./helpers/testSetup.js";

type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

interface NewCardCase {
  kind: string;
  collection:
    | "cyphers"
    | "equipment"
    | "artifacts"
    | "oddities"
    | "attacks"
    | "abilities"
    | "specialAbilities";
  section: (character: Character) => { render: () => TemplateResult };
  /** Fields that start at a value rather than blank, by test id. */
  startValues?: Record<string, string>;
}

const CASES: NewCardCase[] = [
  { kind: "cypher", collection: "cyphers", section: (c) => new CyphersBox(c, vi.fn()) },
  { kind: "equipment", collection: "equipment", section: (c) => new ItemsBox(c, vi.fn()) },
  { kind: "artifact", collection: "artifacts", section: (c) => new ItemsBox(c, vi.fn()) },
  { kind: "oddity", collection: "oddities", section: (c) => new ItemsBox(c, vi.fn()) },
  {
    kind: "attack",
    collection: "attacks",
    section: (c) => new Attacks(c, vi.fn()),
    startValues: { "edit-attack-damage": "0", "edit-attack-modifier": "0" },
  },
  { kind: "ability", collection: "abilities", section: (c) => new Abilities(c) },
  {
    kind: "special-ability",
    collection: "specialAbilities",
    section: (c) => new SpecialAbilities(c),
  },
];

describe.each(CASES)("Starting a new $kind", ({ kind, collection, section, startValues = {} }) => {
  const getContainer = setupTestContainer();
  let character: Character;

  function editorFields(): FieldElement[] {
    return [
      ...screen
        .getByTestId("card-edit-modal")
        .querySelectorAll<FieldElement>("input, textarea, select"),
    ];
  }

  beforeEach(async () => {
    await clearCharacterState();
    character = createTestCharacter();
    render(section(character).render(), getContainer());
    fireEvent.click(screen.getByTestId(`add-${kind}-button`));
  });

  it("opens the editor with every field empty", () => {
    const fields = editorFields();
    expect(fields.length).toBeGreaterThan(0);
    for (const field of fields) {
      expect(field.value, field.dataset.testid).toBe(startValues[field.dataset.testid ?? ""] ?? "");
    }
  });

  it("adds no card when cancelled after filling it in", () => {
    const before = character[collection];
    const [first] = editorFields();
    fireEvent.input(first, { target: { value: "Never saved" } });

    fireEvent.click(screen.getByTestId("card-modal-cancel"));

    expect(screen.queryByTestId("card-edit-modal")).toBeNull();
    expect(character[collection]).toEqual(before);
  });
});
