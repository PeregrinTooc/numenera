import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { SettingsGear } from "@/components/SettingsGear";
import { render } from "lit-html";
import { t } from "@/i18n/index";
import { setupTestContainer } from "./helpers/testSetup.js";

describe("SettingsGear", () => {
  const getContainer = setupTestContainer();
  let container: HTMLElement;
  let settingsGear: SettingsGear;
  let onLanguageChange: Mock<ConstructorParameters<typeof SettingsGear>[0]>;

  beforeEach(() => {
    container = getContainer();
    onLanguageChange = vi.fn();
    settingsGear = new SettingsGear(onLanguageChange);
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
      expect(gearButton?.getAttribute("aria-label")).toBe(t("settings.aria.openSettings"));
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

      render(settingsGear.render(), container);

      const panel = container.querySelector('[data-testid="settings-panel"]');
      expect(panel).toBeTruthy();
    });

    it("should close settings panel when clicking outside", () => {
      settingsGear.open();
      render(settingsGear.render(), container);

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

    describe("with the gear on the page", () => {
      beforeEach(() => {
        const draw = (): void => {
          render(settingsGear.render(), container);
        };
        settingsGear.setRerenderCallback(draw);
        draw();
      });

      const gearButton = (): HTMLButtonElement =>
        container.querySelector('[data-testid="settings-gear-button"]') as HTMLButtonElement;
      const panel = (): Element | null => container.querySelector('[data-testid="settings-panel"]');

      it("stays open after the click that opened it", () => {
        gearButton().click();

        expect(settingsGear.isOpen).toBe(true);
        expect(panel()).toBeTruthy();
      });

      it("closes on a click outside the panel", () => {
        gearButton().click();

        document.body.click();

        expect(settingsGear.isOpen).toBe(false);
        expect(panel()).toBeFalsy();
      });

      it("stays open on a click inside the panel", () => {
        gearButton().click();

        container.querySelector<HTMLElement>(".settings-panel-title")?.click();

        expect(settingsGear.isOpen).toBe(true);
      });

      it("closes on Escape", () => {
        gearButton().click();

        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

        expect(settingsGear.isOpen).toBe(false);
      });

      it("does not react to the document once closed", () => {
        const onRerender = vi.fn();
        settingsGear.open();
        settingsGear.close();
        settingsGear.setRerenderCallback(onRerender);

        document.body.click();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

        expect(onRerender).not.toHaveBeenCalled();
      });
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

      expect(englishFlag?.getAttribute("aria-label")).toBe(t("settings.aria.selectEnglish"));
      expect(germanFlag?.getAttribute("aria-label")).toBe(t("settings.aria.selectGerman"));
    });

    it("should close panel after language selection", () => {
      settingsGear.open();
      render(settingsGear.render(), container);

      const englishFlag = container.querySelector(
        '[data-testid="language-flag-en"]'
      ) as HTMLButtonElement;
      englishFlag.click();

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
      expect(resetOption?.getAttribute("title")).toBe(t("settings.resetLayoutDisabled"));
    });
  });

  describe("comparison view toggle", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it("is unchecked by default", () => {
      settingsGear.open();
      render(settingsGear.render(), container);

      const toggle = container.querySelector(
        '[data-testid="settings-comparison-view-toggle"]'
      ) as HTMLInputElement;
      expect(toggle.checked).toBe(false);
    });

    it("persists the preference when toggled on", () => {
      settingsGear.open();
      render(settingsGear.render(), container);

      const toggle = container.querySelector(
        '[data-testid="settings-comparison-view-toggle"]'
      ) as HTMLInputElement;
      toggle.checked = true;
      toggle.dispatchEvent(new Event("change"));

      expect(localStorage.getItem("numenera-comparison-view-enabled")).toBe("true");
    });

    it("reflects a previously-saved enabled preference on render", () => {
      localStorage.setItem("numenera-comparison-view-enabled", "true");
      settingsGear.open();
      render(settingsGear.render(), container);

      const toggle = container.querySelector(
        '[data-testid="settings-comparison-view-toggle"]'
      ) as HTMLInputElement;
      expect(toggle.checked).toBe(true);
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
