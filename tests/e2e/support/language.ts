import { englishText } from "./i18nKeys.js";
import type { LanguageDriver, LevelLabelled, TranslatedElement } from "./languageDriver.js";

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

  async expectShows(element: TranslatedElement, text: string): Promise<void> {
    await this.language.expectText(element, text);
  }

  async expectStatsSectionMentions(text: string): Promise<void> {
    await this.language.expectStatsSectionMentions(text);
  }

  async expectStatsLabel(text: string): Promise<void> {
    await this.language.expectStatsLabel(text);
  }

  async expectLevelLabel(card: LevelLabelled, text: string): Promise<void> {
    await this.language.expectLevelLabel(card, text);
  }

  async expectDeclaredLanguage(language: string): Promise<void> {
    await this.language.expectDeclaredLanguage(language);
  }
}
