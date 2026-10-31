import { describe, it, expect, vi } from "vitest";
import { BasicInfo } from "@/components/BasicInfo";
import { render } from "lit-html";
import { setupBasicInfo } from "./helpers/basicInfoFixture";

describe("BasicInfo", () => {
  const ctx = setupBasicInfo();

  describe("Type Dropdown", () => {
    it("should change character type on selection", () => {
      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const typeSelect = ctx.container.querySelector(
        '[data-testid="character-type-select"]'
      ) as HTMLSelectElement;
      expect(typeSelect).toBeTruthy();
      expect(typeSelect.value).toBe("Glaive");

      // Change to Jack
      typeSelect.value = "Jack";
      typeSelect.dispatchEvent(new Event("change", { bubbles: true }));

      expect(ctx.mockCharacter.type).toBe("Jack");
    });

    it("should dispatch character-updated event on type change", () => {
      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const eventSpy = vi.fn();
      ctx.container
        .querySelector('[data-testid="basic-info"]')
        ?.addEventListener("character-updated", eventSpy);

      const typeSelect = ctx.container.querySelector(
        '[data-testid="character-type-select"]'
      ) as HTMLSelectElement;
      typeSelect.value = "Nano";
      typeSelect.dispatchEvent(new Event("change", { bubbles: true }));

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe("Editable Fields", () => {
    it("should render name as editable field", () => {
      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const nameField = ctx.container.querySelector(
        '[data-testid="character-name"]'
      ) as HTMLElement;
      expect(nameField).toBeTruthy();
      expect(nameField.textContent).toContain("Test Character");
      expect(nameField.classList.contains("editable-field")).toBe(true);
    });

    it("should render tier as editable field", () => {
      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const tierField = ctx.container.querySelector(
        '[data-testid="character-tier"]'
      ) as HTMLElement;
      expect(tierField).toBeTruthy();
      expect(tierField.textContent).toContain("3");
      expect(tierField.classList.contains("editable-field")).toBe(true);
    });

    it("should render descriptor as editable field", () => {
      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const descriptorField = ctx.container.querySelector(
        '[data-testid="character-descriptor"]'
      ) as HTMLElement;
      expect(descriptorField).toBeTruthy();
      expect(descriptorField.textContent).toContain("Strong");
      expect(descriptorField.classList.contains("editable-field")).toBe(true);
    });

    it("should render focus as editable field", () => {
      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const focusField = ctx.container.querySelector(
        '[data-testid="character-focus"]'
      ) as HTMLElement;
      expect(focusField).toBeTruthy();
      expect(focusField.textContent).toContain("Bears a Halo of Fire");
      expect(focusField.classList.contains("editable-field")).toBe(true);
    });

    it("should render current and total XP as independently editable cells", () => {
      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const currentCell = ctx.container.querySelector(
        '[data-testid="xp-badge-current"]'
      ) as HTMLElement;
      const totalCell = ctx.container.querySelector(
        '[data-testid="xp-badge-total"]'
      ) as HTMLElement;

      expect(currentCell).toBeTruthy();
      expect(currentCell.textContent).toContain("5");
      expect(currentCell.classList.contains("editable-field")).toBe(true);

      expect(totalCell).toBeTruthy();
      expect(totalCell.textContent).toContain("45");
      expect(totalCell.classList.contains("editable-field")).toBe(true);
    });
  });

  describe("Conditional Rendering", () => {
    it("should show descriptor placeholder when descriptor is empty", () => {
      ctx.mockCharacter.descriptor = "";

      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const descriptorField = ctx.container.querySelector(
        '[data-testid="character-descriptor"]'
      ) as HTMLElement;
      expect(descriptorField).toBeTruthy();
      // Should render fallback text (i18n key)
    });

    it("should show focus placeholder when focus is empty", () => {
      ctx.mockCharacter.focus = "";

      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const focusField = ctx.container.querySelector(
        '[data-testid="character-focus"]'
      ) as HTMLElement;
      expect(focusField).toBeTruthy();
      // Should render fallback text (i18n key)
    });

    it("should render upload button when no portrait", () => {
      ctx.mockCharacter.portrait = undefined;

      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const uploadButton = ctx.container.querySelector(".portrait-upload") as HTMLElement;
      expect(uploadButton).toBeTruthy();

      const removeButton = ctx.container.querySelector('[data-testid="portrait-remove-button"]');
      expect(removeButton).toBeFalsy();
    });

    it("should render change/remove buttons when portrait exists", () => {
      ctx.mockCharacter.portrait = "data:image/jpeg;base64,fake";

      const basicInfo = new BasicInfo(ctx.mockCharacter, ctx.onFieldUpdate);
      render(basicInfo.render(), ctx.container);

      const changeButton = ctx.container.querySelector(".portrait-change") as HTMLElement;
      const removeButton = ctx.container.querySelector(
        '[data-testid="portrait-remove-button"]'
      ) as HTMLElement;

      expect(changeButton).toBeTruthy();
      expect(removeButton).toBeTruthy();
    });
  });
});
