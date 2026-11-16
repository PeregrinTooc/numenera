import type { LayoutEditDriver } from "./layoutEditDriver.js";
import { TouchInput, type DropPlace, type HeldDrag, type SectionInput } from "./sectionInput.js";

export class LayoutDsl {
  private heldDrag?: HeldDrag;
  private scrollBeforeSwipe?: number;

  constructor(
    private input: SectionInput,
    private editMode: LayoutEditDriver
  ) {}

  async toggleEditMode(): Promise<void> {
    await this.editMode.toggleEditMode();
  }

  async enterEditMode(): Promise<void> {
    await this.editMode.toggleEditMode();
    await this.editMode.expectEditModeActive();
  }

  async expectEditModeActive(): Promise<void> {
    await this.editMode.expectEditModeActive();
  }

  async expectEditModeInactive(): Promise<void> {
    await this.editMode.expectEditModeInactive();
  }

  async expectSectionsMarkedRearrangeable(): Promise<void> {
    await this.editMode.expectSectionsMarkedRearrangeable();
  }

  async expectButton(name: string): Promise<void> {
    if (name !== "Edit Layout") throw new Error(`Unknown button: ${name}`);
    await this.editMode.expectEditButtonVisible();
  }

  async expectEditButtonTouchFriendly(): Promise<void> {
    await this.editMode.expectEditButtonTouchFriendly();
  }

  async expectDefaultArrangement(): Promise<void> {
    await this.editMode.expectNoSavedLayout();
  }

  async moveSection(name: string, onto: DropPlace): Promise<void> {
    await this.input.dragSection(name, onto);
  }

  async longPress(name: string): Promise<void> {
    await this.touch().longPress(name);
  }

  async expectInDragMode(name: string): Promise<void> {
    await this.touch().expectInDragMode(name);
  }

  async holdAtTopEdgeUntilOnScreen(name: string, until: string): Promise<void> {
    this.heldDrag = await this.touch().holdAtTopEdge(name, until);
  }

  async holdOverUntilPreviewed(name: string, over: DropPlace): Promise<void> {
    this.heldDrag = await this.touch().holdOver(name, over);
  }

  async dropHeldSectionOnto(onto: DropPlace): Promise<void> {
    if (!this.heldDrag) throw new Error("No section is being held");
    await this.heldDrag.dropOnto(onto);
    this.heldDrag = undefined;
  }

  async swipe(from: string, towards: string): Promise<void> {
    const touch = this.touch();
    this.scrollBeforeSwipe = await touch.scrollPosition();
    await touch.swipe(from, towards);
  }

  async expectPageScrolled(): Promise<void> {
    if (this.scrollBeforeSwipe === undefined) throw new Error("No swipe was made");
    await this.touch().expectScrolledFrom(this.scrollBeforeSwipe);
  }

  /** Touch-only behaviour: the feature files tag it @touch, so other profiles never get here. */
  private touch(): TouchInput {
    if (!(this.input instanceof TouchInput)) {
      throw new Error("This step needs touch input, which this device profile does not use");
    }
    return this.input;
  }
}
