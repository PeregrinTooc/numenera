/** One of `total` slices of the E2E suite, numbered from 1 (E2E_SHARD="2/4"). */
export interface Shard {
  index: number;
  total: number;
}

export function parseShard(value: string | undefined): Shard | null {
  if (value === undefined) return null;
  const match = /^(\d+)\/(\d+)$/.exec(value);
  const index = Number(match?.[1]);
  const total = Number(match?.[2]);
  if (!match || index < 1 || index > total) {
    throw new Error(`E2E_SHARD must look like "2/4" (shard 2 of 4), got "${value}"`);
  }
  return { index, total };
}

/**
 * This shard's scenarios, dealt out in turn: the long feature files spread
 * over every shard instead of loading one of them.
 */
export function scenariosInShard<T>(scenarios: T[], shard: Shard): T[] {
  return scenarios.filter((_, position) => position % shard.total === shard.index - 1);
}
