import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { resolve } from "path";

const PORT_FILE = resolve(process.cwd(), ".test-server-port");
const WORKER_COUNT_FILE = resolve(process.cwd(), ".test-worker-count");
const MAX_WAIT_MS = 60000; // 60 seconds
const POLL_INTERVAL_MS = 100; // 100ms

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
 * Clears all test state files (port file and worker count file)
 * This should be called at the start of test runs to clean up from previous failed runs
 * Safe to call from multiple workers simultaneously - race conditions are handled
 */
export function clearAllTestState(): void {
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

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      let count = 0;
      if (existsSync(WORKER_COUNT_FILE)) {
        const content = readFileSync(WORKER_COUNT_FILE, "utf8");
        count = parseInt(content, 10) || 0;
      }
      count++;

      // Use flag 'wx' for exclusive write - fails if file exists
      // This provides atomic write semantics
      if (count === 1) {
        // First worker - file shouldn't exist
        writeFileSync(WORKER_COUNT_FILE, count.toString(), { encoding: "utf8", flag: "wx" });
      } else {
        // Subsequent workers - overwrite existing file
        writeFileSync(WORKER_COUNT_FILE, count.toString(), "utf8");
      }
      return count;
    } catch {
      // File was created by another worker, retry
      if (attempt < MAX_RETRIES - 1) {
        // Wait a bit before retrying with exponential backoff
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
