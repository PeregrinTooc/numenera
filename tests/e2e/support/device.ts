// Rule 9 device profiles for the Cucumber suite. Kept free of Playwright
// imports so the resolution logic is unit-testable under Vitest.
export type DeviceKey = "desktop" | "pixel5" | "iphone12" | "ipadpro";
export type Engine = "chromium" | "webkit";
export type SectionInputKind = "mouse" | "touch";

export interface DeviceProfile {
  key: DeviceKey;
  descriptor: string;
  engine: Engine;
  /**
   * How section drags are driven. Real touch input exists in Playwright only
   * through CDP, i.e. Chromium; in its WebKit, `new Touch()` is an illegal
   * constructor and synthetic TouchEvents throw. iPhone 12 and iPad Pro 11
   * therefore drag with the mouse, and a Pixel 5 is the one touch device.
   */
  sectionInput: SectionInputKind;
}

export const DEVICE_PROFILES: Readonly<Record<DeviceKey, DeviceProfile>> = {
  desktop: {
    key: "desktop",
    descriptor: "Desktop Chrome",
    engine: "chromium",
    sectionInput: "mouse",
  },
  pixel5: { key: "pixel5", descriptor: "Pixel 5", engine: "chromium", sectionInput: "touch" },
  iphone12: { key: "iphone12", descriptor: "iPhone 12", engine: "webkit", sectionInput: "mouse" },
  ipadpro: { key: "ipadpro", descriptor: "iPad Pro 11", engine: "webkit", sectionInput: "mouse" },
};

function isDeviceKey(value: string): value is DeviceKey {
  return Object.prototype.hasOwnProperty.call(DEVICE_PROFILES, value);
}

/** Resolves the DEVICE env value; unset/empty → desktop; unknown → throws listing valid keys. */
export function resolveDevice(value: string | undefined): DeviceProfile {
  if (!value) return DEVICE_PROFILES.desktop;
  if (!isDeviceKey(value)) {
    throw new Error(
      `Unknown DEVICE "${value}". Use one of: ${Object.keys(DEVICE_PROFILES).join(", ")}`
    );
  }
  return DEVICE_PROFILES[value];
}
