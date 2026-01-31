/**
 * AutoSaveService - Provides debounced auto-save functionality with timestamp tracking
 *
 * Features:
 * - Debounced save requests (300ms default)
 * - Last save timestamp tracking
 * - Event emission for UI updates
 * - Simple event system for save completion notifications
 */

type SaveCompletedEvent = {
  timestamp: string;
};

type EventCallback = (event: SaveCompletedEvent) => void;

export class AutoSaveService {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private lastSaveTimestamp: string | null = null;
  private saveCallback: () => void;
  private debounceTime: number;
  private listeners: Map<string, EventCallback[]> = new Map();

  /**
   * Create a new AutoSaveService
   * @param saveCallback Function to call when save is triggered
   * @param debounceTime Time in milliseconds to wait before saving (default: 300ms)
   */
  constructor(saveCallback: () => void, debounceTime: number = 300) {
    this.saveCallback = saveCallback;
    this.debounceTime = debounceTime;
  }

  /**
   * Request a save operation (debounced)
   * Multiple rapid calls will be collapsed into a single save
   */
  requestSave(): void {
    // Clear existing timer
    if (this.debounceTimer) {
      globalThis.clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = globalThis.setTimeout(() => {
      this.performSave();
    }, this.debounceTime);
  }

  /**
   * Perform the actual save and update timestamp
   */
  private performSave(): void {
    // Call the save callback
    this.saveCallback();

    // Update timestamp
    this.lastSaveTimestamp = this.formatTimestamp(new Date());

    // Emit save-completed event
    this.emit("save-completed", {
      timestamp: this.lastSaveTimestamp,
    });

    // Clear timer
    this.debounceTimer = null;
  }

  /**
   * Format a date as a time string
   * @param date Date to format
   * @returns Formatted time string (e.g., "2:45:33 PM" or "14:45:33")
   */
  private formatTimestamp(date: Date): string {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  /**
   * Get the last save timestamp
   * @returns Formatted timestamp string, or null if never saved
   */
  getLastSaveTimestamp(): string | null {
    return this.lastSaveTimestamp;
  }

  /**
   * Check if a save has ever been performed
   * @returns true if at least one save has occurred
   */
  hasEverSaved(): boolean {
    return this.lastSaveTimestamp !== null;
  }

  /**
   * Register an event listener
   * @param event Event name
   * @param callback Callback function
   */
  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Remove an event listener
   * @param event Event name
   * @param callback Callback function to remove
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all registered listeners
   * @param event Event name
   * @param data Event data
   */
  private emit(event: string, data: SaveCompletedEvent): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}
