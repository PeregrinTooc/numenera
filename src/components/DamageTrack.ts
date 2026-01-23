import { html, TemplateResult } from "lit-html";
import { DamageTrack as DamageTrackType } from "../types/character.js";
import { t } from "../i18n/index.js";

export class DamageTrack {
  constructor(private data: DamageTrackType) {}

  render(): TemplateResult {
    const { impairment } = this.data;

    return html`
      <div
        data-testid="damage-track-section"
        class="damage-track-section bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-lg p-4 shadow-sm"
      >
        <h3 class="text-lg font-bold font-serif mb-4 text-red-900">${t("damage.title")}</h3>

        <!-- Damage Status Radio Buttons -->
        <div class="space-y-3">
          <!-- Healthy -->
          <label
            class="flex items-start gap-3 cursor-pointer hover:bg-red-50 p-2 rounded transition-colors"
          >
            <input
              type="radio"
              name="damage-track"
              data-testid="damage-healthy"
              value="healthy"
              ?checked=${impairment === "healthy"}
              class="damage-radio mt-1 w-5 h-5 text-green-600 border-green-400 focus:ring-green-500"
            />
            <div class="flex-1">
              <span class="font-serif text-sm font-semibold text-green-700">
                ${t("damage.healthy")}
              </span>
            </div>
          </label>

          <!-- Impaired -->
          <label
            class="flex items-start gap-3 cursor-pointer hover:bg-red-50 p-2 rounded transition-colors"
          >
            <input
              type="radio"
              name="damage-track"
              data-testid="damage-impaired"
              value="impaired"
              ?checked=${impairment === "impaired"}
              class="damage-radio mt-1 w-5 h-5 text-yellow-600 border-yellow-400 focus:ring-yellow-500"
            />
            <div class="flex-1">
              <span class="font-serif text-sm font-semibold text-yellow-700">
                ${t("damage.impaired")}
              </span>
              <span class="block font-serif text-xs text-yellow-600 mt-1">
                (${t("damage.impairedDesc")})
              </span>
            </div>
          </label>

          <!-- Debilitated -->
          <label
            class="flex items-start gap-3 cursor-pointer hover:bg-red-50 p-2 rounded transition-colors"
          >
            <input
              type="radio"
              name="damage-track"
              data-testid="damage-debilitated"
              value="debilitated"
              ?checked=${impairment === "debilitated"}
              class="damage-radio mt-1 w-5 h-5 text-red-600 border-red-400 focus:ring-red-500"
            />
            <div class="flex-1">
              <span class="font-serif text-sm font-semibold text-red-700">
                ${t("damage.debilitated")}
              </span>
              <span class="block font-serif text-xs text-red-600 mt-1">
                (${t("damage.debilitatedDesc")})
              </span>
            </div>
          </label>
        </div>
      </div>
    `;
  }
}
