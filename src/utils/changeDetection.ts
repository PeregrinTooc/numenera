import type { Character } from "../types/character.js";

/**
 * Detects changes between two character versions and returns descriptions
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
      return ["Edited basic info"];
    } else if (firstCategory === "stats") {
      return ["Updated stats"];
    } else if (firstCategory === "resources") {
      return ["Updated resources"];
    } else if (firstCategory === "textFields") {
      return ["Updated text fields"];
    }
    // For collections, don't combine - fall through to individual changes
  }

  // Otherwise, return individual changes limited to top 3
  return changes.slice(0, 3).map((c) => c.description);
}

function detectBasicInfoChanges(oldChar: Character, newChar: Character): string[] {
  const changes: string[] = [];

  if (oldChar.name !== newChar.name) changes.push("Changed name");
  if (oldChar.tier !== newChar.tier) changes.push("Changed tier");
  if (oldChar.type !== newChar.type) changes.push("Changed type");
  if (oldChar.descriptor !== newChar.descriptor) changes.push("Changed descriptor");
  if (oldChar.focus !== newChar.focus) changes.push("Changed focus");

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
    changes.push("Updated might");
  }

  // Check speed
  if (
    oldChar.stats.speed.pool !== newChar.stats.speed.pool ||
    oldChar.stats.speed.edge !== newChar.stats.speed.edge ||
    oldChar.stats.speed.current !== newChar.stats.speed.current
  ) {
    changes.push("Updated speed");
  }

  // Check intellect
  if (
    oldChar.stats.intellect.pool !== newChar.stats.intellect.pool ||
    oldChar.stats.intellect.edge !== newChar.stats.intellect.edge ||
    oldChar.stats.intellect.current !== newChar.stats.intellect.current
  ) {
    changes.push("Updated intellect");
  }

  return changes;
}

function detectResourceChanges(oldChar: Character, newChar: Character): string[] {
  const changes: string[] = [];

  if (oldChar.xp !== newChar.xp) changes.push("Updated XP");
  if (oldChar.shins !== newChar.shins) changes.push("Updated shins");
  if (oldChar.armor !== newChar.armor) changes.push("Updated armor");
  if (oldChar.effort !== newChar.effort) changes.push("Updated effort");
  if (oldChar.maxCyphers !== newChar.maxCyphers) changes.push("Updated max cyphers");

  return changes;
}

function detectCollectionChanges(oldChar: Character, newChar: Character): string[] {
  const changes: string[] = [];

  // Cyphers
  if (oldChar.cyphers.length < newChar.cyphers.length) {
    changes.push("Added cypher");
  } else if (oldChar.cyphers.length > newChar.cyphers.length) {
    changes.push("Removed cypher");
  } else if (oldChar.cyphers.length > 0 && newChar.cyphers.length > 0) {
    // Check if any cypher was modified
    const oldCypherStr = JSON.stringify(oldChar.cyphers);
    const newCypherStr = JSON.stringify(newChar.cyphers);
    if (oldCypherStr !== newCypherStr) {
      changes.push("Modified cypher");
    }
  }

  // Artifacts
  if (oldChar.artifacts.length < newChar.artifacts.length) {
    changes.push("Added artifact");
  } else if (oldChar.artifacts.length > newChar.artifacts.length) {
    changes.push("Removed artifact");
  } else if (oldChar.artifacts.length > 0 && newChar.artifacts.length > 0) {
    const oldArtifactStr = JSON.stringify(oldChar.artifacts);
    const newArtifactStr = JSON.stringify(newChar.artifacts);
    if (oldArtifactStr !== newArtifactStr) {
      changes.push("Modified artifact");
    }
  }

  // Equipment
  if (oldChar.equipment.length < newChar.equipment.length) {
    changes.push("Added equipment");
  } else if (oldChar.equipment.length > newChar.equipment.length) {
    changes.push("Removed equipment");
  } else if (oldChar.equipment.length > 0 && newChar.equipment.length > 0) {
    const oldEquipStr = JSON.stringify(oldChar.equipment);
    const newEquipStr = JSON.stringify(newChar.equipment);
    if (oldEquipStr !== newEquipStr) {
      changes.push("Modified equipment");
    }
  }

  // Attacks
  if (oldChar.attacks.length < newChar.attacks.length) {
    changes.push("Added attack");
  } else if (oldChar.attacks.length > newChar.attacks.length) {
    changes.push("Removed attack");
  } else if (oldChar.attacks.length > 0 && newChar.attacks.length > 0) {
    const oldAttackStr = JSON.stringify(oldChar.attacks);
    const newAttackStr = JSON.stringify(newChar.attacks);
    if (oldAttackStr !== newAttackStr) {
      changes.push("Modified attack");
    }
  }

  // Abilities
  if (oldChar.abilities.length < newChar.abilities.length) {
    changes.push("Added ability");
  } else if (oldChar.abilities.length > newChar.abilities.length) {
    changes.push("Removed ability");
  } else if (oldChar.abilities.length > 0 && newChar.abilities.length > 0) {
    const oldAbilityStr = JSON.stringify(oldChar.abilities);
    const newAbilityStr = JSON.stringify(newChar.abilities);
    if (oldAbilityStr !== newAbilityStr) {
      changes.push("Modified ability");
    }
  }

  // Special Abilities
  if (oldChar.specialAbilities.length < newChar.specialAbilities.length) {
    changes.push("Added special ability");
  } else if (oldChar.specialAbilities.length > newChar.specialAbilities.length) {
    changes.push("Removed special ability");
  } else if (oldChar.specialAbilities.length > 0 && newChar.specialAbilities.length > 0) {
    const oldSpecialStr = JSON.stringify(oldChar.specialAbilities);
    const newSpecialStr = JSON.stringify(newChar.specialAbilities);
    if (oldSpecialStr !== newSpecialStr) {
      changes.push("Modified special ability");
    }
  }

  // Oddities
  if (oldChar.oddities.length < newChar.oddities.length) {
    changes.push("Added oddity");
  } else if (oldChar.oddities.length > newChar.oddities.length) {
    changes.push("Removed oddity");
  } else if (oldChar.oddities.length > 0 && newChar.oddities.length > 0) {
    const oldOddityStr = JSON.stringify(oldChar.oddities);
    const newOddityStr = JSON.stringify(newChar.oddities);
    if (oldOddityStr !== newOddityStr) {
      changes.push("Modified oddity");
    }
  }

  return changes;
}

function detectTextFieldChanges(oldChar: Character, newChar: Character): string[] {
  const changes: string[] = [];

  if (oldChar.textFields.background !== newChar.textFields.background) {
    changes.push("Updated background");
  }
  if (oldChar.textFields.notes !== newChar.textFields.notes) {
    changes.push("Updated notes");
  }

  return changes;
}
