# Numenera Game Rules & Domain Knowledge

**Context:** Game mechanics, character structure, and domain-specific
information for the Numenera RPG. This is background knowledge, not a rule —
nothing here carries "ABSOLUTE/NON-NEGOTIABLE" framing.

---

## Overview

Numenera is a science fantasy tabletop RPG set in the Ninth World, a billion
years in Earth's future. This document covers the game mechanics needed for
character sheet development.

---

## Character Structure

### Core Identity

**Tier** (Character Level: 1-6) — represents overall power and advancement,
starts at 1, progresses to 6, affects abilities available.

**Type** (Character Class):

- **Glaive**: Warrior/Fighter — physical combat, high Might pools
- **Nano**: Mage/Esoteric — manipulates "numenera" powers, high Intellect pools
- **Jack**: Rogue/Versatile — balanced approach, flexible skill set

**Descriptor** (Adjective) — e.g. Strong, Graceful, Intelligent, Tough,
Clever. Provides stat bonuses and special abilities.

**Focus** (Special Ability Theme) — e.g. "Bears a Halo of Fire", "Controls
Beasts", "Talks to Machines". Provides signature abilities.

---

## Stats (Pools)

Three main stats, each with three values — Pool (maximum), Edge (cost
reduction), Current (available right now):

1. **Might** (Physical Power) — physical actions, melee combat, strength,
   endurance
2. **Speed** (Agility/Reflexes) — agility tasks, ranged combat, dodging
3. **Intellect** (Mental Power) — mental tasks, esoteric abilities (Nanos),
   knowledge, willpower

---

## Important Mechanics

### Pools & Edge

- Pools represent capacity in each stat, spent to apply Effort, depleted
  through use/damage, recovered through rest
- Edge reduces the cost of an action; applied automatically when spending
  pool points; minimum effective cost is always 0

### Example:

```
Character has:
- Might: Pool 12, Edge 2, Current 12

Spends 4 points for Effort:
- Cost: 4 points
- Edge applies: 4 - 2 = 2 effective cost
- New Current: 12 - 2 = 10

Takes 3 damage to Might:
- New Current: 10 - 3 = 7

Recovers 6 points:
- New Current: 7 + 6 = 13
- Wait! Cannot exceed Pool maximum
- Actual Current: 12 (capped at Pool)
```

---

## Items

### Cyphers (One-Use Items)

- **Limit**: 2-3 per character (enforced by game rules)
- One-use powerful items representing found/scavenged technology
- Random effects, varying power levels

**Examples:** Detonation (explosive), Stim (healing/enhancement), Ray Emitter
(attack), Phase Disruptor (utility)

### Artifacts (Permanent Items)

- Permanent items with a depletion mechanic: roll after use (e.g. "1 in
  1d20") to see if the item breaks
- More powerful than regular equipment

**Examples:** Lightning Generator, Force Shield, Gravity Nullifier, Memory
Enhancer

### Oddities (Curiosities)

- Strange items with no game mechanical effect, collected without limit,
  flavor/roleplay only

**Examples:** A sphere that slowly rotates and hums, a glowing cube that
changes color with mood, a device that makes nearby flowers bloom

---

## Recovery & Damage

### Recovery Rolls

- Limited number per day, distributed across pools as desired
- Recovery Track: 1 Action (immediate), 10 Minutes, 1 Hour, 10 Hours (long rest)

### Damage & Damage Track

- Attacker chooses which pool to damage
- **Hale** (modelled as `"healthy"`): all pools above 0
- **Impaired**: one pool at 0 (disadvantaged)
- **Debilitated**: two pools at 0 (barely functional)
- **Dead**: all three pools at 0

---

## Abilities

- **Special Abilities**: granted by Type, Descriptor, and Focus; may cost pool
  points to activate
- **Attacks**: weapon-based or special; may cost pool points for additional
  effects
- **Skills**: trained/specialized tasks that reduce difficulty

---

## Data Model Considerations

The authoritative definition lives in `src/types/character.ts`. How the game
concepts above map onto it:

```typescript
interface Cypher {
  name: string;
  level: string; // string, not number
  effect: string;
}

interface Artifact {
  name: string;
  level: string;
  effect: string;
  // NOTE: depletion is not modelled yet; record it in `effect` for now
}

// Oddities are plain strings — there is no OddityItem type.
type Oddity = string;

interface Ability {
  name: string;
  description: string;
  cost?: number;
  pool?: "might" | "speed" | "intellect";
  action?: string;
}

interface Attack {
  name: string;
  damage: number;
  modifier: number;
  range: string;
  notes?: string;
}

interface SpecialAbility {
  name: string;
  description: string;
  source: string;
}

interface RecoveryRolls {
  action: boolean; // false = available, true = used
  tenMinutes: boolean;
  oneHour: boolean;
  tenHours: boolean;
  modifier: number; // 1d6 + modifier
}

interface DamageTrack {
  impairment: "healthy" | "impaired" | "debilitated";
}
```

Divergences from the tabletop rules worth knowing:

- **Artifact depletion is not modelled.** The rules describe it (see Items
  above) but `Artifact` has no `depletion` field.
- **The damage track uses `"healthy"`**, not the rulebook's "Hale". There is no
  `"dead"` state in the model.
- **The cypher limit is `maxCyphers` on the character** and is displayed, not
  enforced — nothing prevents exceeding it.

---

## Character Sentence

Characters are described as **"I am a [adjective] [noun] who [verbs]"**:

- "I am a **Strong Glaive** who **Bears a Halo of Fire**"
- "I am a **Clever Jack** who **Talks to Machines**"
- "I am an **Intelligent Nano** who **Controls Beasts**"

---

## Validation Rules

- **Tier**: 1-6, integer only
- **Type**: one of Glaive, Nano, Jack, case-sensitive
- **Stats**: Pool is a positive integer; Edge is non-negative (can be 0);
  Current is 0 to Pool inclusive and cannot exceed Pool
- **Cyphers**: limit 2-3, exact limit depends on character abilities
- **Artifacts/Oddities/Equipment**: no limit

---

## Resources

- [Numenera Discovery RPG](https://www.montecookgames.com/store/product/numenera-discovery/)
- Monte Cook Games official site, Numenera corebook

---

## Related Rules

- **Architecture:** See `architecture.md` for data model details
- **Testing:** See `testing.md` for test data creation
- **i18n:** See `i18n.md` for translating game terms
