import type { ViewportDriver } from "./viewportDriver.js";

export type Screen = "wide screen" | "phone";

const SCREEN_WIDTH: Record<Screen, number> = { "wide screen": 1280, phone: 390 };

/** The window the app is shown in. */
export class ScreenDsl {
  constructor(private viewport: ViewportDriver) {}

  async viewOn(screen: Screen): Promise<void> {
    await this.viewport.resizeTo(SCREEN_WIDTH[screen]);
  }

  /** For scenarios where an exact breakpoint is the point. */
  async resizeTo(width: number): Promise<void> {
    await this.viewport.resizeTo(width);
  }

  async expectNoSidewaysScroll(): Promise<void> {
    await this.viewport.expectNoSidewaysScroll();
  }

  async growToFullHeight(): Promise<void> {
    await this.viewport.growToFullHeight();
  }

  async withFullHeight<T>(action: () => Promise<T>): Promise<T> {
    return this.viewport.withFullHeight(action);
  }
}
