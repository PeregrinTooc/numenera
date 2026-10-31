import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "lit-html";
import { ItemsBox } from "@/components/ItemsBox";
import type { Character } from "@/types/character";
import { setupTestContainer } from "./helpers/testSetup.js";
import { createTestCharacter } from "../factories/character";

/** jsdom has no real drag and drop, so dispatch plain bubbling events on the rendered items. */
function fire(target: HTMLElement, type: "dragstart" | "dragover" | "drop"): void {
  target.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
}

describe("ItemsBox drag and drop reordering", () => {
  const getContainer = setupTestContainer();
  let container: HTMLElement;
  let mockCharacter: Character;

  beforeEach(() => {
    container = getContainer();
    mockCharacter = createTestCharacter({
      equipment: [
        { name: "Sword", description: "Sharp" },
        { name: "Shield", description: "Strong" },
        { name: "Bow", description: "Long range" },
      ],
    });
  });

  function renderItems(): HTMLElement[] {
    const itemsBox = new ItemsBox(mockCharacter, vi.fn());
    render(itemsBox.render(), container);
    return Array.from(container.querySelectorAll<HTMLElement>('[data-testid="equipment-item"]'));
  }

  it("reassigns the collection immutably instead of mutating it in place", () => {
    const originalArray = mockCharacter.equipment;
    const items = renderItems();

    fire(items[0], "dragstart");
    fire(items[2], "dragover");
    fire(items[2], "drop");

    expect(mockCharacter.equipment).not.toBe(originalArray);
    expect(originalArray.map((i) => i.name)).toEqual(["Sword", "Shield", "Bow"]);
    expect(mockCharacter.equipment.map((i) => i.name)).toEqual(["Shield", "Bow", "Sword"]);
  });

  it("clears the preview order on drop so the re-rendered DOM order wins", () => {
    const items = renderItems();

    fire(items[0], "dragstart");
    fire(items[2], "dragover");
    expect(items.some((item) => item.style.order !== "")).toBe(true);

    fire(items[2], "drop");

    // The sheet re-renders into these very nodes, so a leftover flex `order`
    // would keep showing the pre-drop arrangement.
    expect(items.every((item) => item.style.order === "")).toBe(true);
  });
});
