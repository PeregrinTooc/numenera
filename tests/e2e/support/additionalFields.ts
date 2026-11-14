import type { InlineFieldsDriver } from "./inlineFieldsDriver.js";

export class AdditionalFieldsDsl {
  constructor(private fields: InlineFieldsDriver) {}

  async chooseType(type: string): Promise<void> {
    await this.fields.chooseType(type);
  }

  async expectTypeShows(type: string): Promise<void> {
    await this.fields.expectTypeShows(type);
  }

  async expectTypeChoices(types: string[]): Promise<void> {
    await this.fields.expectTypeChoices(types);
  }

  async expectTypeLabelled(label: string): Promise<void> {
    await this.fields.expectTypeLabelled(label);
  }

  async write(field: string, text: string): Promise<void> {
    await this.fields.startEditing(field);
    await this.fields.type(field, text);
    await this.fields.finishEditing(field);
  }

  async writeCharacters(field: string, length: number): Promise<void> {
    await this.write(field, "A".repeat(length));
  }

  async expectHoldsCharacters(field: string, length: number): Promise<void> {
    await this.fields.expectReads(field, "A".repeat(length));
  }

  async expectReads(field: string, text: string): Promise<void> {
    await this.fields.expectReads(field, text);
  }

  async expectInvitesEditing(field: string, invitation: string): Promise<void> {
    await this.fields.expectPlaceholder(field, invitation);
  }

  async expectReadOnlyAndClickable(field: string): Promise<void> {
    await this.fields.expectReadOnly(field);
    await this.fields.expectLooksClickable(field);
  }

  async click(field: string): Promise<void> {
    await this.fields.startEditing(field);
  }

  async tap(field: string): Promise<void> {
    await this.fields.tapToEdit(field);
  }

  async type(field: string, text: string): Promise<void> {
    await this.fields.type(field, text);
  }

  async clickAway(field: string): Promise<void> {
    await this.fields.finishEditing(field);
  }

  async expectEditable(field: string): Promise<void> {
    await this.fields.expectEditable(field);
  }

  async expectEditing(field: string): Promise<void> {
    await this.fields.expectEditing(field);
  }

  async expectKeyboardRaised(): Promise<void> {
    await this.fields.expectKeyboardRaised();
  }
}
