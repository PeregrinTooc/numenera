import { html, svg, TemplateResult } from "lit-html";
import { t } from "@/i18n/index";
import type { ColumnCount } from "@/types/sectionColumns";

/**
 * Keeps a press on the switch from reaching its section, whose touchstart
 * would otherwise begin a long-press section drag. Passive, as the section's
 * own touchstart listener is: it never blocks scrolling.
 */
const stopTouchStart = {
  handleEvent: (e: Event): void => e.stopPropagation(),
  passive: true,
};

/**
 * Render the layout-edit-mode button that switches a card section between
 * one and two columns. Its icon shows the current setting (one bar or two);
 * its label says what pressing it will do.
 */
export function renderSectionColumnsButton(
  columns: ColumnCount,
  onToggle: () => void
): TemplateResult {
  const label = columns === 2 ? t("layout.columns.showOne") : t("layout.columns.showTwo");

  return html`
    <button
      type="button"
      class="section-columns-button"
      data-testid="section-columns-button"
      aria-pressed=${columns === 2 ? "true" : "false"}
      aria-label=${label}
      title=${label}
      @touchstart=${stopTouchStart}
      @click=${(e: Event) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <svg class="section-columns-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        ${columns === 2
          ? svg`<rect x="4" y="4" width="7" height="16" rx="1"></rect>
              <rect x="13" y="4" width="7" height="16" rx="1"></rect>`
          : svg`<rect x="6" y="4" width="12" height="16" rx="1"></rect>`}
      </svg>
    </button>
  `;
}
