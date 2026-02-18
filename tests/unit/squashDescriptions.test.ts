import { describe, it, expect } from "vitest";
import { squashDescriptions } from "../../src/utils/squashDescriptions.js";

describe("Squash Descriptions", () => {
  describe("Empty Input", () => {
    it("should return empty string for empty array", () => {
      const result = squashDescriptions([]);

      expect(result).toBe("");
    });

    it("should return empty string for array with empty strings", () => {
      const result = squashDescriptions(["", "", ""]);

      expect(result).toBe("");
    });
  });

  describe("Single Description", () => {
    it("should return single description as-is", () => {
      const result = squashDescriptions(["Edited basic info"]);

      expect(result).toBe("Edited basic info");
    });

    it("should handle single specific change", () => {
      const result = squashDescriptions(["Changed name"]);

      expect(result).toBe("Changed name");
    });
  });

  describe("Multiple Descriptions", () => {
    it("should combine two descriptions", () => {
      const result = squashDescriptions(["Edited basic info", "Updated stats"]);

      expect(result).toBe("Edited basic info, Updated stats");
    });

    it("should combine three descriptions", () => {
      const result = squashDescriptions([
        "Edited basic info",
        "Updated stats",
        "Updated resources",
      ]);

      expect(result).toBe("Edited basic info, Updated stats, Updated resources");
    });

    it("should limit to top 3 descriptions", () => {
      const result = squashDescriptions([
        "Edited basic info",
        "Updated stats",
        "Updated resources",
        "Added cypher",
        "Updated background",
      ]);

      expect(result).toBe("Edited basic info, Updated stats, Updated resources");
    });
  });

  describe("Duplicate Descriptions", () => {
    it("should remove duplicates and preserve order", () => {
      const result = squashDescriptions([
        "Edited basic info",
        "Updated stats",
        "Edited basic info",
      ]);

      expect(result).toBe("Edited basic info, Updated stats");
    });

    it("should handle multiple duplicates", () => {
      const result = squashDescriptions([
        "Edited basic info",
        "Edited basic info",
        "Updated stats",
        "Updated stats",
        "Edited basic info",
      ]);

      expect(result).toBe("Edited basic info, Updated stats");
    });

    it("should apply deduplication before limiting to 3", () => {
      const result = squashDescriptions([
        "Edited basic info",
        "Edited basic info",
        "Updated stats",
        "Updated resources",
        "Added cypher",
        "Edited basic info",
      ]);

      expect(result).toBe("Edited basic info, Updated stats, Updated resources");
    });
  });

  describe("Edge Cases", () => {
    it("should trim whitespace from descriptions", () => {
      const result = squashDescriptions(["  Edited basic info  ", " Updated stats "]);

      expect(result).toBe("Edited basic info, Updated stats");
    });

    it("should filter out empty strings after trimming", () => {
      const result = squashDescriptions(["Edited basic info", "   ", "Updated stats", ""]);

      expect(result).toBe("Edited basic info, Updated stats");
    });

    it("should handle single whitespace string", () => {
      const result = squashDescriptions(["   "]);

      expect(result).toBe("");
    });

    it("should maintain order after deduplication and filtering", () => {
      const result = squashDescriptions([
        "",
        "Updated stats",
        "Edited basic info",
        "  ",
        "Updated stats",
        "Added cypher",
      ]);

      expect(result).toBe("Updated stats, Edited basic info, Added cypher");
    });
  });

  describe("Special Characters", () => {
    it("should handle descriptions with special characters", () => {
      const result = squashDescriptions(["Changed name", "Updated might/speed/intellect"]);

      expect(result).toBe("Changed name, Updated might/speed/intellect");
    });

    it("should handle unicode characters", () => {
      const result = squashDescriptions(["Edited basic info", "Added cypher: Déjà Vu"]);

      expect(result).toBe("Edited basic info, Added cypher: Déjà Vu");
    });
  });

  describe("Format Validation", () => {
    it("should use comma-space separator", () => {
      const result = squashDescriptions(["First", "Second", "Third"]);

      expect(result).toContain(", ");
      expect(result).not.toContain(",Second");
      expect(result).not.toContain(",Third");
    });

    it("should not have trailing separator", () => {
      const result = squashDescriptions(["First", "Second"]);

      expect(result).not.toMatch(/,\s*$/);
    });

    it("should not have leading separator", () => {
      const result = squashDescriptions(["First", "Second"]);

      expect(result).not.toMatch(/^,/);
    });
  });
});
