# Numenera Game Rules & Domain Knowledge

**Context:** Game mechanics, character structure, and domain-specific information for the Numenera RPG

---

## Overview

Numenera is a science fantasy tabletop RPG set in the Ninth World, a billion years in Earth's future. This document covers the game mechanics needed for character sheet development.

---

## Character Structure

### Core Identity

**Tier** (Character Level: 1-6)

- Represents overall power and advancement
- Starts at 1, progresses to 6
- Major milestone in character progression
- Affects abilities available and power level

**Type** (Character Class)

- **Glaive**: Warrior/Fighter (combat specialist)
  - Focused on physical combat
  - High Might pools
  - Combat abilities
- **Nano**: Mage/Esoteric (uses "numenera" powers)
  - Manipulates mysterious forces
  - High Intellect pools
  - Esoteric abilities
- **Jack**: Rogue/Versatile (jack of all trades)
  - Balanced approach
  - Flexible skill set
  - Tricks and special moves

**Descriptor** (Adjective)

- Examples: Strong, Graceful, Intelligent, Tough, Clever
- Provides stat bonuses and special abilities
- Defines character personality/background
- Affects starting stats

**Focus** (Special Ability Theme)

- Examples: "Bears a Halo of Fire", "Controls Beasts", "Talks to Machines"
- Unique character power/theme
- Provides signature abilities
- Defines character's unique capability

---

## Stats (Pools)

Three main stats, each with three values:

### 1. Might (Physical Power)

- **Pool**: Maximum points available
- **Edge**: Cost reduction for effort
- **Current**: Available points right now

Used for:

- Physical actions
- Melee combat
- Strength tasks
- Endurance

### 2. Speed (Agility/Reflexes)

- **Pool**: Maximum points available
- **Edge**: Cost reduction for effort
- **Current**: Available points right now

Used for:

- Agility tasks
- Ranged combat
- Dodging
- Quick actions

### 3. Intellect (Mental Power)

- **Pool**: Maximum points available
- **Edge**: Cost reduction for effort
- **Current**: Available points right now

Used for:

- Mental tasks
- Esoteric abilities (for Nanos)
- Knowledge
- Willpower

---

## Important Mechanics

### Pools

- Represent character's capacity in each stat
- Can be spent to enhance actions (applying Effort)
- Depleted through use, damage, or special circumstances
- Recover through rest

### Edge

- Reduces the cost of actions
- Applied automatically when spending pool points
- Minimum cost is always 0 (can't go negative)
- Makes characters more efficient

### Current

- Available points right now
- Starts at pool maximum
- Decreases when:
  - Spending for Effort
  - Taking damage
  - Using abilities
- Recovers through:
  - Recovery rolls
  - Rest
  - Special abilities

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
- One-use powerful items
- Represent found/scavenged technology
- Should be used, not hoarded
- Random effects, varying power levels

**Example Cyphers:**

- Detonation (explosive)
- Stim (healing/enhancement)
- Ray Emitter (attack)
- Phase Disruptor (utility)

### Artifacts (Permanent Items)

- Permanent items with depletion mechanic
- **Depletion**: Roll after use to see if item breaks
  - Format: "1 in 1d20" or "1-2 in 1d100"
  - If depletion roll fails, artifact is destroyed
- More powerful than regular equipment
- Represent ancient, maintained technology

**Example Artifacts:**

- Lightning Generator
- Force Shield
- Gravity Nullifier
- Memory Enhancer

### Oddities (Curiosities)

- Strange items with no game mechanical effect
- Flavor items for roleplay
- Can be collected without limit
- Represent weird, inexplicable technology
- Add flavor and atmosphere

**Example Oddities:**

- A sphere that slowly rotates and hums
- Glowing cube that changes color with mood
- Device that makes nearby flowers bloom
- Crystal that shows distant places

---

## Recovery & Damage

### Recovery Rolls

- Character can make recovery rolls to restore pools
- Limited number per day
- Each roll recovers dice worth of points
- Distributed across pools as desired

**Recovery Track:**

- 1 Action (immediate)
- 10 Minutes
- 1 Hour
- 10 Hours (long rest)

### Damage

- Reduces pool points
- Attacker chooses which pool to damage
- When a pool reaches 0:
  - Character is impaired (all tasks hindered)
- When second pool reaches 0:
  - Character is debilitated (cannot act)
- When third pool reaches 0:
  - Character is dead

### Damage Track

- **Hale**: All pools above 0
- **Impaired**: One pool at 0 (disadvantaged)
- **Debilitated**: Two pools at 0 (barely functional)
- **Dead**: All three pools at 0

---

## Abilities

### Special Abilities

- Granted by Type, Descriptor, and Focus
- May cost pool points to activate
- May have limitations or requirements
- Defined by tier and advancement

### Attacks

- Basic attacks (weapon-based)
- Special attack abilities
- May cost pool points for additional effects
- Modified by skills and abilities

### Skills

- Trained or specialized in specific tasks
- Reduce difficulty of related actions
- Granted by various sources

---

## Data Model Considerations

### Character Properties (TypeScript):

```typescript
interface NumeneraCharacter {
  // Core Identity
  id: string;
  name: string;
  tier: number; // 1-6
  type: string; // 'Glaive' | 'Nano' | 'Jack'
  descriptor: string; // e.g., 'Strong'
  focus: string; // e.g., 'Bears a Halo of Fire'

  // Stats
  might: StatPool;
  speed: StatPool;
  intellect: StatPool;

  // Items
  cyphers: CypherItem[]; // Max 2-3
  artifacts: ArtifactItem[];
  oddities: OddityItem[];

  // Images
  portrait: string | null;
  additionalImages: string[];

  // Text Fields
  background: string;
  notes: string;
  equipment: string; // Non-artifact equipment
  abilities: string; // Special abilities description

  // Metadata
  lastModified: number;
}

interface StatPool {
  pool: number; // Maximum points
  edge: number; // Cost reduction
  current: number; // Available points
}

interface CypherItem {
  name: string;
  level: number;
  effect: string;
}

interface ArtifactItem {
  name: string;
  level: number;
  depletion: string; // e.g., "1 in 1d20"
  effect: string;
}

interface OddityItem {
  name: string;
  description: string;
}
```

---

## Character Sentence

Characters are described in a sentence:

**"I am a [adjective] [noun] who [verbs]"**

Example:

- "I am a **Strong Glaive** who **Bears a Halo of Fire**"
- "I am a **Clever Jack** who **Talks to Machines**"
- "I am an **Intelligent Nano** who **Controls Beasts**"

This sentence structure is core to character identity.

---

## Validation Rules

### Tier

- Must be 1-6
- Integer only

### Type

- Must be one of: Glaive, Nano, Jack
- Case-sensitive

### Stats

- Pool: Positive integer
- Edge: Non-negative integer (can be 0)
- Current: 0 to Pool (inclusive)
- Current cannot exceed Pool

### Cyphers

- Limit: 2-3 items
- Exact limit depends on character abilities
- Should validate against character's cypher limit

### Items

- Artifacts: No limit
- Oddities: No limit
- Equipment: No limit (text field)

---

## Feature Roadmap Context

### Current Phase: MVP (Phase 1)

- Single character display/edit
- Local storage only
- Basic responsive UI
- i18n infrastructure

### Next Phases:

- **Phase 2**: Multiple characters
- **Phase 3**: Reference data & modals
- **Phase 4**: Cloud sync
- **Phase 5**: Advanced features

---

## Resources

### Official:

- [Numenera Discovery RPG](https://www.montecookgames.com/store/product/numenera-discovery/)
- Monte Cook Games official site
- Numenera corebook

### Development:

- See `docs/ARCHITECTURE.md` for technical details
- See `architecture.md` for data model
- See other rule files for development standards

---

## Common Scenarios

### Creating a New Character:

1. Choose Type (Glaive, Nano, Jack)
2. Choose Descriptor
3. Choose Focus
4. Calculate initial stats based on choices
5. Select starting abilities
6. Note starting equipment
7. Set all Current values to Pool values

### Spending Pool Points:

1. Determine cost (ability or effort)
2. Choose which pool to spend from
3. Apply Edge (subtract from cost)
4. Deduct effective cost from Current
5. Minimum cost is 0

### Taking Damage:

1. Attacker chooses which pool
2. Subtract damage from Current
3. Check if pool reached 0 (impaired)
4. Check if second pool reached 0 (debilitated)
5. Check if third pool reached 0 (dead)

### Recovery:

1. Choose recovery roll from available
2. Roll recovery dice
3. Distribute recovered points across pools
4. Cannot exceed Pool maximum for any stat
5. Mark recovery roll as used

---

## Related Rules

- **Architecture:** See `architecture.md` for data model details
- **Testing:** See `testing.md` for test data creation
- **i18n:** See `i18n.md` for translating game terms

---

**This domain knowledge informs all character sheet functionality and validation.**
