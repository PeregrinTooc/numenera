/**
 * CompletionNotifier - Utility for managing async operation completion events
 *
 * Provides a standardized way to emit and listen for completion events across
 * the application. This is particularly useful for testing, where we need to
 * wait for async operations to complete before making assertions.
 *
 * Event Naming Convention:
 * - {operation}-started: Operation has begun
 * - {operation}-completed: Operation finished successfully
 * - {operation}-error: Operation failed with error
 *
 * Example usage:
 * ```typescript
 * // In service:
 * const notifier = new CompletionNotifier('save-character');
 * notifier.start();
 * try {
 *   await storage.save(character);
 *   notifier.complete();
 * } catch (error) {
 *   notifier.error(error);
 * }
 *
 * // In test:
 * const completed = await waitForEvent('save-character-completed');
 * ```
 */

export interface CompletionNotifierOptions {
  /**
   * Whether to emit events (default: true in browser, false in Node)
   */
  enabled?: boolean;

  /**
   * Additional data to include with events
   */
  data?: Record<string, unknown>;
}

export class CompletionNotifier {
  private operationName: string;
  private enabled: boolean;
  private data: Record<string, unknown>;

  constructor(operationName: string, options: CompletionNotifierOptions = {}) {
    this.operationName = operationName;
    this.enabled = options.enabled ?? typeof window !== "undefined";
    this.data = options.data ?? {};
  }

  /**
   * Emit a 'started' event
   */
  start(additionalData?: Record<string, unknown>): void {
    this.emit("started", additionalData);
  }

  /**
   * Emit a 'completed' event
   */
  complete(additionalData?: Record<string, unknown>): void {
    this.emit("completed", additionalData);
  }

  /**
   * Emit an 'error' event
   */
  error(error: Error | unknown, additionalData?: Record<string, unknown>): void {
    this.emit("error", {
      ...additionalData,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  /**
   * Emit a custom event with a suffix
   */
  emit(suffix: string, additionalData?: Record<string, unknown>): void {
    if (!this.enabled) {
      return;
    }

    if (typeof window !== "undefined") {
      const eventName = `${this.operationName}-${suffix}`;
      const detail = { ...this.data, ...additionalData };

      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
  }

  /**
   * Create a promise that resolves when the operation completes
   * Useful for testing
   */
  waitForCompletion(): Promise<CustomEvent> {
    if (typeof window === "undefined") {
      return Promise.reject(new Error("Cannot wait for completion in non-browser environment"));
    }

    return new Promise((resolve, reject) => {
      const completedHandler = (event: Event) => {
        cleanup();
        resolve(event as CustomEvent);
      };

      const errorHandler = (event: Event) => {
        cleanup();
        reject((event as CustomEvent).detail?.error || "Operation failed");
      };

      const cleanup = () => {
        window.removeEventListener(`${this.operationName}-completed`, completedHandler);
        window.removeEventListener(`${this.operationName}-error`, errorHandler);
      };

      window.addEventListener(`${this.operationName}-completed`, completedHandler, { once: true });
      window.addEventListener(`${this.operationName}-error`, errorHandler, { once: true });
    });
  }
}

/**
 * Helper function to wait for a specific event
 * @param eventName The name of the event to wait for
 * @param timeout Maximum time to wait in milliseconds (default: 5000)
 */
export function waitForEvent(eventName: string, timeout: number = 5000): Promise<CustomEvent> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cannot wait for event in non-browser environment"));
  }

  return new Promise((resolve, reject) => {
    let timeoutId: number | null = null;

    const handler = (event: Event) => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener(eventName, handler);
      resolve(event as CustomEvent);
    };

    window.addEventListener(eventName, handler, { once: true });

    timeoutId = window.setTimeout(() => {
      window.removeEventListener(eventName, handler);
      reject(new Error(`Timeout waiting for event: ${eventName}`));
    }, timeout);
  });
}

/**
 * Helper function to wait for any of multiple events
 * @param eventNames Array of event names to wait for
 * @param timeout Maximum time to wait in milliseconds (default: 5000)
 */
export function waitForAnyEvent(
  eventNames: string[],
  timeout: number = 5000
): Promise<{ eventName: string; event: CustomEvent }> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cannot wait for events in non-browser environment"));
  }

  return new Promise((resolve, reject) => {
    let timeoutId: number | null = null;

    const createHandler = (eventName: string) => {
      return (event: Event) => {
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }
        // Remove all listeners
        eventNames.forEach((name) => {
          window.removeEventListener(name, handlers.get(name)!);
        });
        resolve({ eventName, event: event as CustomEvent });
      };
    };

    const handlers = new Map<string, EventListener>();
    eventNames.forEach((eventName) => {
      const handler = createHandler(eventName);
      handlers.set(eventName, handler);
      window.addEventListener(eventName, handler, { once: true });
    });

    timeoutId = window.setTimeout(() => {
      eventNames.forEach((name) => {
        window.removeEventListener(name, handlers.get(name)!);
      });
      reject(new Error(`Timeout waiting for any of: ${eventNames.join(", ")}`));
    }, timeout);
  });
}
