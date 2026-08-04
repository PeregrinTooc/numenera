// Unit tests for RecoveryDamageSection component

import { render } from "lit-html";
import { RecoveryDamageSection } from "../../src/components/RecoveryDamageSection.js";
import { Character } from "../../src/types/character.js";

vi.mock("../../src/storage/storageFactory.js");

describe("RecoveryDamageSection", () => {
  let container: HTMLElement;
  let mockCharacter: Character;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "app";
    document.body.appendChild(container);

    mockCharacter = {
      name: "Test Character",
      tier: 1,
      type: "Glaive",
      descriptor: "Strong",
      focus: "Combat",
      currentXp: 0,
      totalXp: 0,
      shins: 10,
      armor: 1,
      effort: 1,
      maxCyphers: 2,
      stats: {
        might: { pool: 10, edge: 0, current: 10 },
        speed: { pool: 10, edge: 0, current: 10 },
        intellect: { pool: 10, edge: 0, current: 10 },
      },
      cyphers: [],
      artifacts: [],
      oddities: [],
      abilities: [],
      equipment: [],
      attacks: [],
      specialAbilities: [],
      recoveryRolls: {
        action: false,
        tenMinutes: false,
        oneHour: false,
        tenHours: false,
        modifier: 0,
      },
      damageTrack: {
        impairment: "healthy",
      },
      textFields: {
        background: "",
        notes: "",
      },
    };
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should update and persist the model when a recovery checkbox is ticked", async () => {
    const { persistCharacterState } = await import("../../src/storage/storageFactory.js");
    vi.mocked(persistCharacterState).mockClear();

    const component = new RecoveryDamageSection(mockCharacter);
    render(component.render(), container);

    const checkbox = container.querySelector(
      '[data-testid="recovery-ten-minutes"]'
    ) as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));

    expect(mockCharacter.recoveryRolls.tenMinutes).toBe(true);
    expect(persistCharacterState).toHaveBeenCalledWith(mockCharacter);
  });

  it("should dispatch character-updated when a recovery checkbox is ticked", () => {
    const component = new RecoveryDamageSection(mockCharacter);
    render(component.render(), container);

    const eventSpy = vi.fn();
    container.addEventListener("character-updated", eventSpy);

    const checkbox = container.querySelector('[data-testid="recovery-action"]') as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));

    expect(eventSpy).toHaveBeenCalled();
  });

  it("should update and persist the model when a damage status is selected", async () => {
    const { persistCharacterState } = await import("../../src/storage/storageFactory.js");
    vi.mocked(persistCharacterState).mockClear();

    const component = new RecoveryDamageSection(mockCharacter);
    render(component.render(), container);

    const radio = container.querySelector('[data-testid="damage-impaired"]') as HTMLInputElement;
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true }));

    expect(mockCharacter.damageTrack.impairment).toBe("impaired");
    expect(persistCharacterState).toHaveBeenCalledWith(mockCharacter);
  });

  it("should dispatch character-updated when a damage status is selected", () => {
    const component = new RecoveryDamageSection(mockCharacter);
    render(component.render(), container);

    const eventSpy = vi.fn();
    container.addEventListener("character-updated", eventSpy);

    const radio = container.querySelector('[data-testid="damage-debilitated"]') as HTMLInputElement;
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true }));

    expect(eventSpy).toHaveBeenCalled();
  });
});
