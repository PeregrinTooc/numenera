import { defineParameterType } from "@cucumber/cucumber";
import { CARD_CONFIGS } from "./cardTestFixtures.js";

// Maps the Gherkin word for a resource badge to its data-testid. Kept local
// to this file for now; common-steps.ts still has its own FIELD_TEST_IDS
// copy until Phase 3.5 moves badge wiring here permanently and deletes it.
const BADGE_TEST_IDS: Record<string, string> = {
  "Current XP": "xp-badge-current",
  "Total XP": "xp-badge-total",
  Shins: "shins-badge",
  Armor: "armor-badge",
  "Max Cyphers": "max-cyphers-badge",
  Effort: "effort-badge",
};

// Maps the Gherkin word for a character resource to its field name on
// Character. Consumed by Phase 3.7's this.setup.character(overrides).
const RESOURCE_FIELDS: Record<string, string> = {
  shins: "shins",
  armor: "armor",
  effort: "effort",
  "max cyphers": "maxCyphers",
};

defineParameterType({
  name: "cardType",
  regexp: /cypher|equipment|artifact|oddity|attack|ability|special ability/,
  transformer: (s: string) => s.replace(" ", "-") as keyof typeof CARD_CONFIGS,
});

defineParameterType({
  name: "badge",
  regexp: /Current XP|Total XP|Shins|Armor|Max Cyphers|Effort/,
  transformer: (s: string) => BADGE_TEST_IDS[s],
});

defineParameterType({
  name: "textarea",
  regexp: /background|notes/,
  transformer: (s: string) => s,
});

defineParameterType({
  name: "resource",
  regexp: /shins|armor|effort|max cyphers/,
  transformer: (s: string) => RESOURCE_FIELDS[s],
});
