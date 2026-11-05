// Sliding sections from their old to their new places after a re-render
// (FLIP: measure First, render Last, Invert with a transform, Play).

import { BoxCorner, slideKeyframes } from "@/utils/sectionSlide";

/** How long a section takes to slide to its new place. */
export const SECTION_SLIDE_MS = 200;

/** The id of every section slide animation, so they can be found again. */
export const SECTION_SLIDE_ID = "section-slide";

function sectionElements(root: Element): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>("[data-section-id]"));
}

/** Where each section in `root` is on screen now, by section id. */
export function measureSections(root: Element): Map<string, BoxCorner> {
  const boxes = new Map<string, BoxCorner>();
  for (const el of sectionElements(root)) {
    const { left, top } = el.getBoundingClientRect();
    boxes.set(el.dataset.sectionId ?? "", { left, top });
  }
  return boxes;
}

/**
 * Scroll the page so section `id` is back where it was on screen in `first`
 * (taken before the re-render): the rows above it may have changed, and
 * WebKit may scroll by itself when a re-render replaces what is on screen.
 * The section under a held pointer then stays under it.
 */
export function keepSectionStill(root: Element, first: Map<string, BoxCorner>, id: string): void {
  const section = root.querySelector(`[data-section-id="${id}"]`);
  const was = first.get(id);
  if (!section || !was) throw new Error(`Section ${id} was not on the sheet`);
  window.scrollBy(0, section.getBoundingClientRect().top - was.top);
}

/**
 * Stop every section slide in `root`: an element kept from the last render may
 * still be sliding, which would put it where the slide has got to rather than
 * where it now belongs
 */
export function cancelSectionSlides(root: Element): void {
  for (const el of sectionElements(root)) {
    for (const running of el.getAnimations?.() ?? []) {
      if (running.id === SECTION_SLIDE_ID) running.cancel();
    }
  }
}

/**
 * Slide every section in `root` that moved from its box in `first` (taken
 * before the re-render) to where it is now. Sections are matched by id, not
 * element: a row that changes between single and pair re-creates them.
 * Web Animations rather than an inline transform, which would start the CSS
 * transition on `.layout-section`. Resolves when every slide has finished;
 * null when nothing slides (no section moved, or reduced motion).
 */
export function slideSections(root: Element, first: Map<string, BoxCorner>): Promise<void> | null {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  cancelSectionSlides(root);
  const slides: Promise<unknown>[] = [];
  for (const el of sectionElements(root)) {
    const from = first.get(el.dataset.sectionId ?? "");
    const keyframes = from && slideKeyframes(from, el.getBoundingClientRect());
    // jsdom has no Web Animations
    if (!keyframes || typeof el.animate !== "function") continue;
    const animation = el.animate(keyframes, {
      duration: SECTION_SLIDE_MS,
      easing: "ease-in-out",
      id: SECTION_SLIDE_ID,
    });
    slides.push(animation.finished);
  }
  if (slides.length === 0) return null;
  // A cancelled slide rejects `finished`; it is over all the same
  return Promise.allSettled(slides).then(() => undefined);
}
