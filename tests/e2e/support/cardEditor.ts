import type { CardEditorDriver } from "./cardEditorDriver.js";

export class CardEditorDsl {
  private kind: string | undefined;

  constructor(private editor: CardEditorDriver) {}

  async startNew(kind: string): Promise<void> {
    this.kind = kind;
    await this.editor.startNew(kind);
  }

  async startEditing(kind: string, name: string): Promise<void> {
    this.kind = kind;
    await this.editor.startEditing(kind, name);
  }

  async set(field: string, value: string): Promise<void> {
    if (this.kind === undefined) throw new Error("No card is being edited; start one first");
    await this.editor.setField(this.kind, field, value);
  }

  async save(): Promise<void> {
    await this.editor.save();
  }

  async cancel(): Promise<void> {
    await this.editor.cancel();
  }

  async pressTab(times: number): Promise<void> {
    await this.editor.pressTab(times);
  }

  async pressShiftTab(times: number): Promise<void> {
    await this.editor.pressShiftTab(times);
  }

  async tabsThroughEveryControlTwice(): Promise<void> {
    await this.editor.tabThroughEveryControl(2, "Tab");
  }

  async tabsBackThroughEveryControlTwice(): Promise<void> {
    await this.editor.tabThroughEveryControl(2, "Shift+Tab");
  }

  async pressEscape(): Promise<void> {
    await this.editor.pressEscape();
  }

  async expectClosed(): Promise<void> {
    await this.editor.expectClosed();
  }

  async expectFirstFieldFocused(): Promise<void> {
    await this.editor.expectFirstFieldFocused();
  }

  async expectLastControlFocused(): Promise<void> {
    await this.editor.expectLastControlFocused();
  }

  async expectFieldFocused(field: string): Promise<void> {
    if (this.kind === undefined) throw new Error("No card is being edited; start one first");
    await this.editor.expectFieldFocused(this.kind, field);
  }
}
