import { defineParameterType } from "@cucumber/cucumber";
import { CARD_CONFIGS } from "./cardTestFixtures.js";
import type { SectionZone } from "./sections.js";

defineParameterType({
  name: "cardType",
  regexp: /cypher|equipment|artifact|oddity|attack|ability|special ability/,
  transformer: (s: string) => s.replace(" ", "-") as keyof typeof CARD_CONFIGS,
});

defineParameterType({
  name: "textarea",
  regexp: /background|notes/,
  transformer: (s: string) => s,
});

defineParameterType({
  name: "resourceName",
  regexp: /Current XP|Total XP|Shins|Armor|Max Cyphers|Effort/,
  transformer: (s: string) => s,
});

defineParameterType({
  name: "stat",
  regexp: /Might|Speed|Intellect/,
  transformer: (s: string) => s,
});

// The plural kind of entry a character carries, mapped to its card type key.
const CARD_KINDS: Record<string, string> = {
  cyphers: "cypher",
  equipment: "equipment",
  artifacts: "artifact",
  oddities: "oddity",
  attacks: "attack",
  abilities: "ability",
  "special abilities": "special-ability",
};

defineParameterType({
  name: "cardKind",
  regexp: /special abilities|abilities|cyphers|equipment|artifacts|oddities|attacks/,
  transformer: (s: string) => CARD_KINDS[s],
});

// A drop zone on a section, e.g. "the bottom edge of the "Items" section".
defineParameterType({
  name: "zone",
  regexp: /top edge|bottom edge|middle left|middle right/,
  transformer: (s: string) => s as SectionZone,
});
