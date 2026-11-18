import { englishText } from "./i18nKeys.js";
import {
  TRANSLATED_ELEMENTS,
  type LanguageDriver,
  type TranslatedElement,
} from "./languageDriver.js";

export interface ShownText {
  part: string;
  text: string;
}

function isTranslatedElement(part: string): part is TranslatedElement {
  return (TRANSLATED_ELEMENTS as readonly string[]).includes(part);
}

const GERMAN_TITLE = "Numenera Charakterbogen";

export class LanguageDsl {
  constructor(private language: LanguageDriver) {}

  async opensTheSheetInLanguage(language: string): Promise<void> {
    await this.language.open(`?lang=${language}`);
  }

  async opensTheSheetWith(queryString: string): Promise<void> {
    await this.language.open(queryString);
  }

  async expectTitleInEnglish(): Promise<void> {
    await this.language.expectText("page title", englishText("app.title"));
  }

  async expectTitleInGerman(): Promise<void> {
    await this.language.expectText("page title", GERMAN_TITLE);
  }

  async expectShowsAll(rows: ShownText[]): Promise<void> {
    for (const { part, text } of rows) {
      if (!isTranslatedElement(part)) throw new Error(`The sheet has no part called "${part}"`);
      await this.language.expectText(part, text);
    }
  }

  async expectDeclaredLanguage(language: string): Promise<void> {
    await this.language.expectDeclaredLanguage(language);
  }
}
