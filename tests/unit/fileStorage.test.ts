import { describe, it, expect, beforeEach, vi } from "vitest";
import { importCharacterFromFile } from "../../src/storage/fileStorage";
import { Character } from "../../src/types/character";
import { SCHEMA_VERSION } from "../../src/storage/storageConstants";

describe("fileStorage", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe("importCharacterFromFile", () => {
    it("should import a valid character from file", async () => {
      const character: Character = {
        name: "Test Hero",
        tier: 3,
        type: "Glaive",
        descriptor: "Strong",
        focus: "Masters Defense",
        xp: 10,
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

      global.showOpenFilePicker = vi.fn().mockResolvedValue([mockFileHandle]);

      const result = await importCharacterFromFile();

      expect(result).toEqual(character);
      expect(global.showOpenFilePicker).toHaveBeenCalledWith({
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
      global.showOpenFilePicker = vi
        .fn()
        .mockRejectedValue(Object.assign(new Error(""), { name: "AbortError" }));

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

      global.showOpenFilePicker = vi.fn().mockResolvedValue([mockFileHandle]);

      await expect(importCharacterFromFile()).rejects.toThrow("Invalid JSON in file");
    });

    it("should throw error for incompatible schema version", async () => {
      const fileContent = {
        version: "1.0",
        schemaVersion: 2, // Old version
        exportDate: "2026-01-27T12:00:00Z",
        character: { name: "Test" },
      };

      const mockFile = {
        text: vi.fn().mockResolvedValue(JSON.stringify(fileContent)),
      };

      const mockFileHandle = {
        getFile: vi.fn().mockResolvedValue(mockFile),
      };

      global.showOpenFilePicker = vi.fn().mockResolvedValue([mockFileHandle]);

      await expect(importCharacterFromFile()).rejects.toThrow(
        "Incompatible schema version: file has version 2, but current version is 4"
      );
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

      global.showOpenFilePicker = vi.fn().mockResolvedValue([mockFileHandle]);

      await expect(importCharacterFromFile()).rejects.toThrow(
        "File does not contain character data"
      );
    });

    it("should throw error for invalid character structure", async () => {
      const fileContent = {
        version: "1.0",
        schemaVersion: SCHEMA_VERSION,
        exportDate: "2026-01-27T12:00:00Z",
        character: {
          name: "Test",
          // Missing required fields
        },
      };

      const mockFile = {
        text: vi.fn().mockResolvedValue(JSON.stringify(fileContent)),
      };

      const mockFileHandle = {
        getFile: vi.fn().mockResolvedValue(mockFile),
      };

      global.showOpenFilePicker = vi.fn().mockResolvedValue([mockFileHandle]);

      await expect(importCharacterFromFile()).rejects.toThrow("Invalid character data");
    });

    it("should handle other picker errors", async () => {
      global.showOpenFilePicker = vi.fn().mockRejectedValue(new Error("File system error"));

      await expect(importCharacterFromFile()).rejects.toThrow("File system error");
    });
  });
});
