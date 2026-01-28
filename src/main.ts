// Entry point for the application
// Minimal bootstrapping - all components are now class-based

import "./styles/main.css";
import { render } from "lit-html";
import { saveCharacterState, loadCharacterState } from "./storage/localStorage";
import { importCharacterFromFile, exportCharacterToFile } from "./storage/fileStorage.js";
import { Character } from "./types/character.js";
import { FULL_CHARACTER, NEW_CHARACTER } from "./data/mockCharacters.js";
import { CharacterSheet } from "./components/CharacterSheet.js";
import { initI18n, onLanguageChanged } from "./i18n/index.js";

// Global CharacterSheet instance to preserve state across re-renders
let currentSheet: CharacterSheet | null = null;

// Render the character sheet with the given character data
function renderCharacterSheet(character: Character): void {
  const app = document.getElementById("app");
  if (!app) return;

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

    // Save to localStorage
    saveCharacterState(updatedCharacter);

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

  // Handler for exporting character to file
  const handleExportToFile = async (): Promise<void> => {
    try {
      await exportCharacterToFile(character);
      // Export complete - no feedback needed (file save dialog handles it)
    } catch (error) {
      console.error("Error exporting character:", error);
      alert(
        `Failed to export character: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // Create new sheet only if we don't have one yet, or if it's a different character
  // (e.g., Load or New button clicked)
  const needsNewSheet = !currentSheet || (currentSheet as any).character !== character;

  if (needsNewSheet) {
    currentSheet = new CharacterSheet(
      character,
      () => renderCharacterSheet(FULL_CHARACTER),
      () => renderCharacterSheet(NEW_CHARACTER),
      handleLoadFromFile,
      handleExportToFile,
      handleFieldUpdate
    );
  }

  if (currentSheet) {
    render(currentSheet.render(), app);
  }

  // Save character state to localStorage after rendering
  saveCharacterState(character);

  // Listen for character-updated events and re-render
  // Use setTimeout to ensure the event listener is added after render completes
  setTimeout(() => {
    const listener = (_e: Event) => {
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
