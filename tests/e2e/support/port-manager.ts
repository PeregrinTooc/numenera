import { readFileSync, writeFileSync, existsSync, unlinkSync, statSync } from "fs";
import { resolve } from "path";

const PORT_FILE = resolve(process.cwd(), ".test-server-port");
const WORKER_COUNT_FILE = resolve(process.cwd(), ".test-worker-count");
const MAX_WAIT_MS = 60000; // 60 seconds
const POLL_INTERVAL_MS = 100; // 100ms
const STALE_THRESHOLD_MS = 60000; // 60 seconds - files older than this are considered stale

/**
 * Writes the server port to a file for other workers to read
 */
export function writePort(port: number): void {
  writeFileSync(PORT_FILE, port.toString(), "utf8");
}

/**
 * Reads the server port from the file
 * Returns null if file doesn't exist
 */
export function readPort(): number | null {
  if (!existsSync(PORT_FILE)) {
    return null;
  }
  const content = readFileSync(PORT_FILE, "utf8");
  const port = parseInt(content, 10);
  return isNaN(port) ? null : port;
}

/**
 * Waits for the port file to be created and returns the port
 * Throws error if timeout is reached
 */
export async function waitForPort(timeoutMs: number = MAX_WAIT_MS): Promise<number> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const port = readPort();
    if (port !== null) {
      return port;
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`Timeout waiting for port file after ${timeoutMs}ms`);
}

/**
 * Clears the port file
 */
export function clearPort(): void {
  if (existsSync(PORT_FILE)) {
    unlinkSync(PORT_FILE);
  }
}

/**
 * Checks if port file exists
 */
export function portFileExists(): boolean {
  return existsSync(PORT_FILE);
}

/**
 * Checks if a file is stale (older than STALE_THRESHOLD_MS)
 */
function isFileStale(filePath: string): boolean {
  try {
    if (!existsSync(filePath)) {
      return false;
    }
    const stats = statSync(filePath);
    const fileAge = Date.now() - stats.mtimeMs;
    return fileAge > STALE_THRESHOLD_MS;
  } catch {
    // If we can't read the file stats, assume it's not stale
    return false;
  }
}

/**
 * Checks if coordination state is stale and should be cleaned up
 * Returns true if either port file or worker count file is stale
 */
export function isCoordinationStateStale(): boolean {
  const portFileStale = isFileStale(PORT_FILE);
  const workerCountFileStale = isFileStale(WORKER_COUNT_FILE);

  // If either file is stale, the entire state is considered stale
  return portFileStale || workerCountFileStale;
}

/**
 * Clears all coordination files (port and worker count)
 * This should be called when stale state is detected
 * Safe to call from multiple workers - uses try-catch for race conditions
 */
export function clearCoordinationState(): void {
  try {
    if (existsSync(PORT_FILE)) {
      unlinkSync(PORT_FILE);
    }
  } catch {
    // File may have been deleted by another worker, ignore
  }

  try {
    if (existsSync(WORKER_COUNT_FILE)) {
      unlinkSync(WORKER_COUNT_FILE);
    }
  } catch {
    // File may have been deleted by another worker, ignore
  }
}

/**
 * Increments the worker count with retry for race condition handling
 * Returns the new count
 */
export function incrementWorkerCount(): number {
  const MAX_RETRIES = 10;
  const RETRY_DELAY_MS = 50;

  // First attempt: try to create file exclusively (first worker scenario)
  try {
    writeFileSync(WORKER_COUNT_FILE, "1", { encoding: "utf8", flag: "wx" });
    return 1;
  } catch {
    // File already exists, not the first worker
  }

  // Subsequent workers: increment existing count with retry logic
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      if (!existsSync(WORKER_COUNT_FILE)) {
        // File disappeared, try to be first again
        writeFileSync(WORKER_COUNT_FILE, "1", { encoding: "utf8", flag: "wx" });
        return 1;
      }

      const content = readFileSync(WORKER_COUNT_FILE, "utf8");
      const count = parseInt(content, 10) || 0;
      const newCount = count + 1;

      writeFileSync(WORKER_COUNT_FILE, newCount.toString(), "utf8");
      return newCount;
    } catch {
      // Race condition, retry
      if (attempt < MAX_RETRIES - 1) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
        const start = Date.now();
        while (Date.now() - start < delay) {
          // Busy wait
        }
      }
    }
  }

  // Fallback: read current count and add 1
  let count = 0;
  if (existsSync(WORKER_COUNT_FILE)) {
    const content = readFileSync(WORKER_COUNT_FILE, "utf8");
    count = parseInt(content, 10) || 0;
  }
  count++;
  writeFileSync(WORKER_COUNT_FILE, count.toString(), "utf8");
  return count;
}

/**
 * Decrements the worker count
 * Returns the new count
 */
export function decrementWorkerCount(): number {
  let count = 0;
  if (existsSync(WORKER_COUNT_FILE)) {
    const content = readFileSync(WORKER_COUNT_FILE, "utf8");
    count = parseInt(content, 10) || 0;
  }
  count = Math.max(0, count - 1);

  if (count === 0) {
    // Last worker, clean up the file
    if (existsSync(WORKER_COUNT_FILE)) {
      unlinkSync(WORKER_COUNT_FILE);
    }
  } else {
    writeFileSync(WORKER_COUNT_FILE, count.toString(), "utf8");
  }

  return count;
}
