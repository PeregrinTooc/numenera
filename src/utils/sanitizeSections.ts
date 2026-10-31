import { Character } from "@/types/character";
import { t } from "@/i18n/index";
import { CHARACTER_DEFAULTS } from "@/data/characterDefaults";

export function sanitizeStats(data: unknown, warnings: string[]): Character["stats"] {
  const defaults = CHARACTER_DEFAULTS.stats;

  if (data === undefined || data === null || typeof data !== "object") {
    if (data !== undefined) {
      warnings.push(t("validation.sanitize.wrongType", { field: "stats", expected: "object" }));
    } else {
      warnings.push(t("validation.sanitize.missingField", { field: "stats" }));
    }
    return globalThis.structuredClone(defaults);
  }

  const input = data as Record<string, unknown>;

  return {
    might: sanitizeStatPool(input.might, "stats.might", defaults.might, warnings),
    speed: sanitizeStatPool(input.speed, "stats.speed", defaults.speed, warnings),
    intellect: sanitizeStatPool(input.intellect, "stats.intellect", defaults.intellect, warnings),
  };
}

function sanitizeStatPool(
  data: unknown,
  path: string,
  defaults: { pool: number; edge: number; current: number },
  warnings: string[]
): { pool: number; edge: number; current: number } {
  if (data === undefined || data === null || typeof data !== "object") {
    if (data !== undefined) {
      warnings.push(t("validation.sanitize.wrongType", { field: path, expected: "object" }));
    } else {
      warnings.push(t("validation.sanitize.missingField", { field: path }));
    }
    return { ...defaults };
  }

  const input = data as Record<string, unknown>;

  const sanitizePoolNum = (field: string, def: number): number => {
    const fullPath = `${path}.${field}`;
    if (input[field] === undefined) {
      warnings.push(t("validation.sanitize.missingField", { field: fullPath }));
      return def;
    }
    if (typeof input[field] !== "number" || isNaN(input[field] as number)) {
      warnings.push(t("validation.sanitize.wrongType", { field: fullPath, expected: "number" }));
      return def;
    }
    const val = input[field] as number;
    return val < 0 ? 0 : val;
  };

  return {
    pool: sanitizePoolNum("pool", defaults.pool),
    edge: sanitizePoolNum("edge", defaults.edge),
    current: sanitizePoolNum("current", defaults.current),
  };
}

export function sanitizeRecoveryRolls(
  data: unknown,
  warnings: string[]
): Character["recoveryRolls"] {
  const defaults = CHARACTER_DEFAULTS.recoveryRolls;

  if (data === undefined || data === null || typeof data !== "object") {
    if (data !== undefined) {
      warnings.push(
        t("validation.sanitize.wrongType", { field: "recoveryRolls", expected: "object" })
      );
    } else {
      warnings.push(t("validation.sanitize.missingField", { field: "recoveryRolls" }));
    }
    return { ...defaults };
  }

  const input = data as Record<string, unknown>;

  const sanitizeBool = (field: string, def: boolean): boolean => {
    const fullPath = `recoveryRolls.${field}`;
    if (input[field] === undefined) {
      warnings.push(t("validation.sanitize.missingField", { field: fullPath }));
      return def;
    }
    if (typeof input[field] !== "boolean") {
      warnings.push(t("validation.sanitize.wrongType", { field: fullPath, expected: "boolean" }));
      return def;
    }
    return input[field] as boolean;
  };

  const sanitizeNum = (field: string, def: number): number => {
    const fullPath = `recoveryRolls.${field}`;
    if (input[field] === undefined) {
      warnings.push(t("validation.sanitize.missingField", { field: fullPath }));
      return def;
    }
    if (typeof input[field] !== "number" || isNaN(input[field] as number)) {
      warnings.push(t("validation.sanitize.wrongType", { field: fullPath, expected: "number" }));
      return def;
    }
    return input[field] as number;
  };

  return {
    action: sanitizeBool("action", defaults.action),
    tenMinutes: sanitizeBool("tenMinutes", defaults.tenMinutes),
    oneHour: sanitizeBool("oneHour", defaults.oneHour),
    tenHours: sanitizeBool("tenHours", defaults.tenHours),
    modifier: sanitizeNum("modifier", defaults.modifier),
  };
}

export function sanitizeDamageTrack(data: unknown, warnings: string[]): Character["damageTrack"] {
  const defaults = CHARACTER_DEFAULTS.damageTrack;

  if (data === undefined || data === null || typeof data !== "object") {
    if (data !== undefined) {
      warnings.push(
        t("validation.sanitize.wrongType", { field: "damageTrack", expected: "object" })
      );
    } else {
      warnings.push(t("validation.sanitize.missingField", { field: "damageTrack" }));
    }
    return { ...defaults };
  }

  const input = data as Record<string, unknown>;

  if (typeof input.impairment !== "string") {
    warnings.push(
      t("validation.sanitize.wrongType", { field: "damageTrack.impairment", expected: "string" })
    );
    return { impairment: defaults.impairment };
  }

  const validImpairments = ["healthy", "impaired", "debilitated"];
  if (!validImpairments.includes(input.impairment)) {
    warnings.push(t("validation.sanitize.invalidValue", { field: "damageTrack.impairment" }));
    return { impairment: defaults.impairment };
  }

  return { impairment: input.impairment as "healthy" | "impaired" | "debilitated" };
}

export function sanitizeTextFields(data: unknown, warnings: string[]): Character["textFields"] {
  const defaults = CHARACTER_DEFAULTS.textFields;

  if (data === undefined || data === null || typeof data !== "object") {
    if (data !== undefined) {
      warnings.push(
        t("validation.sanitize.wrongType", { field: "textFields", expected: "object" })
      );
    } else {
      warnings.push(t("validation.sanitize.missingField", { field: "textFields" }));
    }
    return { ...defaults };
  }

  const input = data as Record<string, unknown>;

  return {
    background: typeof input.background === "string" ? input.background : defaults.background,
    notes: typeof input.notes === "string" ? input.notes : defaults.notes,
  };
}
