export const COMPARE_FIELD_TEST_IDS: Record<string, string> = {
  "character name": "character-name",
  tier: "character-tier",
};

export function panePrefix(side: "left" | "right"): string {
  return `[data-testid="compare-pane-${side}"]`;
}

// For the pane's own compound testids (compare-pane-left-backward etc.),
// which are a single attribute value, not a descendant of panePrefix().
export function paneControl(side: "left" | "right", control: string): string {
  return `[data-testid="compare-pane-${side}-${control}"]`;
}
