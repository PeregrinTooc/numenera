// BroadcastChannel and MessageEvent are DOM globals
/* eslint-disable no-undef */

/**
 * Message types for cross-tab communication
 */
export interface ConflictMessage {
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
 * Transport for the conflict protocol: owns the BroadcastChannel and this
 * tab's identity, and delivers messages from other tabs to a handler.
 */
export class CrossTabChannel {
  readonly tabId: string;
  private channel: BroadcastChannel;
  private enabled: boolean = true;

  constructor(onMessage: (message: ConflictMessage) => void) {
    this.tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.channel = new BroadcastChannel("numenera-character-sync");

    this.channel.onmessage = (event: MessageEvent) => {
      const message = event.data as ConflictMessage;
      // Ignore messages from self
      if (message.tabId !== this.tabId) {
        onMessage(message);
      }
    };

    // Announce tab opened
    this.broadcast({ type: "tab-opened" });

    // Clean up on page unload
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => this.close());
    }
  }

  /**
   * Broadcast a message to all other tabs (the tab id is added here)
   */
  broadcast(message: Omit<ConflictMessage, "tabId">): void {
    if (this.enabled) {
      this.channel.postMessage({ ...message, tabId: this.tabId });
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Announce that this tab closed, then close the channel
   */
  close(): void {
    this.broadcast({ type: "tab-closed" });
    this.channel.close();
  }
}
