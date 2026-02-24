// CharacterSheet component - Main container that composes all sections

import { html, render, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { Header } from "./Header.js";
import { BasicInfo } from "./BasicInfo.js";
import { Stats } from "./Stats.js";
import { RecoveryRolls } from "./RecoveryRolls.js";
import { DamageTrack } from "./DamageTrack.js";
import { Abilities } from "./Abilities.js";
import { SpecialAbilities } from "./SpecialAbilities.js";
import { Attacks } from "./Attacks.js";
import { CyphersBox } from "./CyphersBox.js";
import { ItemsBox } from "./ItemsBox.js";
import { BottomTextFields } from "./BottomTextFields.js";
import { saveCharacterState } from "../storage/localStorage.js";
import { VersionNavigator } from "./VersionNavigator.js";
import { VersionWarningBanner } from "./VersionWarningBanner.js";
import { changeLanguage } from "../i18n/index.js";

export class CharacterSheet {
  private header: Header;
  private basicInfo: BasicInfo;
  private bottomTextFields: BottomTextFields;
  private itemsBox: ItemsBox;
  private attacks: Attacks;
  private cyphersBox: CyphersBox;
  private stats: Stats;
  private abilities: Abilities;
  private specialAbilities: SpecialAbilities;
  private versionNavigator: VersionNavigator | null = null;
  private versionWarningBanner: VersionWarningBanner | null = null;

  constructor(
    private character: Character,
    private onLoad: () => void,
    private onNew: () => void,
    private onImport: () => void,
    private onExport: () => void,
    private onFieldUpdate: (field: string, value: string | number) => void,
    private onQuickExport?: () => void,
    private onSaveAs?: () => void
  ) {
    // Create stateful components once to preserve their state across re-renders
    this.header = new Header(
      this.onLoad,
      this.onNew,
      this.onImport,
      this.onExport,
      this.onQuickExport,
      this.onSaveAs,
      (lang: string) => changeLanguage(lang)
    );
    this.basicInfo = new BasicInfo(this.character, this.onFieldUpdate);
    this.bottomTextFields = new BottomTextFields(this.character);
    this.itemsBox = new ItemsBox(this.character, this.onFieldUpdate);
    // Attacks component uses event-based pattern for updates/deletes
    this.attacks = new Attacks(this.character, this.onFieldUpdate);
    this.cyphersBox = new CyphersBox(this.character, this.onFieldUpdate);
    this.stats = new Stats(this.character, this.onFieldUpdate);

    // Create abilities and specialAbilities using event-based pattern
    // These use CollectionBehavior helpers which handle immutable updates
    // for proper version history undo support
    this.abilities = new Abilities(this.character);
    this.specialAbilities = new SpecialAbilities(this.character);
  }

  /**
   * Mount version navigator to a container
   */
  mountVersionNavigator(
    container: HTMLElement,
    versionCount: number,
    currentIndex: number,
    onNavigateBackward: () => void,
    onNavigateForward: () => void
  ): void {
    this.versionNavigator = new VersionNavigator({
      versionCount,
      currentIndex,
      onNavigateBackward,
      onNavigateForward,
    });
    this.versionNavigator.mount(container);
  }

  /**
   * Update version navigator with new props
   */
  updateVersionNavigator(
    versionCount: number,
    currentIndex: number,
    onNavigateBackward: () => void,
    onNavigateForward: () => void
  ): void {
    if (this.versionNavigator) {
      this.versionNavigator.update({
        versionCount,
        currentIndex,
        onNavigateBackward,
        onNavigateForward,
      });
    }
  }

  /**
   * Mount version warning banner to a container
   */
  mountVersionWarningBanner(
    container: HTMLElement,
    description: string,
    timestamp: Date,
    onReturn: () => void,
    onRestore: () => void
  ): void {
    this.versionWarningBanner = new VersionWarningBanner({
      description,
      timestamp,
      onReturn,
      onRestore,
    });
    this.versionWarningBanner.mount(container);
  }

  /**
   * Unmount version warning banner
   */
  unmountVersionWarningBanner(): void {
    if (this.versionWarningBanner) {
      this.versionWarningBanner.unmount();
      this.versionWarningBanner = null;
    }
  }

  /**
   * Set whether the user is viewing an old version
   * Triggers a re-render to update the header buttons
   */
  setIsViewingOldVersion(isViewing: boolean): void {
    this.header.setIsViewingOldVersion(isViewing);
    // Trigger re-render to update button state
    const app = document.getElementById("app");
    if (app) {
      render(this.render(), app);
    }
  }

  render(): TemplateResult {
    // Create stateless components that don't need to preserve state
    const recoveryRolls = new RecoveryRolls(this.character.recoveryRolls, (field, value) => {
      if (field === "recoveryModifier") {
        this.character.recoveryRolls.modifier = value;
        saveCharacterState(this.character);
        // Dispatch character-updated for auto-save
        const app = document.getElementById("app");
        if (app) {
          app.dispatchEvent(new CustomEvent("character-updated"));
          // Dispatch recovery-updated for targeted re-render
          app.dispatchEvent(new CustomEvent("recovery-updated"));
        }
      }
    });
    const damageTrack = new DamageTrack(this.character.damageTrack);

    // Note: abilities and specialAbilities are now stateful components created in constructor

    return html`
      <div class="min-h-screen p-4">
        <div class="max-w-6xl mx-auto shadow rounded-lg p-6 parchment-container">
          ${this.header.render()} ${this.basicInfo.render()} ${this.stats.render()}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            ${recoveryRolls.render()} ${damageTrack.render()}
          </div>
          ${this.abilities.render()}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            ${this.specialAbilities.render()} ${this.attacks.render()}
          </div>
          ${this.cyphersBox.render()} ${this.itemsBox.render()}
          <div data-testid="text-fields-section" class="mt-8">
            ${this.bottomTextFields.render()}
          </div>
        </div>
      </div>
    `;
  }
}
