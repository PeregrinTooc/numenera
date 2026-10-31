import { describe, it, expect, beforeEach, vi } from "vitest";
import { importCharacterFromFile } from "@/storage/fileStorage";
import { Character } from "@/types/character";
import { SCHEMA_VERSION } from "@/storage/storageConstants";

describe("fileStorage", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe("importCharacterFromFile", () => {
    it("should import a valid character from file with no warnings", async () => {
      const character: Character = {
        name: "Test Hero",
        tier: 3,
        type: "Glaive",
        descriptor: "Strong",
        focus: "Masters Defense",
        currentXp: 10,
        totalXp: 10,
        shins: 50,
        armor: 2,
        effort: 3,
        maxCyphers: 2,
        stats: {
          might: { pool: 18, edge: 1, current: 18 },
          speed: { pool: 12, edge: 0, current: 12 },
          intellect: { pool: 10, edge: 0, current: 10 },
        },
        cyphers: [],
        artifacts: [],
        oddities: [],
        abilities: [],
        equipment: [],
        attacks: [],
        specialAbilities: [],
        recoveryRolls: {
          action: false,
          tenMinutes: false,
          oneHour: false,
          tenHours: false,
          modifier: 0,
        },
        damageTrack: {
          impairment: "healthy",
        },
        textFields: {
          background: "",
          notes: "",
        },
      };

      const fileContent = {
        version: "1.0",
        schemaVersion: SCHEMA_VERSION,
        exportDate: "2026-01-27T12:00:00Z",
        character: character,
      };

      // Mock File System Access API
      const mockFile = {
        text: vi.fn().mockResolvedValue(JSON.stringify(fileContent)),
      };

      const mockFileHandle = {
        getFile: vi.fn().mockResolvedValue(mockFile),
      };

      window.showOpenFilePicker = vi.fn().mockResolvedValue([mockFileHandle]);

      const result = await importCharacterFromFile();

      expect(result).not.toBeNull();
      expect(result!.character).toEqual(character);
      expect(result!.warnings).toEqual([]);
      expect(window.showOpenFilePicker).toHaveBeenCalledWith({
        types: [
          {
            description: "Numenera Character Files",
            accept: {
              "application/json": [".numenera"],
            },
          },
        ],
        multiple: false,
      });
    });

    it("should return null when user cancels file picker", async () => {
      // Mock user canceling the picker
      window.showOpenFilePicker = vi.fn().mockRejectedValue(new DOMException("", "AbortError"));

      const result = await importCharacterFromFile();

      expect(result).toBeNull();
    });

    it("should throw error for invalid JSON", async () => {
      const mockFile = {
        text: vi.fn().mockResolvedValue("invalid json{"),
      };

      const mockFileHandle = {
        getFile: vi.fn().mockResolvedValue(mockFile),
      };

      window.showOpenFilePicker = vi.fn().mockResolvedValue([mockFileHandle]);

      await expect(importCharacterFromFile()).rejects.toThrow("Invalid JSON in file");
    });

    it("should import with warning for different schema version", async () => {
      const fileContent = {
        version: "1.0",
        schemaVersion: 2, // Old version - should warn but not reject
        exportDate: "2026-01-27T12:00:00Z",
        character: {
          name: "Test",
          tier: 1,
          type: "Glaive",
          descriptor: "Strong",
          focus: "Masters Defense",
          currentXp: 10,
          totalXp: 10,
          shins: 50,
          armor: 2,
          effort: 1,
          maxCyphers: 2,
          stats: {
            might: { pool: 10, edge: 0, current: 10 },
            speed: { pool: 10, edge: 0, current: 10 },
            intellect: { pool: 10, edge: 0, current: 10 },
          },
          cyphers: [],
          artifacts: [],
          oddities: [],
          abilities: [],
          equipment: [],
          attacks: [],
          specialAbilities: [],
          recoveryRolls: {
            action: false,
            tenMinutes: false,
            oneHour: false,
            tenHours: false,
            modifier: 0,
          },
          damageTrack: { impairment: "healthy" },
          textFields: { background: "", notes: "" },
        },
      };

      const mockFile = {
        text: vi.fn().mockResolvedValue(JSON.stringify(fileContent)),
      };

      const mockFileHandle = {
        getFile: vi.fn().mockResolvedValue(mockFile),
      };

      window.showOpenFilePicker = vi.fn().mockResolvedValue([mockFileHandle]);

      const result = await importCharacterFromFile();

      expect(result).not.toBeNull();
      expect(result!.character.name).toBe("Test");
      // Should have a warning about schema version
      expect(result!.warnings.length).toBeGreaterThan(0);
      expect(result!.warnings[0]).toContain("different schema version");
    });

    it("should throw error for missing character data", async () => {
      const fileContent = {
        version: "1.0",
        schemaVersion: SCHEMA_VERSION,
        exportDate: "2026-01-27T12:00:00Z",
        // Missing character field
      };

      const mockFile = {
        text: vi.fn().mockResolvedValue(JSON.stringify(fileContent)),
      };

      const mockFileHandle = {
        getFile: vi.fn().mockResolvedValue(mockFile),
      };

      window.showOpenFilePicker = vi.fn().mockResolvedValue([mockFileHandle]);

      await expect(importCharacterFromFile()).rejects.toThrow(
        "File does not contain character data"
      );
    });

    it("should sanitize incomplete character structure with warnings", async () => {
      const fileContent = {
        version: "1.0",
        schemaVersion: SCHEMA_VERSION,
        exportDate: "2026-01-27T12:00:00Z",
        character: {
          name: "Test",
          // Missing most fields - should be filled with defaults
        },
      };

      const mockFile = {
        text: vi.fn().mockResolvedValue(JSON.stringify(fileContent)),
      };

      const mockFileHandle = {
        getFile: vi.fn().mockResolvedValue(mockFile),
      };

      window.showOpenFilePicker = vi.fn().mockResolvedValue([mockFileHandle]);

      const result = await importCharacterFromFile();

      // Should not throw, should return sanitized character
      expect(result).not.toBeNull();
      expect(result!.character.name).toBe("Test");
      // Missing fields should be filled with defaults
      expect(result!.character.tier).toBe(1); // Default tier
      expect(result!.character.stats).toBeDefined();
      expect(result!.character.cyphers).toEqual([]);
      // Should have warnings about missing fields
      expect(result!.warnings.length).toBeGreaterThan(0);
    });

    it("should handle other picker errors", async () => {
      window.showOpenFilePicker = vi.fn().mockRejectedValue(new Error("File system error"));

      await expect(importCharacterFromFile()).rejects.toThrow("File system error");
    });
  });
});
