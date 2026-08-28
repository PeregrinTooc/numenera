// CompareView - Comparison View container: two independent ComparePanes,
// a shared change-summary header, and an exit button. Each pane tracks its
// version by stable id (not raw array index) and resolves that id back to
// an index against the latest version list on every render, since a restore
// can evict the oldest version under the 99-version FIFO cap and shift
// every later index down by one (see versionState.ts).
//
// Deliberately never touches VersionState's own currentVersionIndex /
// displayedCharacter - it only calls the pure/explicit-index methods
// (getCharacterAtVersion, getVersionIdAtIndex, findVersionIndexById,
// restoreVersionAtIndex), so opening and closing Comparison View never
// disturbs the single-pane navigation state underneath it.

import { html, render, TemplateResult } from "lit-html";
import type { VersionState } from "../services/versionState.js";
import { diffCharacters } from "../utils/characterDiff.js";
import { describeDiff } from "../services/diffDescriptions.js";
import { ComparePane } from "./ComparePane.js";
import { t } from "../i18n/index.js";

export interface CompareViewProps {
  versionState: VersionState;
  initialLeftIndex: number;
  initialRightIndex: number;
  onExit: () => void;
  /** Called after a restore creates a new version, so the caller can refresh anything reading version count/position outside this view. */
  onRestored: () => void;
}

export class CompareView {
  private container: HTMLElement | null = null;
  private leftId: string;
  private rightId: string;

  constructor(private props: CompareViewProps) {
    this.leftId = props.versionState.getVersionIdAtIndex(props.initialLeftIndex);
    this.rightId = props.versionState.getVersionIdAtIndex(props.initialRightIndex);
  }

  mount(parent: HTMLElement): void {
    this.container = document.createElement("div");
    parent.appendChild(this.container);
    this.rerender();
  }

  unmount(): void {
    if (this.container?.parentElement) {
      this.container.parentElement.removeChild(this.container);
    }
    this.container = null;
  }

  private rerender(): void {
    if (this.container) {
      render(this.buildTemplate(), this.container);
    }
  }

  private async navigate(side: "left" | "right", direction: "backward" | "forward"): Promise<void> {
    const { versionState } = this.props;
    const currentId = side === "left" ? this.leftId : this.rightId;
    const currentIndex = versionState.findVersionIndexById(currentId);
    const targetIndex = direction === "backward" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= versionState.getVersionCount()) return;

    const targetId = versionState.getVersionIdAtIndex(targetIndex);
    if (side === "left") {
      this.leftId = targetId;
    } else {
      this.rightId = targetId;
    }
    this.rerender();
  }

  private async restore(side: "left" | "right"): Promise<void> {
    const { versionState } = this.props;
    const id = side === "left" ? this.leftId : this.rightId;
    const index = versionState.findVersionIndexById(id);
    if (index === -1) return; // evicted from history since this pane last rendered

    await versionState.restoreVersionAtIndex(index);
    // restoreVersionAtIndex appends a new version at the end; point the
    // restored pane at it so the counter/label reflect the new latest.
    const newIndex = versionState.getVersionCount() - 1;
    const newId = versionState.getVersionIdAtIndex(newIndex);
    if (side === "left") {
      this.leftId = newId;
    } else {
      this.rightId = newId;
    }
    this.props.onRestored();
    this.rerender();
  }

  private buildTemplate(): TemplateResult {
    const { versionState } = this.props;
    const leftIndex = versionState.findVersionIndexById(this.leftId);
    const rightIndex = versionState.findVersionIndexById(this.rightId);
    const versionCount = versionState.getVersionCount();

    // A pane's id can briefly be missing right after this.container is torn
    // down mid-await; guard defensively rather than throwing during render.
    if (leftIndex === -1 || rightIndex === -1) {
      return html``;
    }

    const leftCharacter = versionState.getCharacterAtVersion(leftIndex);
    const rightCharacter = versionState.getCharacterAtVersion(rightIndex);
    const diff = diffCharacters(leftCharacter, rightCharacter);
    const changeLines = describeDiff(diff);

    const leftPane = new ComparePane({
      side: "left",
      character: leftCharacter,
      diff,
      versionNumber: leftIndex + 1,
      versionCount,
      onNavigateBackward: () => this.navigate("left", "backward"),
      onNavigateForward: () => this.navigate("left", "forward"),
      onRestore: () => this.restore("left"),
      canRestore: leftIndex !== versionCount - 1,
    });
    const rightPane = new ComparePane({
      side: "right",
      character: rightCharacter,
      diff,
      versionNumber: rightIndex + 1,
      versionCount,
      onNavigateBackward: () => this.navigate("right", "backward"),
      onNavigateForward: () => this.navigate("right", "forward"),
      onRestore: () => this.restore("right"),
      canRestore: rightIndex !== versionCount - 1,
    });

    return html`
      <div data-testid="comparison-view" class="comparison-view">
        <div class="comparison-view-header">
          <div data-testid="comparison-header">
            <div class="comparison-view-changes-title">
              ${t("versionHistory.compareView.changesSummaryTitle")}
            </div>
            ${changeLines.length === 0
              ? html`<div
                  data-testid="comparison-view-no-changes"
                  class="comparison-view-no-changes"
                >
                  ${t("versionHistory.compareView.noDifferences")}
                </div>`
              : html`<ul class="comparison-view-changes-list">
                  ${changeLines.map((line) => html`<li>${line}</li>`)}
                </ul>`}
          </div>
          <button
            data-testid="comparison-exit-button"
            class="comparison-exit-button"
            @click=${() => this.props.onExit()}
          >
            ${t("versionHistory.compareView.exitButton")}
          </button>
        </div>
        <div class="comparison-view-panes">${leftPane.render()} ${rightPane.render()}</div>
      </div>
    `;
  }
}
