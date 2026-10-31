// The section components of the character sheet and how they are rendered.

import { html, render, TemplateResult } from "lit-html";
import { Character } from "@/types/character";
import { SectionId } from "@/types/layout";
import { BasicInfo } from "@/components/BasicInfo";
import { Stats } from "@/components/Stats";
import { RecoveryDamageSection } from "@/components/RecoveryDamageSection";
import { Abilities } from "@/components/Abilities";
import { SpecialAbilities } from "@/components/SpecialAbilities";
import { Attacks } from "@/components/Attacks";
import { CyphersBox } from "@/components/CyphersBox";
import { ItemsBox } from "@/components/ItemsBox";
import { BottomTextFields } from "@/components/BottomTextFields";

/**
 * Sections backed by a CollectionBehavior component. Each one is mounted into
 * its own lit-html root so it can be re-rendered on its own, without diffing
 * the rest of the sheet.
 */
const COLLECTION_SECTION_IDS = [
  "cyphers",
  "abilities",
  "specialAbilities",
  "attacks",
  "items",
] as const;

type CollectionSectionId = (typeof COLLECTION_SECTION_IDS)[number];

function isCollectionSection(sectionId: SectionId): sectionId is CollectionSectionId {
  return (COLLECTION_SECTION_IDS as readonly SectionId[]).includes(sectionId);
}

export class SheetSections {
  private basicInfo: BasicInfo;
  private bottomTextFields: BottomTextFields;
  private itemsBox: ItemsBox;
  private attacks: Attacks;
  private cyphersBox: CyphersBox;
  private stats: Stats;
  private abilities: Abilities;
  private specialAbilities: SpecialAbilities;
  private recoveryDamageSection: RecoveryDamageSection;

  constructor(
    character: Character,
    onFieldUpdate: (field: string, value: string | number) => void
  ) {
    // Create stateful components once to preserve their state across re-renders
    this.basicInfo = new BasicInfo(character, onFieldUpdate);
    this.bottomTextFields = new BottomTextFields(character);
    this.itemsBox = new ItemsBox(character, onFieldUpdate);
    // Attacks component uses event-based pattern for updates/deletes
    this.attacks = new Attacks(character, onFieldUpdate);
    this.cyphersBox = new CyphersBox(character, onFieldUpdate);
    this.stats = new Stats(character, onFieldUpdate);

    // Create abilities and specialAbilities using event-based pattern
    // These use CollectionBehavior helpers which handle immutable updates
    // for proper version history undo support
    this.abilities = new Abilities(character);
    this.specialAbilities = new SpecialAbilities(character);
    this.recoveryDamageSection = new RecoveryDamageSection(character);
  }

  /**
   * Get the template for a specific section.
   *
   * Collection sections contribute an empty host element instead of their
   * content: `mountCollectionSections()` fills each host from its own
   * lit-html root, so the sheet's template never owns those nodes. `contents`
   * keeps the host out of the layout entirely.
   */
  getSectionTemplate(sectionId: SectionId): TemplateResult {
    if (isCollectionSection(sectionId)) {
      return html`<div class="contents" data-section-host=${sectionId}></div>`;
    }

    switch (sectionId) {
      case "basicInfo":
        return this.basicInfo.render();
      case "stats":
        return this.stats.render();
      case "recoveryDamage":
        return this.recoveryDamageSection.render();
      case "background":
        return this.bottomTextFields.renderBackground();
      case "notes":
        return this.bottomTextFields.renderNotes();
      default:
        return html``;
    }
  }

  /**
   * Get the template for a collection section's content.
   */
  private getCollectionSectionTemplate(sectionId: CollectionSectionId): TemplateResult {
    switch (sectionId) {
      case "cyphers":
        return this.cyphersBox.render();
      case "abilities":
        return this.abilities.render();
      case "specialAbilities":
        return this.specialAbilities.render();
      case "attacks":
        return this.attacks.render();
      case "items":
        return this.itemsBox.render();
    }
  }

  /**
   * Re-render a single collection section inside `root`, leaving the rest of
   * the sheet's DOM untouched.
   *
   * The section is rendered into its host element, which the sheet's template
   * leaves empty. That host is the boundary between the two lit-html roots:
   * rendering a section anywhere inside the region the sheet's own template
   * owns detaches those nodes from the sheet's part, after which every later
   * sheet render silently updates orphaned DOM.
   */
  rerenderSection(sectionId: SectionId, root: HTMLElement | typeof document): void {
    if (!isCollectionSection(sectionId)) return;

    const host = root.querySelector<HTMLElement>(`[data-section-host="${sectionId}"]`);
    if (!host) return;

    render(this.getCollectionSectionTemplate(sectionId), host);
  }

  /**
   * Fill every collection section's host. Called after each sheet render, since
   * a layout change can replace the host elements.
   */
  mountCollectionSections(root: HTMLElement | typeof document): void {
    for (const sectionId of COLLECTION_SECTION_IDS) {
      this.rerenderSection(sectionId, root);
    }
  }
}
