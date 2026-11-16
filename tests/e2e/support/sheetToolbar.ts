import type { SheetToolbarDriver, ToolbarControl } from "./sheetToolbarDriver.js";

export class SheetToolbarDsl {
  constructor(private toolbar: SheetToolbarDriver) {}

  async scrollsToTheBottom(): Promise<void> {
    await this.toolbar.scrollToBottom();
  }

  async expectNotOverlappingSheet(control: ToolbarControl): Promise<void> {
    await this.toolbar.expectNotOverlappingSheet(control);
  }

  async expectInView(control: ToolbarControl): Promise<void> {
    await this.toolbar.expectInView(control);
  }
}
