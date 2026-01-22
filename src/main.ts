// Entry point for the application
// Minimal bootstrapping - all components are now class-based

import "./styles/main.css";
import { render } from "lit-html";
import { saveCharacterState, loadCharacterState } from "./storage/localStorage";
import { Character } from "./types/character.js";
import { FULL_CHARACTER, NEW_CHARACTER } from "./data/mockCharacters.js";
import { CharacterSheet } from "./components/CharacterSheet.js";
import { initI18n, onLanguageChanged } from "./i18n/index.js";

// Render the character sheet with the given character data
function renderCharacterSheet(character: Character): void {
  const app = document.getElementById("app");
  if (!app) return;

  const sheet = new CharacterSheet(
    character,
    () => renderCharacterSheet(FULL_CHARACTER),
    () => renderCharacterSheet(NEW_CHARACTER)
  );

  render(sheet.render(), app);

  // Save character state to localStorage after rendering
  saveCharacterState(character);
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

  // Priority: URL param > localStorage > default
  // URL param allows explicit override for testing
  const urlParams = new URLSearchParams(window.location.search);
  const useEmpty = urlParams.get("empty") === "true";
  const storedCharacter = loadCharacterState();

  // Select and render initial character data
  let initialCharacter: Character;
  if (useEmpty) {
    // URL param explicitly requests empty character
    initialCharacter = NEW_CHARACTER;
  } else if (storedCharacter) {
    // Load from localStorage if available
    initialCharacter = storedCharacter;
  } else {
    // Default to full character
    initialCharacter = FULL_CHARACTER;
  }

  renderCharacterSheet(initialCharacter);
});
