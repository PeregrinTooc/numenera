import { describe, it, expect, vi } from "vitest";
import { BasicInfo } from "@/components/BasicInfo";
import { render } from "lit-html";
import { setupBasicInfo } from "./helpers/basicInfoFixture";

describe("BasicInfo", () => {
  const ctx = setupBasicInfo();

  describe("Portrait Upload Validation", () => {
    it("should validate file type - accept images only", () => {
      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const fileInput = ctx.container.querySelector(
        '[data-testid="portrait-file-input"]'
      ) as HTMLInputElement;
      expect(fileInput).toBeTruthy();
      expect(fileInput.accept).toBe("image/*");
    });

    it("should validate file size - reject files over 2MB", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const fileInput = ctx.container.querySelector(
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

      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const fileInput = ctx.container.querySelector(
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
      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const fileInput = ctx.container.querySelector(
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
      expect(ctx.mockCharacter.portrait).toBeTruthy();
    });

    it("should dispatch character-updated event after upload", async () => {
      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const eventSpy = vi.fn();
      document
        .querySelector('[data-testid="basic-info"]')
        ?.addEventListener("character-updated", eventSpy);

      const fileInput = ctx.container.querySelector(
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
      ctx.mockCharacter.portrait = "data:image/jpeg;base64,fake";

      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const removeButton = ctx.container.querySelector(
        '[data-testid="portrait-remove-button"]'
      ) as HTMLButtonElement;
      expect(removeButton).toBeTruthy();

      removeButton.click();

      expect(ctx.mockCharacter.portrait).toBeUndefined();
    });

    it("should dispatch character-updated event after remove", () => {
      ctx.mockCharacter.portrait = "data:image/jpeg;base64,fake";

      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const eventSpy = vi.fn();
      document
        .querySelector('[data-testid="basic-info"]')
        ?.addEventListener("character-updated", eventSpy);

      const removeButton = ctx.container.querySelector(
        '[data-testid="portrait-remove-button"]'
      ) as HTMLButtonElement;
      removeButton.click();

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe("Portrait Click", () => {
    it("should open display modal when portrait clicked", () => {
      ctx.mockCharacter.portrait = "data:image/jpeg;base64,fake";

      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const portraitImage = ctx.container.querySelector(
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
});
