import { describe, it, expect, beforeEach, vi } from "vitest";
import { importCharacterFromFile, exportCharacterToFile } from "../../src/storage/fileStorage";
import { Character } from "../../src/types/character";
import { SCHEMA_VERSION } from "../../src/storage/storageConstants";

// Mock CSSStyleDeclaration for test environment
interface MockCSSStyleDeclaration {
  [key: string]: string;
}

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

      expect(result).not.toBeNull();
      expect(result!.character).toEqual(character);
      expect(result!.warnings).toEqual([]);
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
          xp: 10,
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

      global.showOpenFilePicker = vi.fn().mockResolvedValue([mockFileHandle]);

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

      global.showOpenFilePicker = vi.fn().mockResolvedValue([mockFileHandle]);

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

      global.showOpenFilePicker = vi.fn().mockResolvedValue([mockFileHandle]);

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
      global.showOpenFilePicker = vi.fn().mockRejectedValue(new Error("File system error"));

      await expect(importCharacterFromFile()).rejects.toThrow("File system error");
    });
  });

  describe("exportCharacterToFile", () => {
    const testCharacter: Character = {
      name: "Kael the Wanderer",
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

    it("should create correct file structure with all metadata", async () => {
      const mockWritable = {
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      };

      const mockFileHandle = {
        createWritable: vi.fn().mockResolvedValue(mockWritable),
      };

      global.showSaveFilePicker = vi.fn().mockResolvedValue(mockFileHandle);

      await exportCharacterToFile(testCharacter);

      expect(mockWritable.write).toHaveBeenCalledTimes(1);
      const writtenContent = JSON.parse(mockWritable.write.mock.calls[0][0]);

      expect(writtenContent).toHaveProperty("version", "1.0");
      expect(writtenContent).toHaveProperty("schemaVersion", SCHEMA_VERSION);
      expect(writtenContent).toHaveProperty("exportDate");
      expect(writtenContent).toHaveProperty("character");
      expect(writtenContent.character).toEqual(testCharacter);

      // Verify exportDate is a valid ISO string
      const date = new Date(writtenContent.exportDate);
      expect(date.toISOString()).toBe(writtenContent.exportDate);
    });

    it("should sanitize character name for filename - spaces to hyphens", async () => {
      const mockWritable = {
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      };

      const mockFileHandle = {
        createWritable: vi.fn().mockResolvedValue(mockWritable),
      };

      global.showSaveFilePicker = vi.fn().mockResolvedValue(mockFileHandle);

      await exportCharacterToFile(testCharacter);

      expect(global.showSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: "kael-the-wanderer.numenera",
        types: [
          {
            description: "Numenera Character Files",
            accept: {
              "application/json": [".numenera"],
            },
          },
        ],
      });
    });

    it("should sanitize filename - remove special characters", async () => {
      const characterWithSpecialChars: Character = {
        ...testCharacter,
        name: "Test @#$ Character!",
      };

      const mockWritable = {
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      };

      const mockFileHandle = {
        createWritable: vi.fn().mockResolvedValue(mockWritable),
      };

      global.showSaveFilePicker = vi.fn().mockResolvedValue(mockFileHandle);

      await exportCharacterToFile(characterWithSpecialChars);

      expect(global.showSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: "test-character.numenera",
        types: [
          {
            description: "Numenera Character Files",
            accept: {
              "application/json": [".numenera"],
            },
          },
        ],
      });
    });

    it("should sanitize filename - handle empty name", async () => {
      const characterWithEmptyName: Character = {
        ...testCharacter,
        name: "",
      };

      const mockWritable = {
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      };

      const mockFileHandle = {
        createWritable: vi.fn().mockResolvedValue(mockWritable),
      };

      global.showSaveFilePicker = vi.fn().mockResolvedValue(mockFileHandle);

      await exportCharacterToFile(characterWithEmptyName);

      expect(global.showSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: "character.numenera",
        types: [
          {
            description: "Numenera Character Files",
            accept: {
              "application/json": [".numenera"],
            },
          },
        ],
      });
    });

    it("should sanitize filename - collapse multiple spaces", async () => {
      const characterWithSpaces: Character = {
        ...testCharacter,
        name: "   Multiple   Spaces   ",
      };

      const mockWritable = {
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      };

      const mockFileHandle = {
        createWritable: vi.fn().mockResolvedValue(mockWritable),
      };

      global.showSaveFilePicker = vi.fn().mockResolvedValue(mockFileHandle);

      await exportCharacterToFile(characterWithSpaces);

      expect(global.showSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: "multiple-spaces.numenera",
        types: [
          {
            description: "Numenera Character Files",
            accept: {
              "application/json": [".numenera"],
            },
          },
        ],
      });
    });

    it("should use File System Access API when available", async () => {
      const mockWritable = {
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      };

      const mockFileHandle = {
        createWritable: vi.fn().mockResolvedValue(mockWritable),
      };

      global.showSaveFilePicker = vi.fn().mockResolvedValue(mockFileHandle);

      await exportCharacterToFile(testCharacter);

      expect(global.showSaveFilePicker).toHaveBeenCalled();
      expect(mockFileHandle.createWritable).toHaveBeenCalled();
      expect(mockWritable.write).toHaveBeenCalled();
      expect(mockWritable.close).toHaveBeenCalled();
    });

    it("should fall back to blob download when API unavailable", async () => {
      // Remove showSaveFilePicker to simulate Safari/Firefox
      delete (global as any).showSaveFilePicker;

      // Mock document methods for blob download
      const mockLink = {
        click: vi.fn(),
        href: "",
        download: "",
        style: {} as MockCSSStyleDeclaration,
      };

      const createElementSpy = vi.spyOn(document, "createElement").mockReturnValue(mockLink as any);
      const appendChildSpy = vi
        .spyOn(document.body, "appendChild")
        .mockImplementation(() => mockLink as any);
      const removeChildSpy = vi
        .spyOn(document.body, "removeChild")
        .mockImplementation(() => mockLink as any);

      // Mock URL.createObjectURL
      const mockBlobUrl = "blob:http://localhost/test";
      global.URL.createObjectURL = vi.fn().mockReturnValue(mockBlobUrl);
      global.URL.revokeObjectURL = vi.fn();

      await exportCharacterToFile(testCharacter);

      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toBe("kael-the-wanderer.numenera");
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockBlobUrl);

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it("should handle user cancellation gracefully", async () => {
      global.showSaveFilePicker = vi
        .fn()
        .mockRejectedValue(Object.assign(new Error(""), { name: "AbortError" }));

      // Should not throw, just return void
      await expect(exportCharacterToFile(testCharacter)).resolves.toBeUndefined();
    });
  });
});
