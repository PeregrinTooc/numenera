import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "lit-html";
import { BottomTextFields } from "@/components/BottomTextFields";
import { FULL_CHARACTER } from "@/data/mockCharacters";
import type { Character } from "@/types/character";
import { setupTestContainer } from "./helpers/testSetup";

describe("BottomTextFields", () => {
  const getContainer = setupTestContainer();
  let notes: HTMLTextAreaElement;

  beforeEach(() => {
    const character: Character = globalThis.structuredClone(FULL_CHARACTER);
    render(new BottomTextFields(character).renderNotes(), getContainer());
    notes = getContainer().querySelector<HTMLTextAreaElement>('[data-testid="character-notes"]')!;
  });

  it("makes a readonly field editable when pressed, before the press focuses it", () => {
    expect(notes.readOnly).toBe(true);

    notes.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));

    expect(notes.readOnly).toBe(false);
  });

  it("starts editing when the field takes focus, so leaving it saves and locks it", () => {
    const saved = vi.fn();
    getContainer().addEventListener("character-updated", saved);

    notes.focus();
    expect(notes.readOnly).toBe(false);
    notes.blur();

    expect(saved).toHaveBeenCalledOnce();
    expect(notes.readOnly).toBe(true);
  });
});
