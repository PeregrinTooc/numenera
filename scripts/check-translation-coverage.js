#!/usr/bin/env node

/**
 * Translation Coverage Check
 *
 * Verifies that all t() function calls in components have corresponding
 * translation keys in both en.json and de.json locale files.
 *
 * Fails pre-commit if any keys are missing.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

/**
 * Load and parse JSON locale file
 */
function loadLocale(localePath) {
  try {
    const content = fs.readFileSync(localePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error loading ${localePath}:`, error.message);
    process.exit(1);
  }
}

/**
 * Check if a translation key exists in the locale object
 * Handles nested keys like "character.sentence.prefix"
 */
function hasKey(obj, keyPath) {
  const keys = keyPath.split(".");
  let current = obj;

  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      !Object.prototype.hasOwnProperty.call(current, key)
    ) {
      return false;
    }
    current = current[key];
  }

  return current !== null && current !== undefined;
}

/**
 * Extract all t() function calls from a file
 * Matches patterns like: t("key") or t('key')
 * Excludes false positives like createElement("div")
 */
function extractTranslationKeys(content) {
  const keys = [];

  // Match t("...") or t('...') but not when preceded by word characters
  // This excludes createElement("div") but matches t("div")
  const regex = /\bt\(\s*["']([^"']+)["']\s*\)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    keys.push(match[1]);
  }

  return keys;
}

/**
 * Recursively find all TypeScript files in a directory
 */
function findTsFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * Main check function
 */
async function checkTranslationCoverage() {
  console.log("🌍 Checking translation coverage...\n");

  // Load locale files
  const enPath = path.join(projectRoot, "src/i18n/locales/en.json");
  const dePath = path.join(projectRoot, "src/i18n/locales/de.json");

  const enTranslations = loadLocale(enPath);
  const deTranslations = loadLocale(dePath);

  // Find all component files
  const componentsDir = path.join(projectRoot, "src/components");
  const componentFiles = findTsFiles(componentsDir);

  console.log(`📂 Checking ${componentFiles.length} component files...\n`);

  let missingKeys = [];
  let checkedKeys = new Set();

  // Check each component file
  for (const file of componentFiles) {
    const relativePath = path.relative(projectRoot, file);
    const content = fs.readFileSync(file, "utf-8");
    const keys = extractTranslationKeys(content);

    if (keys.length === 0) continue;

    for (const key of keys) {
      // Skip if we've already checked this key
      if (checkedKeys.has(key)) continue;
      checkedKeys.add(key);

      // Check English
      if (!hasKey(enTranslations, key)) {
        missingKeys.push({
          file: relativePath,
          key,
          locale: "en",
          path: enPath,
        });
      }

      // Check German
      if (!hasKey(deTranslations, key)) {
        missingKeys.push({
          file: relativePath,
          key,
          locale: "de",
          path: dePath,
        });
      }
    }
  }

  // Report results
  if (missingKeys.length > 0) {
    console.error("❌ Missing translation keys detected:\n");

    // Group by locale
    const byLocale = {
      en: missingKeys.filter((m) => m.locale === "en"),
      de: missingKeys.filter((m) => m.locale === "de"),
    };

    for (const [locale, keys] of Object.entries(byLocale)) {
      if (keys.length === 0) continue;

      console.error(`📝 ${locale.toUpperCase()}.json - ${keys.length} missing key(s):`);

      // Show unique keys only
      const uniqueKeys = [...new Set(keys.map((k) => k.key))];
      for (const key of uniqueKeys) {
        const example = keys.find((k) => k.key === key);
        console.error(`   • "${key}"`);
        console.error(`     Used in: ${example.file}`);
      }
      console.error("");
    }

    console.error("⚠️  Please add the missing keys to the locale files:\n");
    console.error(`   English: ${enPath}`);
    console.error(`   German:  ${dePath}\n`);
    console.error("📖 See docs/I18N.md for translation guidelines.\n");

    process.exit(1);
  }

  console.log(`✅ Translation coverage check passed!`);
  console.log(`   Verified ${checkedKeys.size} unique translation key(s)`);
  console.log(`   All keys exist in both en.json and de.json\n`);

  process.exit(0);
}

// Run the check
checkTranslationCoverage().catch((error) => {
  console.error("💥 Error during translation check:", error);
  process.exit(1);
});
