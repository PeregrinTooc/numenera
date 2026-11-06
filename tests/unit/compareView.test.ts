import { describe, it, expect, beforeEach, vi } from "vitest";
import { CompareView } from "@/components/CompareView";
import { VersionState } from "@/services/versionState";
import { createTestCharacter } from "../factories/character.js";
import { seedVersions, setupRealVersionHistory } from "./helpers/realVersionHistory";
import { setupTestContainer } from "./helpers/testSetup.js";
import { restoredDescription } from "@/services/versionDescriptionText";

describe("CompareView", () => {
  const history = setupRealVersionHistory();
  let versionState: VersionState;
  const getContainer = setupTestContainer();

  const createMockCharacter = (name: string) => createTestCharacter({ name });

  async function setUpVersions(count: number): Promise<void> {
    await seedVersions(
      history.manager,
      Array.from({ length: count }, (_, i) => ({
        name: `Version ${i + 1}`,
        description: `Edit ${i + 1}`,
      }))
    );
    await versionState.init();
  }

  beforeEach(() => {
    versionState = new VersionState(createMockCharacter("Latest"), history.manager);
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
    await vi.waitFor(() => expect(onRestored).toHaveBeenCalled());

    const stored = await history.manager.getAllVersions();
    expect(stored[stored.length - 1].character.name).toBe("Version 4");
    expect(stored[stored.length - 1].description).toBe(restoredDescription("Edit 4"));
  });

  it("keeps the other pane pointing at the same version id after a restore evicts the oldest (FIFO)", async () => {
    // At the 99-version cap the next save evicts version 1 and shifts every
    // remaining index down by one.
    await setUpVersions(99);
    const compareView = new CompareView({
      versionState,
      initialLeftIndex: 49, // "Version 50" - this pane must not move
      initialRightIndex: 80, // not the latest, so its restore is meaningful
      onExit: vi.fn(),
      onRestored: vi.fn(),
    });
    compareView.mount(getContainer());

    const rightRestore = getContainer().querySelector(
      '[data-testid="compare-pane-right-restore"]'
    ) as HTMLButtonElement;
    rightRestore.click();

    // Left pane was showing "Version 50" (id-50), which is now at index 48
    // (index 49 shifted down by one because id-1 was evicted).
    await vi.waitFor(() =>
      expect(
        getContainer().querySelector('[data-testid="compare-pane-left-counter"]')?.textContent
      ).toContain("49")
    );
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
    await seedVersions(history.manager, [{ name: "Version 1", description: "Initial" }]);
    await history.manager.saveVersion(
      { ...createMockCharacter("Version 2"), tier: 2, shins: 99, armor: 3 },
      "Edit 1"
    );
    await versionState.init();

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
