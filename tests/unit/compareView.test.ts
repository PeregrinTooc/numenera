import { describe, it, expect, beforeEach, vi } from "vitest";
import { CompareView } from "../../src/components/CompareView";
import { VersionState } from "../../src/services/versionState";
import { VersionHistoryManager } from "../../src/storage/versionHistory";
import type { CharacterVersion } from "../../src/types/versionHistory";
import { createTestCharacter } from "../factories/character.js";
import { setupTestContainer } from "./helpers/testSetup.js";

describe("CompareView", () => {
  let mockVersionHistory: VersionHistoryManager;
  let versionState: VersionState;
  const getContainer = setupTestContainer();

  const createMockCharacter = (name: string) => createTestCharacter({ name });

  const createMockVersion = (name: string, description: string, id: string): CharacterVersion => {
    const character = createMockCharacter(name);
    const { portrait: _portrait, ...characterWithoutPortrait } = character as any;
    return {
      id,
      character: characterWithoutPortrait,
      timestamp: Date.now(),
      description,
      etag: `etag-${id}`,
    };
  };

  async function setUpVersions(count: number): Promise<void> {
    const versions = Array.from({ length: count }, (_, i) =>
      createMockVersion(`Version ${i + 1}`, `Edit ${i + 1}`, `id-${i + 1}`)
    );
    vi.mocked(mockVersionHistory.getAllVersions).mockResolvedValue(versions);
    await versionState.init();
  }

  beforeEach(async () => {
    mockVersionHistory = {
      getAllVersions: vi.fn(),
      saveVersion: vi.fn().mockResolvedValue(undefined),
    } as any;
    const latestCharacter = createMockCharacter("Latest");
    versionState = new VersionState(latestCharacter, mockVersionHistory);
  });

  it("seeds the right pane with the given index and the left pane one before it", async () => {
    await setUpVersions(5);
    const compareView = new CompareView({
      versionState,
      initialLeftIndex: 3,
      initialRightIndex: 4,
      onExit: vi.fn(),
      onRestored: vi.fn(),
    });

    compareView.mount(getContainer());

    expect(
      getContainer().querySelector('[data-testid="compare-pane-left-counter"]')?.textContent
    ).toContain("4");
    expect(
      getContainer().querySelector('[data-testid="compare-pane-right-counter"]')?.textContent
    ).toContain("5");
  });

  it("moving the left pane's arrow does not move the right pane", async () => {
    await setUpVersions(5);
    const compareView = new CompareView({
      versionState,
      initialLeftIndex: 3,
      initialRightIndex: 4,
      onExit: vi.fn(),
      onRestored: vi.fn(),
    });
    compareView.mount(getContainer());

    (
      getContainer().querySelector(
        '[data-testid="compare-pane-left-backward"]'
      ) as HTMLButtonElement
    ).click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      getContainer().querySelector('[data-testid="compare-pane-left-counter"]')?.textContent
    ).toContain("3");
    expect(
      getContainer().querySelector('[data-testid="compare-pane-right-counter"]')?.textContent
    ).toContain("5");
  });

  it("disables a pane's restore button when it already shows the latest version", async () => {
    await setUpVersions(5);
    const compareView = new CompareView({
      versionState,
      initialLeftIndex: 3,
      initialRightIndex: 4,
      onExit: vi.fn(),
      onRestored: vi.fn(),
    });
    compareView.mount(getContainer());

    const rightRestore = getContainer().querySelector(
      '[data-testid="compare-pane-right-restore"]'
    ) as HTMLButtonElement;
    const leftRestore = getContainer().querySelector(
      '[data-testid="compare-pane-left-restore"]'
    ) as HTMLButtonElement;

    expect(rightRestore.disabled).toBe(true);
    expect(leftRestore.disabled).toBe(false);
  });

  it("restoring a pane saves it as a new latest version and calls onRestored", async () => {
    await setUpVersions(5);
    const onRestored = vi.fn();
    const compareView = new CompareView({
      versionState,
      initialLeftIndex: 3,
      initialRightIndex: 4,
      onExit: vi.fn(),
      onRestored,
    });
    compareView.mount(getContainer());

    const leftRestore = getContainer().querySelector(
      '[data-testid="compare-pane-left-restore"]'
    ) as HTMLButtonElement;
    leftRestore.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockVersionHistory.saveVersion).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Version 4" }),
      "Restored: Edit 4"
    );
    expect(onRestored).toHaveBeenCalled();
  });

  it("keeps the other pane pointing at the same version id after a restore evicts the oldest (FIFO)", async () => {
    // Simulate being at the 99-version cap: the next saveVersion() call will
    // evict version 1 and shift every remaining index down by one.
    await setUpVersions(99);
    const compareView = new CompareView({
      versionState,
      initialLeftIndex: 49, // "Version 50" - this pane must not move
      initialRightIndex: 80, // not the latest, so its restore is meaningful
      onExit: vi.fn(),
      onRestored: vi.fn(),
    });
    compareView.mount(getContainer());

    // After restoring the right pane, simulate the FIFO eviction: storage
    // now returns 99 versions again, but "Version 1" (id-1) is gone and
    // every other id has shifted down by one index.
    const versionsAfterRestore = Array.from({ length: 99 }, (_, i) => {
      if (i < 97) {
        return createMockVersion(`Version ${i + 2}`, `Edit ${i + 2}`, `id-${i + 2}`);
      }
      const character = createMockCharacter("Restored");
      const { portrait: _portrait, ...rest } = character as any;
      return {
        id: "id-restored",
        character: rest,
        timestamp: Date.now(),
        description: "Restored: Edit 99",
        etag: "etag-restored",
      };
    });
    vi.mocked(mockVersionHistory.getAllVersions).mockResolvedValue(versionsAfterRestore);

    const rightRestore = getContainer().querySelector(
      '[data-testid="compare-pane-right-restore"]'
    ) as HTMLButtonElement;
    rightRestore.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Left pane was showing "Version 50" (id-50), which is now at index 48
    // (index 49 shifted down by one because id-1 was evicted).
    expect(
      getContainer().querySelector('[data-testid="compare-pane-left-counter"]')?.textContent
    ).toContain("49");
  });

  it("calls onExit when the exit button is clicked", async () => {
    await setUpVersions(3);
    const onExit = vi.fn();
    const compareView = new CompareView({
      versionState,
      initialLeftIndex: 1,
      initialRightIndex: 2,
      onExit,
      onRestored: vi.fn(),
    });
    compareView.mount(getContainer());

    (
      getContainer().querySelector('[data-testid="comparison-exit-button"]') as HTMLButtonElement
    ).click();

    expect(onExit).toHaveBeenCalled();
  });

  it("shows every changed field in the header, uncapped", async () => {
    await setUpVersions(2);
    // Make version 2 differ from version 1 in more than 3 ways.
    const versions = [
      createMockVersion("Version 1", "Initial", "id-1"),
      {
        ...createMockVersion("Version 2", "Edit 1", "id-2"),
        character: {
          ...createMockCharacter("Version 2"),
          tier: 2,
          shins: 99,
          armor: 3,
        },
      },
    ];
    vi.mocked(mockVersionHistory.getAllVersions).mockResolvedValue(versions as any);
    await versionState.reload();

    const compareView = new CompareView({
      versionState,
      initialLeftIndex: 0,
      initialRightIndex: 1,
      onExit: vi.fn(),
      onRestored: vi.fn(),
    });
    compareView.mount(getContainer());

    const items = getContainer().querySelectorAll('[data-testid="comparison-header"] li');
    expect(items.length).toBeGreaterThan(3);
  });
});
