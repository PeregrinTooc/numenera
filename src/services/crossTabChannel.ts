// BroadcastChannel and MessageEvent are DOM globals
/* eslint-disable no-undef */

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

  constructor(onMessage: (message: ConflictMessage) => void) {
    this.tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.channel = new BroadcastChannel("numenera-character-sync");

    this.channel.onmessage = (event: MessageEvent) => {
      const message = event.data as ConflictMessage;
      if (message.tabId !== this.tabId) {
        onMessage(message);
      }
    };

    this.broadcast({ type: "tab-opened" });

    window.addEventListener("beforeunload", () => this.close());
  }

  broadcast(message: Omit<ConflictMessage, "tabId">): void {
    this.channel.postMessage({ ...message, tabId: this.tabId });
  }

  close(): void {
    this.broadcast({ type: "tab-closed" });
    this.channel.close();
  }
}
