import type { DropPlace, SectionInput } from "./sectionInput.js";

export class LayoutDsl {
  constructor(private input: SectionInput) {}

  async moveSection(name: string, onto: DropPlace): Promise<void> {
    await this.input.dragSection(name, onto);
  }
}
