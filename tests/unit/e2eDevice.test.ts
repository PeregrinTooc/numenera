import { describe, it, expect } from "vitest";
import { resolveDevice } from "../e2e/support/device";

describe("resolveDevice", () => {
  it("defaults to the desktop Chrome profile when DEVICE is unset", () => {
    expect(resolveDevice(undefined)).toEqual({
      key: "desktop",
      descriptor: "Desktop Chrome",
      engine: "chromium",
      sectionInput: "mouse",
    });
  });

  it("treats an empty DEVICE as unset", () => {
    expect(resolveDevice("").key).toBe("desktop");
  });

  it("runs iPhone 12 and iPad Pro on WebKit, as their real browsers do", () => {
    expect(resolveDevice("iphone12")).toEqual({
      key: "iphone12",
      descriptor: "iPhone 12",
      engine: "webkit",
      sectionInput: "mouse",
    });
    expect(resolveDevice("ipadpro")).toEqual({
      key: "ipadpro",
      descriptor: "iPad Pro 11",
      engine: "webkit",
      sectionInput: "mouse",
    });
  });

  it("runs Pixel 5 on Chromium", () => {
    expect(resolveDevice("pixel5").engine).toBe("chromium");
  });

  it("drags sections by touch only where Playwright can send real touch input", () => {
    expect(resolveDevice("pixel5").sectionInput).toBe("touch");
  });

  it("rejects an unknown device, naming the valid ones", () => {
    expect(() => resolveDevice("ipad")).toThrow(/desktop, pixel5, iphone12, ipadpro/);
  });
});
