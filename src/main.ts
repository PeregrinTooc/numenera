// Entry point for the application
// This is a placeholder - implement features following BDD/TDD workflow

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  if (app) {
    app.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-gray-50">
                <div class="text-center">
                    <h1 class="text-4xl font-bold text-gray-900 mb-4">
                        Numenera Character Sheet
                    </h1>
                    <p class="text-xl text-gray-600 mb-8">
                        Project Template Ready
                    </p>
                    <p class="text-gray-500">
                        Start by creating a feature file in tests/e2e/features/
                    </p>
                </div>
            </div>
        `;
  }
});
