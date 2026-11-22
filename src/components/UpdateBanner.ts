import { html, TemplateResult } from "lit-html";
import { t } from "@/i18n/index";

export class UpdateBanner {
  constructor(private readonly onReload: () => void) {}

  render(): TemplateResult {
    return html`
      <div class="update-banner" role="status" data-testid="update-banner">
        ${t("update.available")}
        <button type="button" data-testid="update-reload-button" @click=${this.onReload}>
          ${t("update.reload")}
        </button>
      </div>
    `;
  }
}
