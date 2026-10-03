import type { DataTable } from "@cucumber/cucumber";

/** A vertical `| Property | Value |` table → { property: value } with lower-cased keys. Header row is skipped. */
export function propertyTable(table: DataTable): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [property, value] of table.raw().slice(1)) {
    result[property.toLowerCase()] = value;
  }
  return result;
}

/** A horizontal table with a header row → rows keyed by lower-cased header. */
export function lowerCaseHashes(table: DataTable): Record<string, string>[] {
  return table
    .hashes()
    .map((row) =>
      Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]))
    );
}

/** Parses an integer cell, throwing (not NaN-ing) on garbage so a typo fails loudly. */
export function intCell(value: string, label: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) throw new Error(`${label}: expected an integer, got "${value}"`);
  return parsed;
}
