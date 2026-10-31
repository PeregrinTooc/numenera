import { describe, it, expect } from "vitest";
import { UserFacingError } from "@/utils/UserFacingError";
import { describeError } from "@/utils/describeError";

describe("UserFacingError", () => {
  it("carries the i18n key and keeps the cause", () => {
    const cause = new Error("boom");
    const error = new UserFacingError("errors.diskFull", { cause });
    expect(error).toBeInstanceOf(Error);
    expect(error.messageKey).toBe("errors.diskFull");
    expect(error.cause).toBe(cause);
  });
});

describe("describeError", () => {
  it("translates the key of a UserFacingError", () => {
    expect(describeError(new UserFacingError("errors.diskFull"))).toBe(
      "Unable to save file. Disk full."
    );
  });

  it("falls back to a generic message for other errors", () => {
    expect(describeError(new Error("raw english"))).toBe("An unexpected error occurred.");
    expect(describeError("nope")).toBe("An unexpected error occurred.");
  });
});
