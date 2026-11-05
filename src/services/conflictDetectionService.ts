import type { Character } from "@/types/character";
import { generateETag } from "@/utils/etag";

import { CrossTabChannel, type ConflictMessage } from "./crossTabChannel.js";

export type ConflictResolution = "load-remote" | "save-local";

export interface ConflictDetail {
  localEtag: string;
  remoteEtag: string;
  remoteTimestamp: number;
  localCharacter: Character;
  resolve: (resolution: ConflictResolution) => void;
}

export class ConflictDetectionService {
  private transport: CrossTabChannel;
  private currentEtag: string | null = null;
  private pendingCharacter: Character | null = null;
  private hasDirtyChanges: boolean = false;
  // Remote update received while not dirty; lets us detect stale state when
  // the user starts editing
  private remoteEtagReceived: string | null = null;
  private remoteTimestampReceived: number | null = null;

  constructor() {
    this.transport = new CrossTabChannel((message) => this.handleMessage(message));
  }

  private handleMessage(message: ConflictMessage): void {
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
        window.dispatchEvent(new CustomEvent("tab-opened", { detail: { tabId: message.tabId } }));
        break;
      case "tab-closed":
        break;
    }
  }

  private handleVersionSaved(message: ConflictMessage): void {
    if (!message.etag || !message.timestamp) {
      return;
    }

    const hasLocalChanges = this.pendingCharacter || this.hasDirtyChanges;

    if (hasLocalChanges && this.currentEtag !== message.etag) {
      this.emitConflict(message.etag, message.timestamp);
    } else {
      this.remoteEtagReceived = message.etag;
      this.remoteTimestampReceived = message.timestamp;

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

  private handleRequestLatest(_message: ConflictMessage): void {
    if (this.currentEtag) {
      this.transport.broadcast({
        type: "respond-latest",
        etag: this.currentEtag,
        timestamp: Date.now(),
      });
    }
  }

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

  private resolveConflict(resolution: ConflictResolution, remoteEtag: string): void {
    window.dispatchEvent(
      new CustomEvent("conflict-resolved", {
        detail: { resolution, remoteEtag },
      })
    );

    this.transport.broadcast({
      type: "conflict-resolved",
      etag: resolution === "save-local" ? this.currentEtag || undefined : remoteEtag,
    });
  }

  public async notifyVersionSaved(character: Character): Promise<void> {
    const etag = await generateETag(character as unknown as Record<string, unknown>);
    this.currentEtag = etag;
    this.pendingCharacter = null;

    this.transport.broadcast({
      type: "version-saved",
      etag,
      timestamp: Date.now(),
      characterName: character.name,
    });
  }

  public async setCurrentEtag(character: Character): Promise<void> {
    this.currentEtag = await generateETag(character as unknown as Record<string, unknown>);
  }

  /**
   * If we received a remote update while not dirty (stale state),
   * this will emit a conflict event.
   */
  public markDirty(character?: Character): void {
    this.hasDirtyChanges = true;
    if (character) {
      this.pendingCharacter = character;
    }

    if (this.remoteEtagReceived && this.remoteEtagReceived !== this.currentEtag) {
      this.emitConflict(this.remoteEtagReceived, this.remoteTimestampReceived || Date.now());
      this.remoteEtagReceived = null;
      this.remoteTimestampReceived = null;
    }
  }

  public clearDirty(): void {
    this.hasDirtyChanges = false;
    this.pendingCharacter = null;
  }

  public close(): void {
    this.transport.close();
  }
}
