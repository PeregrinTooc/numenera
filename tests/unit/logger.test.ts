import { describe, it, expect, vi, afterEach } from "vitest";
import { logger } from "@/utils/logger";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("prints info in dev builds", () => {
    vi.stubEnv("DEV", true);
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    logger.info("Using IndexedDB for character storage");

    expect(info).toHaveBeenCalledWith("Using IndexedDB for character storage");
  });

  it("stays silent on info and debug in production builds", () => {
    vi.stubEnv("DEV", false);
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});

    logger.info("lifecycle note");
    logger.debug("detail");

    expect(info).not.toHaveBeenCalled();
    expect(debug).not.toHaveBeenCalled();
  });

  it("always passes warnings and errors through", () => {
    vi.stubEnv("DEV", false);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    logger.warn("careful");
    logger.error("broken");

    expect(warn).toHaveBeenCalledWith("careful");
    expect(error).toHaveBeenCalledWith("broken");
  });
});
