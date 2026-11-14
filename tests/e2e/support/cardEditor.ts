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

  async expectOpenWithEmptyFields(kind: string): Promise<void> {
    await this.editor.expectEmptyFields(kind);
  }
}
