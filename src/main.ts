// Entry point for the application
// Minimal implementation for first BDD scenario

// Helper functions for conditional rendering
function renderItemList<T>(
  items: T[],
  renderFn: (item: T) => string,
  emptyTestId: string,
  emptyMessage: string
): string {
  if (items.length === 0) {
    return `<div data-testid="${emptyTestId}" class="text-gray-500 italic p-3 border rounded">${emptyMessage}</div>`;
  }
  return items.map(renderFn).join("");
}

function renderTextField(
  content: string,
  testId: string,
  emptyTestId: string,
  emptyMessage: string
): string {
  if (!content || content.trim() === "") {
    return `<div data-testid="${emptyTestId}" class="text-gray-500 italic p-3 border rounded bg-gray-50">${emptyMessage}</div>`;
  }
  return `<div data-testid="${testId}" class="mt-1 p-3 border rounded bg-gray-50">${content}</div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  if (app) {
    // Check URL parameter for empty character
    const urlParams = new URLSearchParams(window.location.search);
    const useEmpty = urlParams.get("empty") === "true";

    // Hard-coded test character data
    const character = useEmpty
      ? {
          name: "Kael the Wanderer",
          tier: 3,
          type: "Glaive",
          descriptor: "Strong",
          focus: "Bears a Halo of Fire",
          stats: {
            might: { pool: 15, edge: 2, current: 12 },
            speed: { pool: 12, edge: 1, current: 12 },
            intellect: { pool: 10, edge: 0, current: 8 },
          },
          cyphers: [],
          artifacts: [],
          oddities: [],
          textFields: {
            background: "",
            notes: "",
            equipment: "",
            abilities: "",
          },
        }
      : {
          name: "Kael the Wanderer",
          tier: 3,
          type: "Glaive",
          descriptor: "Strong",
          focus: "Bears a Halo of Fire",
          stats: {
            might: { pool: 15, edge: 2, current: 12 },
            speed: { pool: 12, edge: 1, current: 12 },
            intellect: { pool: 10, edge: 0, current: 8 },
          },
          cyphers: [
            {
              name: "Detonation (Cell)",
              level: "1d6+2",
              effect: "Explodes in an immediate radius",
            },
            {
              name: "Stim (Injector)",
              level: "1d6",
              effect: "Restores 1d6 + 2 points to one Pool",
            },
          ],
          artifacts: [
            {
              name: "Lightning Rod",
              level: "6",
              effect: "Projects lightning bolt up to long range",
            },
          ],
          oddities: [
            "A glowing cube that hums when near water",
            "A piece of transparent metal that's always cold",
          ],
          textFields: {
            background:
              "Born in a remote village, discovered ancient ruins that changed everything",
            notes: "Currently investigating the mysterious disappearances in the nearby forest",
            equipment: "Medium armor, Broadsword, Explorer's pack, 50 feet of rope",
            abilities: "Trained in intimidation, Specialized in heavy weapons",
          },
        };

    app.innerHTML = `
            <div class="min-h-screen bg-gray-50 p-4">
                <div class="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
                    <h1 class="text-3xl font-bold mb-6">Numenera Character Sheet</h1>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="text-sm font-medium text-gray-700">Name:</label>
                            <div data-testid="character-name" class="text-xl font-semibold">${character.name}</div>
                        </div>
                        
                        <div>
                            <label class="text-sm font-medium text-gray-700">Tier:</label>
                            <div data-testid="character-tier" class="text-lg">${character.tier}</div>
                        </div>
                        
                        <div>
                            <label class="text-sm font-medium text-gray-700">Type:</label>
                            <div data-testid="character-type" class="text-lg">${character.type}</div>
                        </div>
                        
                        <div>
                            <label class="text-sm font-medium text-gray-700">Descriptor:</label>
                            <div data-testid="character-descriptor" class="text-lg">${character.descriptor}</div>
                        </div>
                        
                        <div>
                            <label class="text-sm font-medium text-gray-700">Focus:</label>
                            <div data-testid="character-focus" class="text-lg">${character.focus}</div>
                        </div>
                    </div>

                    <!-- Stat Pools Section -->
                    <div class="mt-8">
                        <h2 class="text-2xl font-bold mb-4">Stats</h2>
                        <div class="space-y-4">
                            <!-- Might -->
                            <div class="border rounded p-4">
                                <h3 class="text-lg font-semibold mb-2">Might</h3>
                                <div class="grid grid-cols-3 gap-4">
                                    <div>
                                        <label class="text-sm text-gray-600">Pool:</label>
                                        <div data-testid="stat-might-pool" class="text-lg font-medium">${character.stats.might.pool}</div>
                                    </div>
                                    <div>
                                        <label class="text-sm text-gray-600">Edge:</label>
                                        <div data-testid="stat-might-edge" class="text-lg font-medium">${character.stats.might.edge}</div>
                                    </div>
                                    <div>
                                        <label class="text-sm text-gray-600">Current:</label>
                                        <div data-testid="stat-might-current" class="text-lg font-medium">${character.stats.might.current}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Speed -->
                            <div class="border rounded p-4">
                                <h3 class="text-lg font-semibold mb-2">Speed</h3>
                                <div class="grid grid-cols-3 gap-4">
                                    <div>
                                        <label class="text-sm text-gray-600">Pool:</label>
                                        <div data-testid="stat-speed-pool" class="text-lg font-medium">${character.stats.speed.pool}</div>
                                    </div>
                                    <div>
                                        <label class="text-sm text-gray-600">Edge:</label>
                                        <div data-testid="stat-speed-edge" class="text-lg font-medium">${character.stats.speed.edge}</div>
                                    </div>
                                    <div>
                                        <label class="text-sm text-gray-600">Current:</label>
                                        <div data-testid="stat-speed-current" class="text-lg font-medium">${character.stats.speed.current}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Intellect -->
                            <div class="border rounded p-4">
                                <h3 class="text-lg font-semibold mb-2">Intellect</h3>
                                <div class="grid grid-cols-3 gap-4">
                                    <div>
                                        <label class="text-sm text-gray-600">Pool:</label>
                                        <div data-testid="stat-intellect-pool" class="text-lg font-medium">${character.stats.intellect.pool}</div>
                                    </div>
                                    <div>
                                        <label class="text-sm text-gray-600">Edge:</label>
                                        <div data-testid="stat-intellect-edge" class="text-lg font-medium">${character.stats.intellect.edge}</div>
                                    </div>
                                    <div>
                                        <label class="text-sm text-gray-600">Current:</label>
                                        <div data-testid="stat-intellect-current" class="text-lg font-medium">${character.stats.intellect.current}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Cyphers Section -->
                    <div class="mt-8">
                        <h2 class="text-2xl font-bold mb-4">Cyphers</h2>
                        <div class="space-y-3">
                            ${renderItemList(
                              character.cyphers,
                              (cypher) => `
                                <div data-testid="cypher-item" class="border rounded p-3">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <div data-testid="cypher-name-${cypher.name}" class="font-semibold">${cypher.name}</div>
                                            <div class="text-sm text-gray-600">${cypher.effect}</div>
                                        </div>
                                        <div data-testid="cypher-level-${cypher.name}" class="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                                            Level: ${cypher.level}
                                        </div>
                                    </div>
                                </div>
                            `,
                              "empty-cyphers",
                              "No cyphers"
                            )}
                        </div>
                    </div>

                    <!-- Artifacts Section -->
                    <div class="mt-8">
                        <h2 class="text-2xl font-bold mb-4">Artifacts</h2>
                        <div class="space-y-3">
                            ${renderItemList(
                              character.artifacts,
                              (artifact) => `
                                <div data-testid="artifact-item" class="border rounded p-3">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <div data-testid="artifact-name-${artifact.name}" class="font-semibold">${artifact.name}</div>
                                            <div class="text-sm text-gray-600">${artifact.effect}</div>
                                        </div>
                                        <div data-testid="artifact-level-${artifact.name}" class="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                                            Level: ${artifact.level}
                                        </div>
                                    </div>
                                </div>
                            `,
                              "empty-artifacts",
                              "No artifacts"
                            )}
                        </div>
                    </div>

                    <!-- Oddities Section -->
                    <div class="mt-8">
                        <h2 class="text-2xl font-bold mb-4">Oddities</h2>
                        <div class="space-y-2">
                            ${renderItemList(
                              character.oddities,
                              (oddity) => `
                                <div data-testid="oddity-item" class="border rounded p-3">
                                    <div data-testid="oddity-${oddity}" class="text-sm">${oddity}</div>
                                </div>
                            `,
                              "empty-oddities",
                              "No oddities"
                            )}
                        </div>
                    </div>

                    <!-- Text Fields Section -->
                    <div class="mt-8">
                        <h2 class="text-2xl font-bold mb-4">Character Details</h2>
                        <div class="space-y-4">
                            <div>
                                <label class="text-sm font-medium text-gray-700">Background:</label>
                                ${renderTextField(character.textFields.background, "text-background", "empty-background", "No background")}
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-700">Notes:</label>
                                ${renderTextField(character.textFields.notes, "text-notes", "empty-notes", "No notes")}
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-700">Equipment:</label>
                                ${renderTextField(character.textFields.equipment, "text-equipment", "empty-equipment", "No equipment")}
                            </div>
                            <div>
                                <label class="text-sm font-medium text-gray-700">Abilities:</label>
                                ${renderTextField(character.textFields.abilities, "text-abilities", "empty-abilities", "No abilities")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }
});
