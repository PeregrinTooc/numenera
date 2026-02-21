import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SettingsGear } from "../../src/components/SettingsGear";
import { render } from "lit-html";

// Mock i18n
vi.mock("../../src/i18n/index.js", () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      "settings.title": "Settings",
      "settings.language": "Language",
      "settings.resetLayout": "Reset Layout",
      "settings.resetLayoutDisabled": "Layout customization coming soon",
      "settings.aria.openSettings": "Open settings",
      "settings.aria.closeSettings": "Close settings",
      "settings.aria.selectEnglish": "Switch to English",
      "settings.aria.selectGerman": "Switch to German",
    };
    return translations[key] || key;
  },
  changeLanguage: vi.fn(),
  getCurrentLanguage: vi.fn(() => "en"),
}));

describe("SettingsGear", () => {
  let container: HTMLElement;
  let settingsGear: SettingsGear;
  let onLanguageChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    onLanguageChange = vi.fn();
    settingsGear = new SettingsGear(onLanguageChange);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("render", () => {
    it("should render a settings gear button", () => {
      render(settingsGear.render(), container);

      const gearButton = container.querySelector('[data-testid="settings-gear-button"]');
      expect(gearButton).toBeTruthy();
    });

    it("should have correct aria-label for accessibility", () => {
      render(settingsGear.render(), container);

      const gearButton = container.querySelector('[data-testid="settings-gear-button"]');
      expect(gearButton?.getAttribute("aria-label")).toBe("Open settings");
    });

    it("should not show settings panel by default", () => {
      render(settingsGear.render(), container);

      const panel = container.querySelector('[data-testid="settings-panel"]');
      expect(panel).toBeFalsy();
    });
  });

  describe("open/close settings panel", () => {
    it("should show settings panel when gear button is clicked", () => {
      render(settingsGear.render(), container);

      const gearButton = container.querySelector(
        '[data-testid="settings-gear-button"]'
      ) as HTMLButtonElement;
      gearButton.click();

      // Re-render after state change
      render(settingsGear.render(), container);

      const panel = container.querySelector('[data-testid="settings-panel"]');
      expect(panel).toBeTruthy();
    });

    it("should close settings panel when clicking outside", () => {
      settingsGear.open();
      render(settingsGear.render(), container);

      // Simulate click outside
      settingsGear.close();
      render(settingsGear.render(), container);

      const panel = container.querySelector('[data-testid="settings-panel"]');
      expect(panel).toBeFalsy();
    });

    it("should toggle isOpen state correctly", () => {
      expect(settingsGear.isOpen).toBe(false);

      settingsGear.open();
      expect(settingsGear.isOpen).toBe(true);

      settingsGear.close();
      expect(settingsGear.isOpen).toBe(false);
    });
  });

  describe("language selection", () => {
    it("should display flag icons for language selection", () => {
      settingsGear.open();
      render(settingsGear.render(), container);

      const englishFlag = container.querySelector('[data-testid="language-flag-en"]');
      const germanFlag = container.querySelector('[data-testid="language-flag-de"]');

      expect(englishFlag).toBeTruthy();
      expect(germanFlag).toBeTruthy();
    });

    it("should call onLanguageChange when English flag is clicked", () => {
      settingsGear.open();
      render(settingsGear.render(), container);

      const englishFlag = container.querySelector(
        '[data-testid="language-flag-en"]'
      ) as HTMLButtonElement;
      englishFlag.click();

      expect(onLanguageChange).toHaveBeenCalledWith("en");
    });

    it("should call onLanguageChange when German flag is clicked", () => {
      settingsGear.open();
      render(settingsGear.render(), container);

      const germanFlag = container.querySelector(
        '[data-testid="language-flag-de"]'
      ) as HTMLButtonElement;
      germanFlag.click();

      expect(onLanguageChange).toHaveBeenCalledWith("de");
    });

    it("should have correct aria-labels on flag buttons", () => {
      settingsGear.open();
      render(settingsGear.render(), container);

      const englishFlag = container.querySelector('[data-testid="language-flag-en"]');
      const germanFlag = container.querySelector('[data-testid="language-flag-de"]');

      expect(englishFlag?.getAttribute("aria-label")).toBe("Switch to English");
      expect(germanFlag?.getAttribute("aria-label")).toBe("Switch to German");
    });

    it("should close panel after language selection", () => {
      settingsGear.open();
      render(settingsGear.render(), container);

      const englishFlag = container.querySelector(
        '[data-testid="language-flag-en"]'
      ) as HTMLButtonElement;
      englishFlag.click();

      // Re-render after state change
      render(settingsGear.render(), container);

      expect(settingsGear.isOpen).toBe(false);
    });
  });

  describe("reset layout option", () => {
    it("should display Reset Layout option in panel", () => {
      settingsGear.open();
      render(settingsGear.render(), container);

      const resetOption = container.querySelector('[data-testid="settings-reset-layout"]');
      expect(resetOption).toBeTruthy();
    });

    it("should have Reset Layout option disabled by default", () => {
      settingsGear.open();
      render(settingsGear.render(), container);

      const resetOption = container.querySelector(
        '[data-testid="settings-reset-layout"]'
      ) as HTMLButtonElement;
      expect(resetOption.disabled).toBe(true);
    });

    it("should show tooltip explaining disabled state", () => {
      settingsGear.open();
      render(settingsGear.render(), container);

      const resetOption = container.querySelector('[data-testid="settings-reset-layout"]');
      expect(resetOption?.getAttribute("title")).toBe("Layout customization coming soon");
    });
  });

  describe("keyboard navigation", () => {
    it("should close panel when Escape key is pressed", () => {
      settingsGear.open();
      expect(settingsGear.isOpen).toBe(true);

      settingsGear.handleKeyDown(new KeyboardEvent("keydown", { key: "Escape" }));

      expect(settingsGear.isOpen).toBe(false);
    });

    it("should not close panel for other keys", () => {
      settingsGear.open();
      expect(settingsGear.isOpen).toBe(true);

      settingsGear.handleKeyDown(new KeyboardEvent("keydown", { key: "Enter" }));

      expect(settingsGear.isOpen).toBe(true);
    });
  });

  describe("positioning", () => {
    it("should have settings container with relative positioning", () => {
      render(settingsGear.render(), container);

      const settingsContainer = container.querySelector('[data-testid="settings-container"]');
      expect(settingsContainer).toBeTruthy();
      expect(settingsContainer?.classList.contains("settings-container")).toBe(true);
    });
  });
});
