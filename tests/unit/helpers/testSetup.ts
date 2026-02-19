/**
 * Shared test setup helpers
 *
 * This module provides common setup patterns to eliminate duplication across test files:
 * - Container setup/teardown
 * - Mock character creation
 * - Common test utilities
 */

import { beforeEach, afterEach, vi } from "vitest";
import type { Character } from "../../../src/types/character";

/**
 * Sets up and tears down a test container attached to document.body
 * Returns a function that retrieves the current container
 *
 * Usage:
 * ```typescript
 * describe("MyComponent", () => {
 *   const getContainer = setupTestContainer();
 *
 *   it("should render", () => {
 *     render(component.render(), getContainer());
 *   });
 * });
 * ```
 */
export function setupTestContainer(): () => HTMLElement {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "test-container";
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    // Clean up any modals or other elements that might have been appended to body
    document.body.innerHTML = "";
  });

  return () => container;
}

/**
 * Creates a mock character with all required fields and sensible defaults
 * Optionally accepts partial overrides
 */
export function createMockCharacter(overrides: Partial<Character> = {}): Character {
  return {
    name: "Test Character",
    type: "Glaive",
    descriptor: "Strong",
    focus: "Bears a Halo of Fire",
    tier: 3,
    xp: 5,
    effort: 2,
    stats: {
      might: { pool: 12, edge: 1, current: 10 },
      speed: { pool: 10, edge: 0, current: 10 },
      intellect: { pool: 14, edge: 2, current: 14 },
    },
    armor: 2,
    shins: 50,
    maxCyphers: 3,
    cyphers: [],
    artifacts: [],
    oddities: [],
    equipment: [],
    abilities: [],
    specialAbilities: [],
    attacks: [],
    recoveryRolls: {
      action: false,
      tenMinutes: false,
      oneHour: false,
      tenHours: false,
      modifier: 0,
    },
    damageTrack: { impairment: "healthy" },
    textFields: { background: "", notes: "" },
    ...overrides,
  };
}

/**
 * Creates an empty character for testing empty state scenarios
 */
export function createEmptyCharacter(overrides: Partial<Character> = {}): Character {
  return {
    name: "",
    type: "Jack",
    descriptor: "",
    focus: "",
    tier: 1,
    xp: 0,
    effort: 1,
    stats: {
      might: { pool: 10, edge: 0, current: 10 },
      speed: { pool: 10, edge: 0, current: 10 },
      intellect: { pool: 10, edge: 0, current: 10 },
    },
    armor: 0,
    shins: 0,
    maxCyphers: 2,
    cyphers: [],
    artifacts: [],
    oddities: [],
    equipment: [],
    abilities: [],
    specialAbilities: [],
    attacks: [],
    recoveryRolls: {
      action: false,
      tenMinutes: false,
      oneHour: false,
      tenHours: false,
      modifier: 0,
    },
    damageTrack: { impairment: "healthy" },
    textFields: { background: "", notes: "" },
    ...overrides,
  };
}

/**
 * Creates a character with items for testing item-related functionality
 */
export function createCharacterWithItems(overrides: Partial<Character> = {}): Character {
  return createMockCharacter({
    cyphers: [{ name: "Detonation", level: "1d6+2", effect: "Explodes" }],
    artifacts: [
      { name: "Lightning Rod", level: "6", depletion: "1 in 1d20", effect: "Shoots lightning" },
    ],
    oddities: [{ description: "A glowing cube" }],
    equipment: ["Sword", "Shield"],
    abilities: [{ name: "Trained in Defense", description: "Reduces difficulty by 1" }],
    specialAbilities: [
      { name: "Bash", description: "Knock down opponent", cost: { type: "might", amount: 1 } },
    ],
    attacks: [
      { name: "Longsword", damage: "4", modifier: "+1", notes: "Medium weapon" },
      { name: "Crossbow", damage: "4", modifier: "0", notes: "Long range" },
    ],
    ...overrides,
  });
}

/**
 * Creates a mock update function and returns both the mock and a helper to get calls
 */
export function createMockUpdateFn<T = unknown>(): {
  fn: ReturnType<typeof vi.fn<[T], void>>;
  getCalls: () => T[];
  getLastCall: () => T | undefined;
} {
  const fn = vi.fn<[T], void>();

  return {
    fn,
    getCalls: () => fn.mock.calls.map((call) => call[0]),
    getLastCall: () => {
      const calls = fn.mock.calls;
      return calls.length > 0 ? calls[calls.length - 1][0] : undefined;
    },
  };
}

/**
 * Waits for a specified number of milliseconds
 * Useful for waiting on async operations like FileReader
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Waits for the next microtask
 */
export function nextTick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
