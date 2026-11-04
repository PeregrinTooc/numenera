import { html, TemplateResult } from "lit-html";
import { ifDefined } from "lit-html/directives/if-defined.js";

/** Color themes of the card edit forms. */
export type CardFormTheme = "indigo" | "purple" | "teal" | "red" | "green";

interface CardFormThemeClasses {
  label: string;
  input: string;
  textarea: string;
}

/**
 * Complete, literal Tailwind class strings per color theme. Tailwind only
 * generates CSS for class names it finds as literal text during its
 * build-time scan - `` `text-${theme}-900` `` never produces generated
 * CSS no matter what theme is at runtime, so every combination needed
 * has to appear here in full.
 */
const THEME_CLASSES: Record<CardFormTheme, CardFormThemeClasses> = {
  indigo: {
    label: "block text-sm font-medium text-indigo-900 mb-1",
    input:
      "w-full bg-transparent border-b-2 border-indigo-300 focus:border-indigo-500 px-2 py-1 text-indigo-900 font-semibold",
    textarea:
      "w-full bg-transparent border-b-2 border-indigo-300 focus:border-indigo-500 px-2 py-1 text-gray-700",
  },
  purple: {
    label: "block text-sm font-medium text-purple-900 mb-1",
    input:
      "w-full bg-transparent border-b-2 border-purple-300 focus:border-purple-500 px-2 py-1 text-purple-900 font-semibold",
    textarea:
      "w-full bg-transparent border-b-2 border-purple-300 focus:border-purple-500 px-2 py-1 text-gray-700",
  },
  teal: {
    label: "block text-sm font-medium text-teal-900 mb-1",
    input:
      "w-full bg-transparent border-b-2 border-teal-300 focus:border-teal-500 px-2 py-1 text-teal-900 font-semibold",
    textarea:
      "w-full bg-transparent border-b-2 border-teal-300 focus:border-teal-500 px-2 py-1 text-gray-700",
  },
  red: {
    label: "block text-sm font-medium text-red-900 mb-1",
    input:
      "w-full bg-transparent border-b-2 border-red-300 focus:border-red-500 px-2 py-1 text-red-900 font-semibold",
    textarea:
      "w-full bg-transparent border-b-2 border-red-300 focus:border-red-500 px-2 py-1 text-gray-700",
  },
  green: {
    label: "block text-sm font-medium text-green-900 mb-1",
    input:
      "w-full bg-transparent border-b-2 border-green-300 focus:border-green-500 px-2 py-1 text-green-900 font-semibold",
    textarea:
      "w-full bg-transparent border-b-2 border-green-300 focus:border-green-500 px-2 py-1 text-gray-700",
  },
};

/** The class string of a themed single-line control (input, select). */
export function cardInputClass(theme: CardFormTheme): string {
  return THEME_CLASSES[theme].input;
}

/**
 * Wraps a control in its label. Stacked fields sit in a `mb-3` block; grid fields
 * are plain cells of a surrounding grid.
 */
export function renderLabeledField(config: {
  theme: CardFormTheme;
  label: string;
  control: TemplateResult;
  grid?: boolean;
}): TemplateResult {
  const { theme, label, control, grid } = config;
  const labelTemplate = html` <label class="${THEME_CLASSES[theme].label}"> ${label} </label> `;
  return grid
    ? html`<div>${labelTemplate}${control}</div>`
    : html`<div class="mb-3">${labelTemplate}${control}</div>`;
}

interface FieldConfig {
  theme: CardFormTheme;
  label: string;
  testId: string;
  value: string;
  onInput: (value: string) => void;
  placeholder?: string;
  grid?: boolean;
}

/** A labeled single-line input. */
export function renderTextField(
  config: FieldConfig & { type?: "text" | "number"; min?: string }
): TemplateResult {
  const { theme, label, testId, value, onInput, placeholder, grid, type = "text", min } = config;
  return renderLabeledField({
    theme,
    label,
    grid,
    control: html`
      <input
        type="${type}"
        .value=${value}
        @input=${(e: Event) => onInput((e.target as HTMLInputElement).value)}
        class="${THEME_CLASSES[theme].input}"
        min=${ifDefined(min)}
        placeholder=${ifDefined(placeholder)}
        data-testid="${testId}"
      />
    `,
  });
}

/** A labeled multi-line textarea. */
export function renderTextArea(config: FieldConfig & { rows?: number }): TemplateResult {
  const { theme, label, testId, value, onInput, placeholder, grid, rows = 3 } = config;
  return renderLabeledField({
    theme,
    label,
    grid,
    control: html`
      <textarea
        .value=${value}
        @input=${(e: Event) => onInput((e.target as HTMLTextAreaElement).value)}
        class="${THEME_CLASSES[theme].textarea}"
        rows="${rows}"
        placeholder=${ifDefined(placeholder)}
        data-testid="${testId}"
      ></textarea>
    `,
  });
}
