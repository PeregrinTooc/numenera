// Entry point for the application
// Minimal bootstrapping - all components are now class-based

import "./styles/main.css";
import { render } from "lit-html";
import { saveCharacterState, loadCharacterState } from "./storage/localStorage";
import { importCharacterFromFile } from "./storage/fileStorage.js";
import { ExportManager } from "./storage/exportManager.js";
import { AutoSaveService } from "./services/autoSaveService.js";
import { SaveIndicator } from "./components/SaveIndicator.js";
import { Character } from "./types/character.js";
import { FULL_CHARACTER, NEW_CHARACTER } from "./data/mockCharacters.js";
import { CharacterSheet } from "./components/CharacterSheet.js";
import { initI18n, onLanguageChanged } from "./i18n/index.js";

// Global CharacterSheet instance to preserve state across re-renders
let currentSheet: CharacterSheet | null = null;

// Global ExportManager instance
const exportManager = new ExportManager();

// Global AutoSaveService instance with 300ms debounce
const autoSaveService = new AutoSaveService(() => {
  if (currentCharacter) {
    saveCharacterState(currentCharacter);
  }
}, 300);

// Global SaveIndicator instance
const saveIndicator = new SaveIndicator();

// Listen for save-completed events to update indicator
autoSaveService.on("save-completed", (event) => {
  saveIndicator.updateTimestamp(event.timestamp);
  // Re-render to show updated indicator
  const app = document.getElementById("app");
  if (app && currentSheet) {
    render(currentSheet.render(), app);
    // Re-render indicator separately to avoid full sheet re-render
    const indicatorContainer = document.getElementById("save-indicator-container");
    if (indicatorContainer) {
      render(saveIndicator.render(), indicatorContainer);
    }
  }
});

// Track current character for auto-save
let currentCharacter: Character | null = null;

// Render the character sheet with the given character data
function renderCharacterSheet(character: Character): void {
  const app = document.getElementById("app");
  if (!app) return;

  // Update current character for auto-save
  currentCharacter = character;

  // Handler for field updates
  const handleFieldUpdate = (field: string, value: string | number): void => {
    // Update the character object
    const updatedCharacter = { ...character };
    switch (field) {
      case "name":
        updatedCharacter.name = value as string;
        break;
      case "tier":
        updatedCharacter.tier = value as number;
        break;
      case "descriptor":
        updatedCharacter.descriptor = value as string;
        break;
      case "focus":
        updatedCharacter.focus = value as string;
        break;
      case "xp":
        updatedCharacter.xp = value as number;
        break;
      case "shins":
        updatedCharacter.shins = value as number;
        break;
      case "armor":
        updatedCharacter.armor = value as number;
        break;
      case "maxCyphers":
        updatedCharacter.maxCyphers = value as number;
        break;
      case "effort":
        updatedCharacter.effort = value as number;
        break;
      case "mightPool":
        updatedCharacter.stats.might.pool = value as number;
        break;
      case "mightEdge":
        updatedCharacter.stats.might.edge = value as number;
        break;
      case "mightCurrent":
        updatedCharacter.stats.might.current = value as number;
        break;
      case "speedPool":
        updatedCharacter.stats.speed.pool = value as number;
        break;
      case "speedEdge":
        updatedCharacter.stats.speed.edge = value as number;
        break;
      case "speedCurrent":
        updatedCharacter.stats.speed.current = value as number;
        break;
      case "intellectPool":
        updatedCharacter.stats.intellect.pool = value as number;
        break;
      case "intellectEdge":
        updatedCharacter.stats.intellect.edge = value as number;
        break;
      case "intellectCurrent":
        updatedCharacter.stats.intellect.current = value as number;
        break;
    }

    // Update currentCharacter BEFORE requesting auto-save
    currentCharacter = updatedCharacter;

    // Request auto-save (debounced) - will now save the updated character
    autoSaveService.requestSave();

    // Re-render with updated character
    renderCharacterSheet(updatedCharacter);
  };

  // Handler for importing character from file
  const handleLoadFromFile = async (): Promise<void> => {
    try {
      const importedCharacter = await importCharacterFromFile();
      if (importedCharacter) {
        renderCharacterSheet(importedCharacter);
      }
      // If null, user cancelled - do nothing
    } catch (error) {
      console.error("Error importing character:", error);
      alert(
        `Failed to import character: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // Helper to update header button state after export operations
  const updateHeaderButtonState = (): void => {
    if (currentSheet && (currentSheet as any).header) {
      (currentSheet as any).header.setHasRememberedLocation(exportManager.hasRememberedLocation());
      // Trigger re-render to show new buttons
      if (app) {
        render(currentSheet.render(), app);
      }
    }
  };

  // Handler for first export (or fallback for non-Chromium)
  const handleExport = async (): Promise<void> => {
    try {
      await exportManager.export(character);
      updateHeaderButtonState();
    } catch (error) {
      console.error("Error exporting character:", error);
      alert(
        `Failed to export character: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // Handler for Quick Export
  const handleQuickExport = async (): Promise<void> => {
    try {
      await exportManager.quickExport(character);
      // Success feedback is handled by export-success event
    } catch (error) {
      console.error("Error in quick export:", error);
      alert(`Failed to save file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Handler for Save As
  const handleSaveAs = async (): Promise<void> => {
    try {
      await exportManager.saveAs(character);
      updateHeaderButtonState();
    } catch (error) {
      console.error("Error in save as:", error);
      alert(`Failed to save file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Create new sheet only if we don't have one yet, or if it's a different character
  // (e.g., Load or New button clicked)
  const needsNewSheet = !currentSheet || (currentSheet as any).character !== character;

  if (needsNewSheet) {
    currentSheet = new CharacterSheet(
      character,
      () => {
        renderCharacterSheet(FULL_CHARACTER);
        // Save immediately when loading a character
        saveCharacterState(FULL_CHARACTER);
      },
      () => {
        renderCharacterSheet(NEW_CHARACTER);
        // Save immediately when creating new character
        saveCharacterState(NEW_CHARACTER);
      },
      handleLoadFromFile,
      handleExport,
      handleFieldUpdate,
      handleQuickExport,
      handleSaveAs
    );
  }

  // Update header with current export manager state
  if (currentSheet && (currentSheet as any).header) {
    (currentSheet as any).header.setHasRememberedLocation(exportManager.hasRememberedLocation());
  }

  if (currentSheet) {
    render(currentSheet.render(), app);
  }

  // Render save indicator in separate container
  let indicatorContainer = document.getElementById("save-indicator-container");
  if (!indicatorContainer) {
    indicatorContainer = document.createElement("div");
    indicatorContainer.id = "save-indicator-container";
    document.body.appendChild(indicatorContainer);
  }
  render(saveIndicator.render(), indicatorContainer);

  // Request auto-save (debounced) - initial render doesn't trigger save
  // Only subsequent changes will trigger auto-save

  // Listen for character-updated events and re-render + auto-save
  // Use setTimeout to ensure the event listener is added after render completes
  setTimeout(() => {
    const listener = (_e: Event) => {
      // Trigger auto-save when character is updated
      autoSaveService.requestSave();

      // Just re-render with the same sheet instance to preserve component state
      if (currentSheet) {
        render(currentSheet.render(), app);
      }
    };

    // Remove any existing listeners to avoid duplicates
    app.removeEventListener("character-updated", listener as EventListener);
    app.addEventListener("character-updated", listener as EventListener);
  }, 0);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize i18n first
  await initI18n();

  // Re-render on language change
  onLanguageChanged(() => {
    const storedCharacter = loadCharacterState();
    if (storedCharacter) {
      renderCharacterSheet(storedCharacter);
    } else {
      renderCharacterSheet(FULL_CHARACTER);
    }
  });

  // Priority: localStorage > default
  const storedCharacter = loadCharacterState();

  // Select and render initial character data
  const initialCharacter = storedCharacter || FULL_CHARACTER;

  renderCharacterSheet(initialCharacter);
});
