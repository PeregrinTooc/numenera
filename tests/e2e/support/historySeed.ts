import { FULL_CHARACTER } from "@/data/mockCharacters";
import type { Character, Cypher } from "@/types/character";
import { sampleCard } from "./cardTestFixtures.js";
import { intCell } from "./tableRows.js";
import type { SetupDsl } from "./setup.js";
import type { VersionHistoryDriver, VersionSeed } from "./versionHistoryDriver.js";

// Descriptions as the app stores them: i18n keys, rendered in the viewer's language.
const NAME_CHANGE = "versionHistory.changes.basicInfo.name";
const INITIAL_STATE = "versionHistory.changes.initialState";
const TIER_CHANGE = "versionHistory.changes.basicInfo.tier";
const CYPHER_CHANGE = "versionHistory.changes.collections.cypher";
export const ORIGINAL_NAME = "Original";
export const PORTRAIT =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/** What an older release of the app stored in a version. */
type OldChange = "added cypher" | "name change and added ability";

/** What the sheet shows for one version; only what a scenario set up is checked. */
export interface VersionFacts {
  name: string;
  description?: string;
  tier?: number;
  equipment?: string;
  mightPool?: number;
}

function mightPool(pool: number): VersionSeed["changes"] {
  return { stats: { ...FULL_CHARACTER.stats, might: { ...FULL_CHARACTER.stats.might, pool } } };
}

/** Creates the histories scenarios start from, and remembers what each version holds. */
export class HistorySeedDsl {
  private versions: VersionFacts[] = [{ name: ORIGINAL_NAME, description: INITIAL_STATE }];

  constructor(
    private driver: VersionHistoryDriver,
    private setup: SetupDsl
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
    return this.factsOfVersion(version).name;
  }

  factsOfVersion(version: number): VersionFacts {
    return this.versions[version - 1];
  }

  nameOfLatestVersion(): string {
    return this.versions[this.versions.length - 1].name;
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
