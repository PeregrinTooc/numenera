import { vi } from "vitest";
import type { ConflictDetectionService } from "@/services/conflictDetectionService";
import type { Character } from "@/types/character";

// Mock MessageEvent interface for tests
export interface MockMessageEvent<T = unknown> {
  data: T;
}

// Mock BroadcastChannel
export class MockBroadcastChannel {
  name: string;
  onmessage: ((event: MockMessageEvent) => void) | null = null;
  postMessage = vi.fn();
  close = vi.fn();

  constructor(name: string) {
    this.name = name;
  }
}

/**
 * Private members the tests read to reach the mock channel and the pending
 * state. A structural view of the class, not `any`.
 */
interface ServiceInternals {
  channel: MockBroadcastChannel;
  tabId: string;
  pendingCharacter: Character | null;
}

interface TransportInternals {
  channel: MockBroadcastChannel;
  tabId: string;
}

export function internalsOf(service: ConflictDetectionService): ServiceInternals {
  const view = service as unknown as {
    transport: TransportInternals;
    pendingCharacter: Character | null;
  };
  return {
    channel: view.transport.channel,
    tabId: view.transport.tabId,
    pendingCharacter: view.pendingCharacter,
  };
}

/**
 * Replace the global BroadcastChannel with the mock; returns the restore function.
 */
export function installMockBroadcastChannel(): () => void {
  const globals = globalThis as Record<string, unknown>;
  const original = globals.BroadcastChannel;
  globals.BroadcastChannel = MockBroadcastChannel;
  return () => {
    globals.BroadcastChannel = original;
  };
}
