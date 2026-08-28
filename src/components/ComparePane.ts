// ComparePane - one side of Comparison View: its own prev/next version
// arrows + counter + restore button, plus a read-only DiffCharacterSheet.
// A render()-returning helper composed into CompareView's template, the
// same pattern BasicInfo/Stats use inside CharacterSheet - no separate
// mount lifecycle needed since it owns no DOM-level state of its own.

import { html, TemplateResult } from "lit-html";
import type { Character } from "../types/character.js";
import type { CharacterDiff } from "../utils/characterDiff.js";
import { DiffCharacterSheet } from "./DiffCharacterSheet.js";
import { t } from "../i18n/index.js";

export interface ComparePaneProps {
  side: "left" | "right";
  character: Character;
  diff: CharacterDiff;
  /** 1-based version number, for the "Version X of Y" counter. */
  versionNumber: number;
  versionCount: number;
  onNavigateBackward: () => void;
  onNavigateForward: () => void;
  onRestore: () => void;
  /** false when this pane already shows the latest version. */
  canRestore: boolean;
}

export class ComparePane {
  constructor(private props: ComparePaneProps) {}

  render(): TemplateResult {
    const { side, character, diff, versionNumber, versionCount } = this.props;
    const isAtFirst = versionNumber <= 1;
    const isAtLast = versionNumber >= versionCount;
    const paneLabel =
      side === "left"
        ? t("versionHistory.compareView.leftPaneLabel")
        : t("versionHistory.compareView.rightPaneLabel");
    const counterText = t("versionHistory.versionCounter")
      .replace("{{current}}", String(versionNumber))
      .replace("{{total}}", String(versionCount));

    return html`
      <div data-testid="compare-pane-${side}" class="comparison-pane">
        <div class="comparison-pane-toolbar">
          <span class="comparison-pane-label">${paneLabel}</span>
          <div class="comparison-pane-nav">
            <button
              data-testid="compare-pane-${side}-backward"
              ?disabled=${isAtFirst}
              aria-label=${t("versionHistory.navigateBackward")}
              @click=${() => this.props.onNavigateBackward()}
            >
              ←
            </button>
            <span data-testid="compare-pane-${side}-counter" class="comparison-pane-counter"
              >${counterText}</span
            >
            <button
              data-testid="compare-pane-${side}-forward"
              ?disabled=${isAtLast}
              aria-label=${t("versionHistory.navigateForward")}
              @click=${() => this.props.onNavigateForward()}
            >
              →
            </button>
          </div>
          <button
            data-testid="compare-pane-${side}-restore"
            class="comparison-pane-restore"
            ?disabled=${!this.props.canRestore}
            @click=${() => this.props.onRestore()}
          >
            ${t("versionHistory.warningBanner.restoreButton")}
          </button>
        </div>
        ${new DiffCharacterSheet(character, diff).forSide(side).render()}
      </div>
    `;
  }
}
