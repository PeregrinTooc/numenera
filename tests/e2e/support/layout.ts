import {
  GRID_ELIGIBLE_SECTIONS,
  SINGLE_ONLY_SECTIONS,
  type LayoutItem,
  type SectionId,
} from "@/types/layout";
import type { DropPreviewDriver, GhostSide, HeldOver } from "./dropPreviewDriver.js";
import type { LayoutEditDriver } from "./layoutEditDriver.js";
import type { SectionSlideDriver } from "./sectionSlideDriver.js";
import { TouchInput, type DropPlace, type HeldDrag, type SectionInput } from "./sectionInput.js";
import { sectionId } from "./sections.js";
import type { SetupDsl } from "./setup.js";

function singles(ids: readonly SectionId[]): LayoutItem[] {
  return ids.map((id): LayoutItem => ({ type: "single", id }));
}

export class LayoutDsl {
  private heldDrag?: HeldDrag;
  private heldOver?: HeldOver;
  private scrollBeforeSwipe?: number;

  constructor(
    private input: SectionInput,
    private editMode: LayoutEditDriver,
    private setup: SetupDsl,
    private preview: DropPreviewDriver,
    private slides: SectionSlideDriver
  ) {}

  async toggleEditMode(): Promise<void> {
    await this.editMode.toggleEditMode();
  }

  async enterEditMode(): Promise<void> {
    await this.editMode.toggleEditMode();
    await this.editMode.expectEditModeActive();
  }

  async exitEditMode(): Promise<void> {
    await this.editMode.toggleEditMode();
    await this.editMode.expectEditModeInactive();
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

  async hasSectionOnTopInEditMode(name: string): Promise<void> {
    const top = sectionId(name);
    const rearrangeable = GRID_ELIGIBLE_SECTIONS.filter((id) => id !== top);
    await this.setup.layout(singles([...SINGLE_ONLY_SECTIONS, top, ...rearrangeable]));
    await this.enterEditMode();
  }

  async expectSectionBefore(first: string, second: string): Promise<void> {
    await this.editMode.expectSectionBefore(first, second);
  }

  async expectSectionAtTop(name: string): Promise<void> {
    await this.editMode.expectFirstRearrangeable(name);
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

  async bringToTopOfWindow(name: string): Promise<void> {
    await this.preview.bringToTopOfWindow(name);
  }

  async holdOver(source: string, over: DropPlace): Promise<void> {
    this.heldOver = await this.preview.holdOverInFullWindow(source, over);
  }

  async holdOverAsWindowShows(source: string, over: DropPlace): Promise<void> {
    this.heldOver = await this.preview.holdOver(source, over);
  }

  async keepStill(): Promise<void> {
    await this.preview.keepStill();
  }

  async dropPreviewedSectionOnto(onto: DropPlace): Promise<void> {
    await this.preview.dropOnto(onto);
  }

  async releaseOutsideSheet(): Promise<void> {
    await this.preview.releaseOutsideSheet();
  }

  async releaseWhereItIs(): Promise<void> {
    await this.preview.releaseWhereItIs(this.held());
  }

  async expectPreviewedGhost(target: string, side: GhostSide, ghost: string): Promise<void> {
    await this.preview.expectGhost(target, side, ghost);
    await this.preview.expectTargetUnmoved(this.held());
  }

  async expectRowPreviewsBumped(member: string, bumped: string): Promise<void> {
    await this.preview.expectRowPreviewsBumped(member, bumped);
  }

  async expectNoPreview(): Promise<void> {
    await this.preview.expectNoPreview(this.held().source);
  }

  async expectNotMovedVertically(name: string): Promise<void> {
    await this.preview.expectNotMovedVertically(name, this.held());
  }

  async recordSlides(): Promise<void> {
    await this.slides.recordSlides();
  }

  async preferReducedMotion(): Promise<void> {
    await this.slides.preferReducedMotion();
  }

  async expectSlidIntoPlace(name: string): Promise<void> {
    await this.slides.expectSlidIntoPlace(name);
  }

  async expectSlidBack(name: string): Promise<void> {
    await this.slides.expectSlidBack(name);
  }

  async expectDrawnAbove(upper: string, lower: string): Promise<void> {
    await this.slides.expectDrawnAbove(upper, lower);
  }

  async expectNoneSlid(): Promise<void> {
    await this.slides.expectNoneSlid();
  }

  private held(): HeldOver {
    if (!this.heldOver) throw new Error("No section is being held over a target");
    return this.heldOver;
  }

  /** Touch-only behaviour: the feature files tag it @touch, so other profiles never get here. */
  private touch(): TouchInput {
    if (!(this.input instanceof TouchInput)) {
      throw new Error("This step needs touch input, which this device profile does not use");
    }
    return this.input;
  }
}
