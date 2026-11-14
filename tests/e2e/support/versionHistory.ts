import { FULL_CHARACTER } from "@/data/mockCharacters";
import type { Character, Cypher } from "@/types/character";
import { sampleCard } from "./cardTestFixtures.js";
import { intCell } from "./tableRows.js";
import type { CharacterDsl } from "./character.js";
import type { SetupDsl } from "./setup.js";
import type { ExportedView, VersionHistoryDriver, VersionSeed } from "./versionHistoryDriver.js";

// Descriptions as the app stores them: i18n keys, rendered in the viewer's language.
const NAME_CHANGE = "versionHistory.changes.basicInfo.name";
const INITIAL_STATE = "versionHistory.changes.initialState";
const TIER_CHANGE = "versionHistory.changes.basicInfo.tier";
const CYPHER_CHANGE = "versionHistory.changes.collections.cypher";
const ORIGINAL_NAME = "Original";
const PORTRAIT =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/** What an older release of the app stored in a version. */
type OldChange = "added cypher" | "name change and added ability";

/** What the sheet shows for one version; only what a scenario set up is checked. */
interface VersionFacts {
  name: string;
  description?: string;
  tier?: number;
  equipment?: string;
  mightPool?: number;
}

function mightPool(pool: number): VersionSeed["changes"] {
  return { stats: { ...FULL_CHARACTER.stats, might: { ...FULL_CHARACTER.stats.might, pool } } };
}

export class VersionHistoryDsl {
  private versions: VersionFacts[] = [{ name: ORIGINAL_NAME, description: INITIAL_STATE }];
  private exported?: ExportedView;

  constructor(
    private driver: VersionHistoryDriver,
    private setup: SetupDsl,
    private character: CharacterDsl
  ) {}

  async startsWithNoHistory(): Promise<void> {
    await this.restart({});
  }

  async hasVersions(count: number): Promise<void> {
    await this.store(count, (number) => ({
      facts: { name: `Version ${number}` },
      seed: { description: NAME_CHANGE, changes: { name: `Version ${number}` } },
    }));
  }

  async hasVersionsWithDifferentData(count: number): Promise<void> {
    await this.store(count, (number) => ({
      facts: {
        name: `Character V${number}`,
        tier: number,
        equipment: `Item ${number}`,
        mightPool: 9 + number,
      },
      seed: {
        description: "Modified data",
        changes: {
          name: `Character V${number}`,
          tier: number,
          equipment: [{ name: `Item ${number}`, description: `Description ${number}` }],
          ...mightPool(9 + number),
        },
      },
    }));
  }

  async hasMightPoolHistory(pools: number[]): Promise<void> {
    const [first, ...later] = pools;
    this.versions = [{ name: ORIGINAL_NAME, mightPool: first }];
    await this.setup.newCharacter({ name: ORIGINAL_NAME, ...mightPool(first) });
    await this.store(pools.length, (number) => ({
      facts: { name: ORIGINAL_NAME, mightPool: later[number - 2] },
      seed: { description: "Updated might", changes: mightPool(later[number - 2]) },
    }));
  }

  /** Stored by an older release of the app, which recorded descriptions as English text. */
  async hasOldVersionRecordedAs(description: string, change: OldChange): Promise<void> {
    const changes: Partial<Character> =
      change === "added cypher"
        ? { cyphers: [{ name: "Legacy Test Cypher", level: "3", effect: "Test effect" }] }
        : {
            name: "Changed Name",
            abilities: [{ name: "Legacy Test Ability", cost: 1, description: "Test ability" }],
          };
    await this.store(3, (number) =>
      number === 2
        ? { facts: { name: ORIGINAL_NAME }, seed: { description, changes } }
        : {
            facts: { name: "Latest Version" },
            seed: {
              description: "Another change",
              changes: { ...changes, name: "Latest Version" },
            },
          }
    );
  }

  async hasVersionChangingBasicInfo(fields: Record<string, string>): Promise<void> {
    const changes = Object.fromEntries(
      Object.entries(fields).map(([field, value]) => [
        field,
        field === "tier" ? intCell(value, "Tier") : value,
      ])
    );
    await this.restart({});
    await this.store(2, () => ({
      facts: { name: fields.name ?? ORIGINAL_NAME },
      seed: { description: NAME_CHANGE, changes },
    }));
  }

  async hasVersionsChangingNameThenTier(name: string, tier: number): Promise<void> {
    await this.restart({});
    await this.store(3, (number) =>
      number === 2
        ? { facts: { name }, seed: { description: NAME_CHANGE, changes: { name } } }
        : {
            facts: { name },
            seed: { description: TIER_CHANGE, changes: { name, tier } },
          }
    );
  }

  async hasVersionAddingCypher(name: string): Promise<void> {
    await this.hasCypherChange([], [sampleCard("cypher", name)], `${CYPHER_CHANGE}.added`);
  }

  async hasVersionRemovingCypher(name: string): Promise<void> {
    await this.hasCypherChange([sampleCard("cypher", name)], [], `${CYPHER_CHANGE}.removed`);
  }

  async hasVersionChangingCypherEffect(name: string): Promise<void> {
    const cypher = sampleCard("cypher", name) as Cypher;
    await this.hasCypherChange(
      [cypher],
      [{ ...cypher, effect: "A completely different effect" }],
      `${CYPHER_CHANGE}.modified`
    );
  }

  async hasVersionRenamingCypher(name: string, newName: string): Promise<void> {
    const cypher = sampleCard("cypher", name) as Cypher;
    await this.hasCypherChange(
      [cypher],
      [{ ...cypher, name: newName }],
      `${CYPHER_CHANGE}.removed, ${CYPHER_CHANGE}.added`
    );
  }

  nameOfVersion(version: number): string {
    return this.versions[version - 1].name;
  }

  descriptionOfVersion(version: number): string {
    const { description } = this.versions[version - 1];
    if (description === undefined) throw new Error(`Version ${version} has no description`);
    return description;
  }

  async hasPortrait(): Promise<void> {
    await this.setup.updateCharacter((character) => {
      character.portrait = PORTRAIT;
    });
  }

  async stepsBack(): Promise<void> {
    await this.driver.stepBack();
  }

  async stepsForward(): Promise<void> {
    await this.driver.stepForward();
  }

  async stepsBackInQuickSuccession(times: number): Promise<void> {
    await this.driver.stepBackInQuickSuccession(times);
  }

  async goesToVersion(version: number): Promise<void> {
    await this.driver.goToVersion(version);
  }

  async goesToOldestVersion(): Promise<void> {
    await this.driver.goToVersion(1);
  }

  async restores(): Promise<void> {
    await this.driver.restore();
  }

  async returnsToLatest(): Promise<void> {
    await this.driver.returnToLatest();
  }

  async editsHaveSettled(): Promise<void> {
    await this.driver.settleEdits();
  }

  async holdsVersionSaves(): Promise<void> {
    await this.driver.holdVersionSaves();
  }

  async beginsSavingVersion(): Promise<void> {
    await this.driver.beginSavingVersion();
  }

  async releasesHeldVersionSave(): Promise<void> {
    await this.driver.releaseHeldVersionSave();
  }

  async undoes(): Promise<void> {
    await this.driver.undo();
  }

  async redoes(): Promise<void> {
    await this.driver.redo();
  }

  async redoesWithShift(): Promise<void> {
    await this.driver.redoWithShift();
  }

  async reopens(): Promise<void> {
    await this.driver.reopen();
  }

  async exports(): Promise<void> {
    this.exported = await this.driver.exportWhatIsShown();
  }

  async expectNavigatorHidden(): Promise<void> {
    await this.driver.expectNavigatorHidden();
  }

  async expectImportAvailable(available: boolean): Promise<void> {
    await this.driver.expectImportAvailable(available);
  }

  async expectNameBeforeEdits(): Promise<void> {
    const { name } = this.versions[this.versions.length - 1];
    await this.character.expectBasicInfoShows("name", name);
  }

  async expectEditable(): Promise<void> {
    await this.driver.expectEditable();
  }

  async expectPosition(current: number, total: number): Promise<void> {
    await this.driver.expectPosition(current, total);
  }

  async expectBackAvailable(available: boolean): Promise<void> {
    await this.driver.expectCanStepBack(available);
  }

  async expectForwardAvailable(available: boolean): Promise<void> {
    await this.driver.expectCanStepForward(available);
  }

  async expectOldVersionWarning(): Promise<void> {
    await this.driver.expectOldVersionWarning(true);
  }

  async expectNoOldVersionWarning(): Promise<void> {
    await this.driver.expectOldVersionWarning(false);
  }

  async expectRestoreOffered(): Promise<void> {
    await this.driver.expectRestoreControl();
  }

  async expectOnLatestVersion(): Promise<void> {
    await this.driver.expectCanStepForward(false);
    await this.driver.expectOldVersionWarning(false);
  }

  async expectDescribed(): Promise<void> {
    await this.driver.expectDescriptionShown();
  }

  async expectDescribedAs(text: string): Promise<void> {
    await this.driver.expectDescriptionContains(text);
  }

  async expectDated(): Promise<void> {
    await this.driver.expectTimestampShown();
  }

  async expectAgeInRelativeTerms(): Promise<void> {
    await this.driver.expectTimestampRelative();
  }

  async expectCharacterAsOfVersion(version: number): Promise<void> {
    const { name, tier, equipment, mightPool } = this.versions[version - 1];
    await this.character.expectBasicInfoShows("name", name);
    if (tier !== undefined) await this.character.expectBasicInfoShows("tier", tier);
    if (equipment !== undefined) {
      await this.character.expectCount("equipment", 1);
      await this.character.expectEntry("equipment", equipment);
    }
    if (mightPool !== undefined) await this.character.expectStatShows("Might", "Pool", mightPool);
  }

  async expectOriginalVersionDropped(): Promise<void> {
    await this.driver.expectOriginalVersionDropped(ORIGINAL_NAME);
  }

  async expectPortraitUnchanged(): Promise<void> {
    await this.driver.expectPortraitShows(PORTRAIT);
  }

  expectExportHoldsVersion(version: number): void {
    this.exportedView().expectCharacterNamed(this.versions[version - 1].name);
  }

  expectExportWithoutHistory(): void {
    this.exportedView().expectNoVersionHistory();
  }

  expectExportKeepsPortrait(): void {
    this.exportedView().expectPortrait(PORTRAIT);
  }

  private exportedView(): ExportedView {
    if (!this.exported) throw new Error("Nothing exported yet");
    return this.exported;
  }

  private async restart(character: Record<string, unknown>): Promise<void> {
    this.versions = [{ name: ORIGINAL_NAME, description: INITIAL_STATE }];
    await this.setup.newCharacter({ name: ORIGINAL_NAME, ...character });
  }

  private async hasCypherChange(
    before: unknown[],
    after: unknown[],
    description: string
  ): Promise<void> {
    await this.restart({ cyphers: before });
    await this.store(2, () => ({
      facts: { name: ORIGINAL_NAME },
      seed: { description, changes: { cyphers: after as Cypher[] } },
    }));
  }

  private async store(
    count: number,
    version: (number: number) => { facts: VersionFacts; seed: VersionSeed }
  ): Promise<void> {
    const seeds: VersionSeed[] = [];
    for (let number = 2; number <= count; number++) {
      const { facts, seed } = version(number);
      this.versions.push({ description: seed.description, ...facts });
      seeds.push(seed);
    }
    await this.driver.storeVersions(seeds);
  }
}
