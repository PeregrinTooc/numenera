import { beforeEach, vi, type Mock } from "vitest";
import { BasicInfo } from "@/components/BasicInfo";
import type { Character } from "@/types/character";
import { setupTestContainer } from "./testSetup.js";

export interface BasicInfoFixture {
  readonly container: HTMLElement;
  readonly mockCharacter: Character;
  readonly onFieldUpdate: Mock<ConstructorParameters<typeof BasicInfo>[1]>;
}

/**
 * Registers hooks that give each test a mounted container, a fresh character
 * and a mocked field-update callback. Returns live accessors.
 */
export function setupBasicInfo(): BasicInfoFixture {
  const getContainer = setupTestContainer();
  const fixture = {} as {
    container: HTMLElement;
    mockCharacter: Character;
    onFieldUpdate: Mock<ConstructorParameters<typeof BasicInfo>[1]>;
  };

  beforeEach(() => {
    fixture.container = getContainer();

    fixture.mockCharacter = {
      name: "Test Character",
      type: "Glaive",
      descriptor: "Strong",
      focus: "Bears a Halo of Fire",
      tier: 3,
      currentXp: 5,
      totalXp: 45,
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
      abilities: [],
      specialAbilities: [],
      equipment: [],
      artifacts: [],
      oddities: [],
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
    };

    fixture.onFieldUpdate = vi.fn();
  });

  return fixture;
}
