// CollectionDragReorder - drag-and-drop reordering of one card collection rendered in a list.
// Owns the drag state and the dragstart/dragover/drop/dragend semantics for a single section.

import { reorderArray, previewOrderEquals } from "./DragDropBehavior.js";

export interface CollectionDragReorderConfig {
  /** Section name; also the collection-updated detail and the `<section>-list` test id prefix */
  section: string;
  /** data-testid of each draggable item element */
  itemTestId: string;
  /** Reads the current collection */
  getCollection: () => unknown[];
  /** Replaces the collection with the reordered one */
  setCollection: (items: unknown[]) => void;
}

interface DragState {
  draggedIndex: number | null;
  previewOrder: number[] | null;
  currentTargetIndex: number | null;
}

const IDLE_STATE: DragState = { draggedIndex: null, previewOrder: null, currentTargetIndex: null };

export class CollectionDragReorder {
  private state: DragState = { ...IDLE_STATE };

  constructor(private config: CollectionDragReorderConfig) {}

  private itemSelector(): string {
    return `[data-testid='${this.config.itemTestId}']`;
  }

  private findItem(e: Event): HTMLElement | null {
    return (e.target as HTMLElement).closest(this.itemSelector());
  }

  handleDragStart(e: Event): void {
    const dragEvent = e as globalThis.DragEvent;
    const item = this.findItem(dragEvent);
    if (item) {
      const index = parseInt(item.dataset.index || "0", 10);
      this.state.draggedIndex = index;
      this.state.previewOrder = null;
      dragEvent.dataTransfer?.setData("text/plain", index.toString());
      item.setAttribute("data-dragging", "true");
    }
  }

  handleDragOver(e: Event): void {
    e.preventDefault();
    const state = this.state;
    if (state.draggedIndex === null) return;

    const item = this.findItem(e);
    if (!item) return;

    const targetIndex = parseInt(item.dataset.index || "0", 10);
    if (state.draggedIndex === targetIndex) return;

    state.currentTargetIndex = targetIndex;

    const newOrder = this.calculatePreviewOrder(
      state.draggedIndex,
      targetIndex,
      this.config.getCollection().length
    );
    if (!previewOrderEquals(state.previewOrder, newOrder)) {
      state.previewOrder = newOrder;
      this.applyPreviewOrder();
    }
  }

  handleDrop(e: Event): void {
    e.preventDefault();
    const state = this.state;

    // A drag that started in another section leaves this section's state
    // untouched, so a null index means the drag is not ours. Decided from
    // component state because WebKit drops custom dataTransfer types.
    const draggedIndex = state.draggedIndex;
    if (draggedIndex === null) {
      this.handleDragEnd();
      return;
    }

    let targetIndex = state.currentTargetIndex;
    if (targetIndex === null) {
      const item = this.findItem(e);
      if (!item) {
        this.handleDragEnd();
        return;
      }
      targetIndex = parseInt(item.dataset.index || "0", 10);
    }

    if (draggedIndex === targetIndex) {
      this.handleDragEnd();
      return;
    }

    // Reorder the array immutably, matching the other collections
    this.config.setCollection(reorderArray(this.config.getCollection(), draggedIndex, targetIndex));

    this.handleDragEnd();

    // Dispatch collection-updated to re-render the sheet
    // Dispatch character-updated for save
    const appElement = document.getElementById("app");
    if (appElement) {
      appElement.dispatchEvent(
        new CustomEvent("collection-updated", { detail: { section: this.config.section } })
      );
      appElement.dispatchEvent(new CustomEvent("character-updated"));
    }
  }

  handleDragEnd(): void {
    document.querySelectorAll(this.itemSelector()).forEach((item) => {
      item.removeAttribute("data-dragging");
      // Always drop the preview `order`: the sheet re-renders into these same
      // nodes in the new array order, so a leftover override would keep
      // showing the pre-drop arrangement.
      (item as HTMLElement).style.order = "";
    });
    this.state = { ...IDLE_STATE };
  }

  private calculatePreviewOrder(fromIndex: number, toIndex: number, length: number): number[] {
    const indices = Array.from({ length }, (_, i) => i);
    const [removed] = indices.splice(fromIndex, 1);
    indices.splice(toIndex, 0, removed);
    return indices;
  }

  private applyPreviewOrder(): void {
    if (!this.state.previewOrder) return;

    const container = document.querySelector(`[data-testid='${this.config.section}-list']`);
    if (!container) return;

    const items = Array.from(container.querySelectorAll(this.itemSelector()));
    this.state.previewOrder.forEach((originalIndex, visualPosition) => {
      const item = items.find(
        (el) => parseInt((el as HTMLElement).dataset.index || "0", 10) === originalIndex
      );
      if (item) {
        (item as HTMLElement).style.order = visualPosition.toString();
      }
    });
  }
}
