/** The corner of a section's box that a slide moves it by. */
export interface BoxCorner {
  left: number;
  top: number;
}

/**
 * The keyframes that slide a section from its old box `first` to its new box
 * `last` (FLIP: the section is already in its new place and starts offset back
 * to its old one)
 */
export function slideKeyframes(first: BoxCorner, last: BoxCorner): { transform: string }[] | null {
  const dx = first.left - last.left;
  const dy = first.top - last.top;
  // Sub-pixel differences are layout rounding, not a move
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return null;
  return [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }];
}
