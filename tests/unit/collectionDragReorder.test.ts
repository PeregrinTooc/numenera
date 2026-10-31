import { describe, it, expect, beforeEach } from "vitest";
import { CollectionDragReorder } from "@/components/helpers/CollectionDragReorder";
import type { CollectionDragReorderConfig } from "@/components/helpers/CollectionDragReorder";

function fire(target: HTMLElement, type: "dragstart" | "dragover" | "drop"): void {
  target.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
}

describe("CollectionDragReorder", () => {
  let collection: string[];
  let app: HTMLElement;
  let events: { name: string; detail: unknown }[];

  beforeEach(() => {
    collection = ["a", "b", "c"];
    document.body.innerHTML = '<div id="app"></div>';
    app = document.getElementById("app") as HTMLElement;
    events = [];
    for (const name of ["collection-updated", "cyphers-updated", "character-updated"]) {
      app.addEventListener(name, (e) => events.push({ name, detail: (e as CustomEvent).detail }));
    }
  });

  function setup(
    options: Partial<CollectionDragReorderConfig> = {},
    itemTestIds: string[] = ["thing-item", "thing-item", "thing-item"],
    listTestId = "things-list"
  ): { drag: CollectionDragReorder; items: HTMLElement[] } {
    const list = document.createElement("div");
    list.dataset.testid = listTestId;
    itemTestIds.forEach((testId, index) => {
      const item = document.createElement("div");
      item.dataset.testid = testId;
      item.dataset.index = String(index);
      list.appendChild(item);
    });
    app.appendChild(list);
    const drag = new CollectionDragReorder({
      section: "things",
      itemTestId: "thing-item",
      getCollection: () => collection,
      setCollection: (items) => (collection = items as string[]),
      ...options,
    });
    list.addEventListener("dragstart", (e) => drag.handleDragStart(e));
    list.addEventListener("dragover", (e) => drag.handleDragOver(e));
    list.addEventListener("drop", (e) => drag.handleDrop(e));
    list.addEventListener("dragend", () => drag.handleDragEnd());
    return { drag, items: Array.from(list.children) as HTMLElement[] };
  }

  it("leaves the collection unchanged when a drop has no dragged index", () => {
    const { items } = setup();
    const before = collection;

    fire(items[1], "drop");

    expect(collection).toBe(before);
    expect(events).toEqual([]);
  });

  it("reorders and dispatches collection-updated with the section by default", () => {
    const { items } = setup();

    fire(items[0], "dragstart");
    fire(items[2], "dragover");
    fire(items[2], "drop");

    expect(collection).toEqual(["b", "c", "a"]);
    expect(events).toEqual([
      { name: "collection-updated", detail: { section: "things" } },
      { name: "character-updated", detail: null },
    ]);
  });

  it("dispatches the configured updatedEvent instead of collection-updated", () => {
    const { items } = setup({ updatedEvent: "cyphers-updated" });

    fire(items[0], "dragstart");
    fire(items[1], "drop");

    expect(collection).toEqual(["b", "a", "c"]);
    expect(events.map((e) => e.name)).toEqual(["cyphers-updated", "character-updated"]);
  });

  it("matches item test ids by prefix when matchItemTestIdPrefix is set", () => {
    const { items } = setup({ itemTestId: "thing-item", matchItemTestIdPrefix: true }, [
      "thing-item-x",
      "thing-item-y",
      "thing-item-z",
    ]);

    fire(items[0], "dragstart");
    fire(items[2], "dragover");
    expect(items[0].getAttribute("data-dragging")).toBe("true");
    expect(items[2].style.order).toBe("1");
    fire(items[2], "drop");

    expect(collection).toEqual(["b", "c", "a"]);
    expect(items.every((i) => i.style.order === "")).toBe(true);
  });

  it("does not match suffixed test ids without matchItemTestIdPrefix", () => {
    const { items } = setup({}, ["thing-item-x", "thing-item-y", "thing-item-z"]);
    const before = collection;

    fire(items[0], "dragstart");
    fire(items[1], "drop");

    expect(collection).toBe(before);
  });

  it("previews inside the list found by listTestId", () => {
    const { items } = setup(
      { listTestId: "special-things-list" },
      undefined,
      "special-things-list"
    );

    fire(items[0], "dragstart");
    fire(items[2], "dragover");

    expect(items[2].style.order).toBe("1");
  });
});
