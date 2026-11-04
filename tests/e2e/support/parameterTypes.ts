import { defineParameterType } from "@cucumber/cucumber";
import { CARD_CONFIGS } from "./cardTestFixtures.js";
import { FIELD_TEST_IDS } from "./fields.js";
import type { SectionZone } from "./sections.js";

// Maps the Gherkin word for a character resource to its field name on
// Character.
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
  transformer: (s: string) => FIELD_TEST_IDS[s],
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

// Plural card words as written in empty-state steps, mapped to the
// data-testid of that section's empty-state element.
const EMPTY_STATE_TEST_IDS: Record<string, string> = {
  cyphers: "empty-cyphers",
  artifacts: "empty-artifacts",
  oddities: "empty-oddities",
  attacks: "empty-attacks",
  abilities: "empty-abilities",
  "special abilities": "empty-special-abilities",
};

defineParameterType({
  name: "cardTypes",
  regexp: /special abilities|abilities|cyphers|artifacts|oddities|attacks/,
  transformer: (s: string) => EMPTY_STATE_TEST_IDS[s],
});

// A drop zone on a section, e.g. "the bottom edge of the "Items" section".
defineParameterType({
  name: "zone",
  regexp: /top edge|bottom edge|middle left|middle right/,
  transformer: (s: string) => s as SectionZone,
});
