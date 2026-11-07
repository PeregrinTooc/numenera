import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { importCharacterFromFile } from "@/storage/fileStorage";
import { Character } from "@/types/character";
import { SCHEMA_VERSION } from "@/storage/storageConstants";
import { changeLanguage, t } from "@/i18n/index";
import { mockCharacter } from "./helpers/exportManagerFixture";
import { getDefaultLayout, saveSectionColumns } from "@/storage/layoutStorage";

async function importFileWith(extra: Record<string, unknown>) {
  const fileContent = {
    version: "1.0",
    schemaVersion: SCHEMA_VERSION,
    exportDate: "2026-11-03T12:00:00Z",
    character: mockCharacter,
    ...extra,
  };
  const mockFile = { text: vi.fn().mockResolvedValue(JSON.stringify(fileContent)) };
  window.showOpenFilePicker = vi
    .fn()
    .mockResolvedValue([{ getFile: vi.fn().mockResolvedValue(mockFile) }]);
  const result = await importCharacterFromFile();
  if (!result) throw new Error("import returned null");
  return result;
}

describe("fileStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("importCharacterFromFile", () => {
    afterEach(async () => {
      await changeLanguage("en");
    });

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
            description: "Numenera character files",
            accept: {
              "application/json": [".numenera"],
            },
          },
        ],
        multiple: false,
      });
    });

    it("labels the file type in the current language", async () => {
      await changeLanguage("de");

      await importFileWith({});

      expect(window.showOpenFilePicker).toHaveBeenCalledWith(
        expect.objectContaining({
          types: [expect.objectContaining({ description: "Numenera-Charakterdateien" })],
        })
      );
    });

    it("should return null when user cancels file picker", async () => {
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

      await expect(importCharacterFromFile()).rejects.toMatchObject({
        messageKey: "errors.invalidJson",
      });
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
      expect(result!.warnings.length).toBeGreaterThan(0);
      expect(result!.warnings[0]).toContain("different schema version");
    });

    it("should throw error for missing character data", async () => {
      const fileContent = {
        version: "1.0",
        schemaVersion: SCHEMA_VERSION,
        exportDate: "2026-01-27T12:00:00Z",
      };

      const mockFile = {
        text: vi.fn().mockResolvedValue(JSON.stringify(fileContent)),
      };

      const mockFileHandle = {
        getFile: vi.fn().mockResolvedValue(mockFile),
      };

      window.showOpenFilePicker = vi.fn().mockResolvedValue([mockFileHandle]);

      await expect(importCharacterFromFile()).rejects.toMatchObject({
        messageKey: "errors.noCharacterData",
      });
    });

    it("should sanitize incomplete character structure with warnings", async () => {
      const fileContent = {
        version: "1.0",
        schemaVersion: SCHEMA_VERSION,
        exportDate: "2026-01-27T12:00:00Z",
        character: {
          name: "Test",
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
      expect(result!.character.tier).toBe(1);
      expect(result!.character.stats).toBeDefined();
      expect(result!.character.cyphers).toEqual([]);
      expect(result!.warnings.length).toBeGreaterThan(0);
    });

    it("should handle other picker errors", async () => {
      window.showOpenFilePicker = vi.fn().mockRejectedValue(new Error("File system error"));

      await expect(importCharacterFromFile()).rejects.toThrow("File system error");
    });
  });

  describe("section columns in an imported file", () => {
    it("returns valid column choices", async () => {
      const result = await importFileWith({ sectionColumns: { cyphers: 1 } });

      expect(result.sectionColumns).toEqual({ cyphers: 1 });
      expect(result.warnings).toEqual([]);
    });

    it("warns about invalid column choices and returns none", async () => {
      const result = await importFileWith({ sectionColumns: { stats: 3 } });

      expect(result.sectionColumns).toBeUndefined();
      expect(result.warnings).toEqual([t("fileOperations.invalidLayout")]);
    });

    it("an old file without column choices returns none and no warning", async () => {
      const result = await importFileWith({});

      expect(result.sectionColumns).toBeUndefined();
      expect(result.warnings).toEqual([]);
    });
  });

  describe("whether the imported layout differs from the current one", () => {
    const reordered = (): ReturnType<typeof getDefaultLayout> => getDefaultLayout().reverse();

    it("differs when the file arranges the sections differently", async () => {
      const result = await importFileWith({ layout: reordered() });

      expect(result.hasLayoutDifference).toBe(true);
    });

    it("does not differ when the file has the current arrangement", async () => {
      const result = await importFileWith({ layout: getDefaultLayout() });

      expect(result.hasLayoutDifference).toBe(false);
    });

    it("differs when only a column choice the file names differs", async () => {
      const result = await importFileWith({
        layout: getDefaultLayout(),
        sectionColumns: { items: 1 },
      });

      expect(result.hasLayoutDifference).toBe(true);
    });

    it("does not differ when the file's column choices match the current ones", async () => {
      saveSectionColumns({ items: 1 });

      const result = await importFileWith({
        layout: getDefaultLayout(),
        sectionColumns: { items: 1, cyphers: 2 },
      });

      expect(result.hasLayoutDifference).toBe(false);
    });

    it("does not differ when the file has neither a layout nor column choices", async () => {
      const result = await importFileWith({});

      expect(result.hasLayoutDifference).toBe(false);
    });
  });
});
