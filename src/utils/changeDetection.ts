import type { Character } from "../types/character.js";

/**
 * Detects changes between two character versions and returns i18n key
 * strings describing what changed (e.g. "versionHistory.changes.basicInfo.name").
 * Callers translate these with `t()` — this stays a pure, dependency-free
 * util so it's trivially unit-testable.
 * Priority: Basic info > Stats > Resources > Collections > Text fields
 * Limits output to top 3 changes maximum
 */
export function detectChanges(oldChar: Character, newChar: Character): string[] {
  const changes: Array<{ priority: number; description: string; category: string }> = [];

  // Priority 1: Basic info changes (name, tier, type, descriptor, focus)
  const basicInfoChanges = detectBasicInfoChanges(oldChar, newChar);
  basicInfoChanges.forEach((change) => {
    changes.push({ priority: 1, description: change, category: "basicInfo" });
  });

  // Priority 2: Stat changes (might, speed, intellect)
  const statChanges = detectStatChanges(oldChar, newChar);
  statChanges.forEach((change) => {
    changes.push({ priority: 2, description: change, category: "stats" });
  });

  // Priority 3: Resource changes (xp, shins, armor, effort, maxCyphers)
  const resourceChanges = detectResourceChanges(oldChar, newChar);
  resourceChanges.forEach((change) => {
    changes.push({ priority: 3, description: change, category: "resources" });
  });

  // Priority 4: Collection changes (cyphers, artifacts, equipment, attacks, abilities)
  const collectionChanges = detectCollectionChanges(oldChar, newChar);
  collectionChanges.forEach((change) => {
    changes.push({ priority: 4, description: change, category: "collections" });
  });

  // Priority 5: Text field changes (background, notes)
  const textFieldChanges = detectTextFieldChanges(oldChar, newChar);
  textFieldChanges.forEach((change) => {
    changes.push({ priority: 5, description: change, category: "textFields" });
  });

  // Sort by priority
  changes.sort((a, b) => a.priority - b.priority);

  // If no changes, return empty
  if (changes.length === 0) {
    return [];
  }

  // Check if ALL changes are in the same category
  const firstCategory = changes[0].category;
  const allSameCategory = changes.every((c) => c.category === firstCategory);

  // If all changes are in same category and there are multiple, combine them
  if (allSameCategory && changes.length > 1) {
    if (firstCategory === "basicInfo") {
      return ["versionHistory.changes.basicInfo.combined"];
    } else if (firstCategory === "stats") {
      return ["versionHistory.changes.stats.combined"];
    } else if (firstCategory === "resources") {
      return ["versionHistory.changes.resources.combined"];
    } else if (firstCategory === "textFields") {
      return ["versionHistory.changes.textFields.combined"];
    }
    // For collections, don't combine - fall through to individual changes
  }

  // Otherwise, return individual changes limited to top 3
  return changes.slice(0, 3).map((c) => c.description);
}

function detectBasicInfoChanges(oldChar: Character, newChar: Character): string[] {
  const changes: string[] = [];

  if (oldChar.name !== newChar.name) changes.push("versionHistory.changes.basicInfo.name");
  if (oldChar.tier !== newChar.tier) changes.push("versionHistory.changes.basicInfo.tier");
  if (oldChar.type !== newChar.type) changes.push("versionHistory.changes.basicInfo.type");
  if (oldChar.descriptor !== newChar.descriptor)
    changes.push("versionHistory.changes.basicInfo.descriptor");
  if (oldChar.focus !== newChar.focus) changes.push("versionHistory.changes.basicInfo.focus");

  return changes;
}

function detectStatChanges(oldChar: Character, newChar: Character): string[] {
  const changes: string[] = [];

  // Check might
  if (
    oldChar.stats.might.pool !== newChar.stats.might.pool ||
    oldChar.stats.might.edge !== newChar.stats.might.edge ||
    oldChar.stats.might.current !== newChar.stats.might.current
  ) {
    changes.push("versionHistory.changes.stats.might");
  }

  // Check speed
  if (
    oldChar.stats.speed.pool !== newChar.stats.speed.pool ||
    oldChar.stats.speed.edge !== newChar.stats.speed.edge ||
    oldChar.stats.speed.current !== newChar.stats.speed.current
  ) {
    changes.push("versionHistory.changes.stats.speed");
  }

  // Check intellect
  if (
    oldChar.stats.intellect.pool !== newChar.stats.intellect.pool ||
    oldChar.stats.intellect.edge !== newChar.stats.intellect.edge ||
    oldChar.stats.intellect.current !== newChar.stats.intellect.current
  ) {
    changes.push("versionHistory.changes.stats.intellect");
  }

  return changes;
}

function detectResourceChanges(oldChar: Character, newChar: Character): string[] {
  const changes: string[] = [];

  if (oldChar.currentXp !== newChar.currentXp || oldChar.totalXp !== newChar.totalXp)
    changes.push("versionHistory.changes.resources.xp");
  if (oldChar.shins !== newChar.shins) changes.push("versionHistory.changes.resources.shins");
  if (oldChar.armor !== newChar.armor) changes.push("versionHistory.changes.resources.armor");
  if (oldChar.effort !== newChar.effort) changes.push("versionHistory.changes.resources.effort");
  if (oldChar.maxCyphers !== newChar.maxCyphers)
    changes.push("versionHistory.changes.resources.maxCyphers");

  return changes;
}

/**
 * Helper to detect changes in a collection (added/removed/modified)
 */
function detectCollectionChange(
  oldCollection: unknown[],
  newCollection: unknown[],
  itemKey: string
): string | null {
  if (oldCollection.length < newCollection.length) {
    return `versionHistory.changes.collections.${itemKey}.added`;
  } else if (oldCollection.length > newCollection.length) {
    return `versionHistory.changes.collections.${itemKey}.removed`;
  } else if (oldCollection.length > 0 && newCollection.length > 0) {
    const oldStr = JSON.stringify(oldCollection);
    const newStr = JSON.stringify(newCollection);
    if (oldStr !== newStr) {
      return `versionHistory.changes.collections.${itemKey}.modified`;
    }
  }
  return null;
}

function detectCollectionChanges(oldChar: Character, newChar: Character): string[] {
  const changes: string[] = [];

  const collectionChecks = [
    { old: oldChar.cyphers, new: newChar.cyphers, key: "cypher" },
    { old: oldChar.artifacts, new: newChar.artifacts, key: "artifact" },
    { old: oldChar.equipment, new: newChar.equipment, key: "equipment" },
    { old: oldChar.attacks, new: newChar.attacks, key: "attack" },
    { old: oldChar.abilities, new: newChar.abilities, key: "ability" },
    { old: oldChar.specialAbilities, new: newChar.specialAbilities, key: "specialAbility" },
    { old: oldChar.oddities, new: newChar.oddities, key: "oddity" },
  ];

  for (const check of collectionChecks) {
    const change = detectCollectionChange(check.old, check.new, check.key);
    if (change) {
      changes.push(change);
    }
  }

  return changes;
}

function detectTextFieldChanges(oldChar: Character, newChar: Character): string[] {
  const changes: string[] = [];

  if (oldChar.textFields.background !== newChar.textFields.background)
    changes.push("versionHistory.changes.textFields.background");
  if (oldChar.textFields.notes !== newChar.textFields.notes)
    changes.push("versionHistory.changes.textFields.notes");

  return changes;
}
