import type { ComparisonDriver, Highlight, Pane } from "./comparisonDriver.js";
import type { VersionHistoryDsl } from "./versionHistory.js";

const BOTH_PANES: Pane[] = ["left", "right"];

/** Two versions of the character side by side, with what differs between them highlighted. */
export class ComparisonDsl {
  constructor(
    private driver: ComparisonDriver,
    private history: VersionHistoryDsl
  ) {}

  async switchesOn(): Promise<void> {
    await this.driver.switchOn();
  }

  async opens(): Promise<void> {
    await this.history.stepsBack();
    await this.driver.expectShown(true);
  }

  async stepsBack(pane: Pane): Promise<void> {
    await this.driver.stepPane(pane, "back");
  }

  async stepsForward(pane: Pane): Promise<void> {
    await this.driver.stepPane(pane, "forward");
  }

  async movesTo(pane: Pane, version: number): Promise<void> {
    await this.driver.movePaneTo(pane, version);
  }

  async restores(pane: Pane): Promise<void> {
    await this.driver.restore(pane);
  }

  async exits(): Promise<void> {
    await this.driver.exit();
  }

  async expectSwitchedOn(): Promise<void> {
    await this.driver.expectSwitchedOn();
  }

  async expectShown(shown: boolean): Promise<void> {
    await this.driver.expectShown(shown);
  }

  async expectShowsVersion(pane: Pane, version: number): Promise<void> {
    await this.driver.expectPaneShowsVersion(pane, version);
  }

  async expectShowsCharacterOfVersion(pane: Pane, version: number): Promise<void> {
    await this.driver.expectPaneShowsCharacterNamed(pane, this.history.nameOfVersion(version));
  }

  async expectRestoreAvailable(pane: Pane, available: boolean): Promise<void> {
    await this.driver.expectRestoreAvailable(pane, available);
  }

  async expectNewestVersionRestoredFrom(version: number): Promise<void> {
    await this.driver.expectNewestVersionRestoredFrom(this.history.descriptionOfVersion(version));
  }

  async expectHeaderLists(changes: string[]): Promise<void> {
    await this.driver.expectHeaderListsExactly(changes);
  }

  async expectHeaderSaysNoDifferences(): Promise<void> {
    await this.driver.expectHeaderSaysNoDifferences();
  }

  async expectBasicInfoHighlightedInBothPanes(field: string): Promise<void> {
    for (const pane of BOTH_PANES) await this.driver.expectBasicInfoHighlighted(pane, field);
  }

  async expectBasicInfoHighlightedInNeitherPane(field: string): Promise<void> {
    for (const pane of BOTH_PANES) await this.driver.expectBasicInfoNotHighlighted(pane, field);
  }

  async expectCypherHighlighted(pane: Pane, name: string, colour: Highlight): Promise<void> {
    await this.driver.expectCypherHighlighted(pane, name, colour);
  }

  async expectCypherHighlightedInBothPanes(name: string, colour: Highlight): Promise<void> {
    for (const pane of BOTH_PANES) await this.driver.expectCypherHighlighted(pane, name, colour);
  }

  async expectCypherAbsent(pane: Pane, name: string): Promise<void> {
    await this.driver.expectCypherAbsent(pane, name);
  }

  async expectReadOnly(): Promise<void> {
    await this.driver.expectReadOnly();
  }
}
