import type { ValueEditorDriver } from "./valueEditorDriver.js";

function capitalised(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/** How the sheet names one of a stat's values, e.g. "Might Pool". */
export function statLabel(stat: string, field: string): string {
  return `${capitalised(stat)} ${capitalised(field)}`;
}

export class ValueEditorDsl {
  constructor(private editor: ValueEditorDriver) {}

  async openForStat(stat: string, field: string): Promise<void> {
    await this.editor.open(statLabel(stat, field));
  }

  async enter(value: number): Promise<void> {
    await this.editor.setValue(String(value));
  }

  async confirm(): Promise<void> {
    await this.editor.confirm();
  }

  async confirmWithEnter(): Promise<void> {
    await this.editor.confirmWithEnter();
  }

  async cancel(): Promise<void> {
    await this.editor.cancel();
  }

  async dismissWithEscape(): Promise<void> {
    await this.editor.dismissWithEscape();
  }

  async expectOpenShowing(value: number): Promise<void> {
    await this.editor.expectOpenShowing(String(value));
  }

  async expectInputFocused(): Promise<void> {
    await this.editor.expectInputFocused();
  }

  async expectClosed(): Promise<void> {
    await this.editor.expectClosed();
  }

  async dismissByClickingOutside(): Promise<void> {
    await this.editor.dismissByClickingOutside();
  }

  async expectFocusStaysInside(): Promise<void> {
    await this.editor.expectFocusStaysInside();
  }

  async expectNumericKeypad(): Promise<void> {
    await this.editor.expectNumericKeypad();
  }

  async expectButtonsHaveIcons(): Promise<void> {
    await this.editor.expectButtonsHaveIcons();
  }

  async expectSheetDimmed(): Promise<void> {
    await this.editor.expectSheetDimmed();
  }

  async expectDialogSemantics(): Promise<void> {
    await this.editor.expectDialogSemantics();
  }

  async expectFitsScreen(): Promise<void> {
    await this.editor.expectFitsScreen();
  }

  async expectTouchFriendlyControls(): Promise<void> {
    await this.editor.expectTouchFriendlyControls();
  }

  async expectStatLooksClickable(stat: string, field: string): Promise<void> {
    await this.editor.expectValueLooksClickable(statLabel(stat, field));
  }

  async expectStatTouchFriendly(stat: string, field: string): Promise<void> {
    await this.editor.expectValueTouchFriendly(statLabel(stat, field));
  }
}
