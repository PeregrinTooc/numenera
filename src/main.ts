// Entry point for the application.
// Creates the shared AppContext and hands over to the modules in src/app/.

import "./styles/main.css";
import { createAppContext } from "@/app/appContext";
import { bootstrap } from "@/app/bootstrap";
import { registerSaveFeedback } from "@/app/saveFeedback";
import { renderCharacterSheet } from "@/app/renderCharacterSheet";
import { registerVersionSquashedListener, updateVersionNavigator } from "@/app/versionNavigation";

const ctx = createAppContext();

// Rendering and version navigation call each other; wire them here so neither
// module imports the other.
ctx.actions = {
  renderCharacterSheet: (character, skipImmediateSave) =>
    renderCharacterSheet(ctx, character, skipImmediateSave),
  updateVersionNavigator: (shouldReload) => updateVersionNavigator(ctx, shouldReload),
};

registerSaveFeedback(ctx);
registerVersionSquashedListener(ctx);

document.addEventListener("DOMContentLoaded", () => bootstrap(ctx));
