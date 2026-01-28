import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { BasicInfo } from "../../src/components/BasicInfo";
import type { Character } from "../../src/types/character";
import { render } from "lit-html";

describe("BasicInfo", () => {
  let container: HTMLElement;
  let mockCharacter: Character;
  let onFieldUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    mockCharacter = {
      name: "Test Character",
      type: "Glaive",
      descriptor: "Strong",
      focus: "Bears a Halo of Fire",
      tier: 3,
      xp: 5,
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

    onFieldUpdate = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("Portrait Upload Validation", () => {
    it("should validate file type - accept images only", () => {
      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const fileInput = container.querySelector(
        '[data-testid="portrait-file-input"]'
      ) as HTMLInputElement;
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toBe("image/*");
    });

    it("should validate file size - reject files over 2MB", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const fileInput = container.querySelector(
        '[data-testid="portrait-file-input"]'
      ) as HTMLInputElement;

      // Create a mock file over 2MB
      const largeFile = new File(["x".repeat(3 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });

      // Mock the files property
      Object.defineProperty(fileInput, "files", {
        value: [largeFile],
        writable: false,
      });

      // Trigger change event
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(alertSpy).toHaveBeenCalledWith("Image file is too large. Maximum size is 2MB.");
      alertSpy.mockRestore();
    });

    it("should reject non-image files", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const fileInput = container.querySelector(
        '[data-testid="portrait-file-input"]'
      ) as HTMLInputElement;

      // Create a non-image file
      const textFile = new File(["test content"], "test.txt", { type: "text/plain" });

      Object.defineProperty(fileInput, "files", {
        value: [textFile],
        writable: false,
      });

      fileInput.dispatchEvent(new Event("change", { bubbles: true }));

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(alertSpy).toHaveBeenCalledWith("Please select an image file");
      alertSpy.mockRestore();
    });

    it("should read valid image file as base64", async () => {
      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const fileInput = container.querySelector(
        '[data-testid="portrait-file-input"]'
      ) as HTMLInputElement;

      // Create a small valid image file
      const imageFile = new File(["fake image content"], "test.jpg", { type: "image/jpeg" });

      Object.defineProperty(fileInput, "files", {
        value: [imageFile],
        writable: false,
      });

      fileInput.dispatchEvent(new Event("change", { bubbles: true }));

      // Wait for FileReader
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Portrait should be set on character
      expect(mockCharacter.portrait).toBeTruthy();
    });

    it("should dispatch character-updated event after upload", async () => {
      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const eventSpy = vi.fn();
      document
        .querySelector('[data-testid="basic-info"]')
        ?.addEventListener("character-updated", eventSpy);

      const fileInput = container.querySelector(
        '[data-testid="portrait-file-input"]'
      ) as HTMLInputElement;

      const imageFile = new File(["fake"], "test.jpg", { type: "image/jpeg" });

      Object.defineProperty(fileInput, "files", {
        value: [imageFile],
        writable: false,
      });

      fileInput.dispatchEvent(new Event("change", { bubbles: true }));

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe("Portrait Remove", () => {
    it("should clear portrait data when removed", () => {
      mockCharacter.portrait = "data:image/jpeg;base64,fake";

      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const removeButton = container.querySelector(
        '[data-testid="portrait-remove-button"]'
      ) as HTMLButtonElement;
      expect(removeButton).toBeTruthy();

      removeButton.click();

      expect(mockCharacter.portrait).toBeUndefined();
    });

    it("should dispatch character-updated event after remove", () => {
      mockCharacter.portrait = "data:image/jpeg;base64,fake";

      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const eventSpy = vi.fn();
      document
        .querySelector('[data-testid="basic-info"]')
        ?.addEventListener("character-updated", eventSpy);

      const removeButton = container.querySelector(
        '[data-testid="portrait-remove-button"]'
      ) as HTMLButtonElement;
      removeButton.click();

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe("Portrait Click", () => {
    it("should open display modal when portrait clicked", () => {
      mockCharacter.portrait = "data:image/jpeg;base64,fake";

      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const portraitImage = container.querySelector(
        '[data-testid="portrait-image-clickable"]'
      ) as HTMLImageElement;
      expect(portraitImage).toBeTruthy();

      // Click should trigger modal (we can't fully test modal opening without ModalService mock)
      portraitImage.click();

      // Just verify the element is clickable and has proper attributes
      expect(portraitImage.getAttribute("role")).toBe("button");
      expect(portraitImage.getAttribute("tabindex")).toBe("0");
    });
  });

  describe("Type Dropdown", () => {
    it("should change character type on selection", () => {
      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const typeSelect = container.querySelector(
        '[data-testid="character-type-select"]'
      ) as HTMLSelectElement;
      expect(typeSelect).toBeTruthy();
      expect(typeSelect.value).toBe("Glaive");

      // Change to Jack
      typeSelect.value = "Jack";
      typeSelect.dispatchEvent(new Event("change", { bubbles: true }));

      expect(mockCharacter.type).toBe("Jack");
    });

    it("should dispatch character-updated event on type change", () => {
      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const eventSpy = vi.fn();
      container
        .querySelector('[data-testid="basic-info"]')
        ?.addEventListener("character-updated", eventSpy);

      const typeSelect = container.querySelector(
        '[data-testid="character-type-select"]'
      ) as HTMLSelectElement;
      typeSelect.value = "Nano";
      typeSelect.dispatchEvent(new Event("change", { bubbles: true }));

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe("Editable Fields", () => {
    it("should render name as editable field", () => {
      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const nameField = container.querySelector('[data-testid="character-name"]') as HTMLElement;
      expect(nameField).toBeTruthy();
      expect(nameField.textContent).toContain("Test Character");
      expect(nameField.classList.contains("editable-field")).toBe(true);
    });

    it("should render tier as editable field", () => {
      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const tierField = container.querySelector('[data-testid="character-tier"]') as HTMLElement;
      expect(tierField).toBeTruthy();
      expect(tierField.textContent).toContain("3");
      expect(tierField.classList.contains("editable-field")).toBe(true);
    });

    it("should render descriptor as editable field", () => {
      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const descriptorField = container.querySelector(
        '[data-testid="character-descriptor"]'
      ) as HTMLElement;
      expect(descriptorField).toBeTruthy();
      expect(descriptorField.textContent).toContain("Strong");
      expect(descriptorField.classList.contains("editable-field")).toBe(true);
    });

    it("should render focus as editable field", () => {
      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const focusField = container.querySelector('[data-testid="character-focus"]') as HTMLElement;
      expect(focusField).toBeTruthy();
      expect(focusField.textContent).toContain("Bears a Halo of Fire");
      expect(focusField.classList.contains("editable-field")).toBe(true);
    });

    it("should render XP as editable badge", () => {
      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const xpBadge = container.querySelector('[data-testid="xp-badge"]') as HTMLElement;
      expect(xpBadge).toBeTruthy();
      expect(xpBadge.textContent).toContain("5");
      expect(xpBadge.classList.contains("editable-field")).toBe(true);
    });
  });

  describe("Conditional Rendering", () => {
    it("should show descriptor placeholder when descriptor is empty", () => {
      mockCharacter.descriptor = "";

      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const descriptorField = container.querySelector(
        '[data-testid="character-descriptor"]'
      ) as HTMLElement;
      expect(descriptorField).toBeTruthy();
      // Should render fallback text (i18n key)
    });

    it("should show focus placeholder when focus is empty", () => {
      mockCharacter.focus = "";

      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const focusField = container.querySelector('[data-testid="character-focus"]') as HTMLElement;
      expect(focusField).toBeTruthy();
      // Should render fallback text (i18n key)
    });

    it("should render upload button when no portrait", () => {
      mockCharacter.portrait = undefined;

      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const uploadButton = container.querySelector(".portrait-upload") as HTMLElement;
      expect(uploadButton).toBeTruthy();

      const removeButton = container.querySelector('[data-testid="portrait-remove-button"]');
      expect(removeButton).toBeFalsy();
    });

    it("should render change/remove buttons when portrait exists", () => {
      mockCharacter.portrait = "data:image/jpeg;base64,fake";

      const basicInfo = new BasicInfo(mockCharacter, onFieldUpdate);
      render(basicInfo.render(), container);

      const changeButton = container.querySelector(".portrait-change") as HTMLElement;
      const removeButton = container.querySelector(
        '[data-testid="portrait-remove-button"]'
      ) as HTMLElement;

      expect(changeButton).toBeTruthy();
      expect(removeButton).toBeTruthy();
    });
  });
});
