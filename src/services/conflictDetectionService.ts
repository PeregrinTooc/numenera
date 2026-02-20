import type { Character } from "../types/character";
import { generateETag } from "../utils/etag";

// Global type declarations for BroadcastChannel API
declare class BroadcastChannel {
  constructor(name: string);
  name: string;
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage(message: unknown): void;
  close(): void;
}

declare class MessageEvent<T = unknown> {
  readonly data: T;
}

/**
 * Message types for cross-tab communication
 */
interface ConflictMessage {
  type:
    | "version-saved"
    | "request-latest"
    | "respond-latest"
    | "conflict-resolved"
    | "tab-opened"
    | "tab-closed";
  tabId: string;
  etag?: string;
  timestamp?: number;
  characterName?: string;
}

/**
 * Conflict resolution options
 */
export type ConflictResolution = "load-remote" | "save-local";

/**
 * Conflict event detail
 */
export interface ConflictDetail {
  localEtag: string;
  remoteEtag: string;
  remoteTimestamp: number;
  localCharacter: Character;
  resolve: (resolution: ConflictResolution) => void;
}

/**
 * Service for detecting and handling conflicts when editing
 * the same character in multiple browser tabs/windows.
 *
 * Uses BroadcastChannel API for cross-tab communication.
 */
export class ConflictDetectionService {
  private channel: BroadcastChannel;
  private tabId: string;
  private currentEtag: string | null = null;
  private pendingCharacter: Character | null = null;
  private hasDirtyChanges: boolean = false;
  private isEnabled: boolean = true;

  constructor() {
    this.tabId = this.generateTabId();
    this.channel = new BroadcastChannel("numenera-character-sync");

    // Set up message handler
    this.channel.onmessage = (event: MessageEvent<ConflictMessage>) => {
      this.handleMessage(event.data);
    };

    // Announce tab opened
    this.broadcast({ type: "tab-opened", tabId: this.tabId });

    // Clean up on page unload
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.broadcast({ type: "tab-closed", tabId: this.tabId });
        this.channel.close();
      });
    }
  }

  /**
   * Generate a unique tab ID
   */
  private generateTabId(): string {
    return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Broadcast a message to all other tabs
   */
  private broadcast(message: ConflictMessage): void {
    if (this.isEnabled) {
      this.channel.postMessage(message);
    }
  }

  /**
   * Handle incoming messages from other tabs
   */
  private handleMessage(message: ConflictMessage): void {
    // Ignore messages from self
    if (message.tabId === this.tabId) {
      return;
    }

    switch (message.type) {
      case "version-saved":
        this.handleVersionSaved(message);
        break;
      case "request-latest":
        this.handleRequestLatest(message);
        break;
      case "respond-latest":
        this.handleRespondLatest(message);
        break;
      case "tab-opened":
        // Another tab opened - could notify user if needed
        window.dispatchEvent(new CustomEvent("tab-opened", { detail: { tabId: message.tabId } }));
        break;
      case "tab-closed":
        // Another tab closed - no action needed
        break;
    }
  }

  /**
   * Handle notification that another tab saved a version
   */
  private handleVersionSaved(message: ConflictMessage): void {
    if (!message.etag || !message.timestamp) {
      return;
    }

    // Check if we have pending unsaved changes (either tracked character or dirty flag)
    const hasLocalChanges = this.pendingCharacter || this.hasDirtyChanges;

    if (hasLocalChanges && this.currentEtag !== message.etag) {
      // Conflict detected - we have local changes and remote changed
      this.emitConflict(message.etag, message.timestamp);
    } else {
      // No current local changes
      // Store the remote update info so we can detect staleness when user starts editing
      this.remoteEtagReceived = message.etag;
      this.remoteTimestampReceived = message.timestamp;

      // Notify about newer version available (for UI updates)
      window.dispatchEvent(
        new CustomEvent("newer-version-available", {
          detail: {
            etag: message.etag,
            timestamp: message.timestamp,
            characterName: message.characterName,
          },
        })
      );
    }
  }

  /**
   * Handle request for latest version from another tab
   */
  private handleRequestLatest(_message: ConflictMessage): void {
    if (this.currentEtag) {
      this.broadcast({
        type: "respond-latest",
        tabId: this.tabId,
        etag: this.currentEtag,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle response with latest version info
   */
  private handleRespondLatest(message: ConflictMessage): void {
    if (message.etag && message.etag !== this.currentEtag) {
      window.dispatchEvent(
        new CustomEvent("newer-version-available", {
          detail: {
            etag: message.etag,
            timestamp: message.timestamp,
          },
        })
      );
    }
  }

  /**
   * Emit conflict event for UI to handle
   */
  private emitConflict(remoteEtag: string, remoteTimestamp: number): void {
    const conflictDetail: ConflictDetail = {
      localEtag: this.currentEtag || "",
      remoteEtag,
      remoteTimestamp,
      localCharacter: this.pendingCharacter || ({} as Character),
      resolve: (resolution: ConflictResolution) => {
        this.resolveConflict(resolution, remoteEtag);
      },
    };

    window.dispatchEvent(new CustomEvent("version-conflict", { detail: conflictDetail }));
  }

  /**
   * Resolve a conflict with the chosen resolution
   */
  private resolveConflict(resolution: ConflictResolution, remoteEtag: string): void {
    window.dispatchEvent(
      new CustomEvent("conflict-resolved", {
        detail: { resolution, remoteEtag },
      })
    );

    // Notify other tabs
    this.broadcast({
      type: "conflict-resolved",
      tabId: this.tabId,
      etag: resolution === "save-local" ? this.currentEtag || undefined : remoteEtag,
    });
  }

  /**
   * Called when a version is about to be saved
   * Checks for conflicts before allowing the save
   */
  public async checkBeforeSave(character: Character): Promise<boolean> {
    // Store pending character for conflict handling
    this.pendingCharacter = character;

    // Generate ETag for the character we're about to save
    // Note: ETag is computed but not stored here - actual storage happens in notifyVersionSaved
    await generateETag(character as unknown as Record<string, unknown>);

    // If we don't have a current ETag, this is the first save - no conflict possible
    if (!this.currentEtag) {
      return true;
    }

    // Request latest version from other tabs
    this.broadcast({ type: "request-latest", tabId: this.tabId });

    // Give other tabs a moment to respond
    // In real usage, this would be handled asynchronously via events
    return new Promise((resolve) => {
      // Short timeout to check for conflicts
      setTimeout(() => {
        // If no conflict was detected, allow the save
        resolve(true);
      }, 50);
    });
  }

  /**
   * Called after a version is successfully saved
   * Updates the current ETag and notifies other tabs
   */
  public async notifyVersionSaved(character: Character): Promise<void> {
    const etag = await generateETag(character as unknown as Record<string, unknown>);
    this.currentEtag = etag;
    this.pendingCharacter = null;

    this.broadcast({
      type: "version-saved",
      tabId: this.tabId,
      etag,
      timestamp: Date.now(),
      characterName: character.name,
    });
  }

  /**
   * Set the current ETag (for when loading a character)
   */
  public async setCurrentEtag(character: Character): Promise<void> {
    this.currentEtag = await generateETag(character as unknown as Record<string, unknown>);
  }

  /**
   * Get the current ETag
   */
  public getCurrentEtag(): string | null {
    return this.currentEtag;
  }

  /**
   * Enable or disable conflict detection
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if conflict detection is enabled
   */
  public isConflictDetectionEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Track if we received a remote update while not dirty
   * This allows us to detect stale state when user starts editing
   */
  private remoteEtagReceived: string | null = null;
  private remoteTimestampReceived: number | null = null;

  /**
   * Mark that the current tab has unsaved/dirty changes
   * Call this when the user starts editing
   *
   * If we received a remote update while not dirty (stale state),
   * this will emit a conflict event.
   */
  public markDirty(character?: Character): void {
    this.hasDirtyChanges = true;
    if (character) {
      this.pendingCharacter = character;
    }

    // Check if we have a stale state (received remote update while not dirty)
    if (this.remoteEtagReceived && this.remoteEtagReceived !== this.currentEtag) {
      // We're starting to edit but our base state is stale - emit conflict
      this.emitConflict(this.remoteEtagReceived, this.remoteTimestampReceived || Date.now());
      // Clear the stale marker
      this.remoteEtagReceived = null;
      this.remoteTimestampReceived = null;
    }
  }

  /**
   * Clear the dirty flag
   * Call this after changes are saved or discarded
   */
  public clearDirty(): void {
    this.hasDirtyChanges = false;
    this.pendingCharacter = null;
  }

  /**
   * Check if there are dirty/unsaved changes
   */
  public isDirty(): boolean {
    return this.hasDirtyChanges || this.pendingCharacter !== null;
  }

  /**
   * Close the broadcast channel
   */
  public close(): void {
    this.broadcast({ type: "tab-closed", tabId: this.tabId });
    this.channel.close();
  }
}
