import { vi } from "vitest";

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

  /** Every channel opened since the mock was installed, oldest first. */
  static instances: MockBroadcastChannel[] = [];

  constructor(name: string) {
    this.name = name;
    MockBroadcastChannel.instances.push(this);
  }

  /** The most recently opened channel. */
  static latest(): MockBroadcastChannel {
    const channel = MockBroadcastChannel.instances[MockBroadcastChannel.instances.length - 1];
    if (!channel) {
      throw new Error("No BroadcastChannel has been opened");
    }
    return channel;
  }

  /** Deliver a message as if another tab had posted it. */
  receive(data: unknown): void {
    this.onmessage?.({ data });
  }

  /** The id this tab announced itself with, read from its first posted message. */
  get tabId(): string {
    const first = this.postMessage.mock.calls[0]?.[0] as { tabId: string } | undefined;
    if (!first) {
      throw new Error("No message posted on this channel yet");
    }
    return first.tabId;
  }

  /** Payloads of posted messages of the given type. */
  posted(type: string): Array<Record<string, unknown>> {
    return this.postMessage.mock.calls
      .map(([message]) => message as Record<string, unknown>)
      .filter((message) => message.type === type);
  }
}

/**
 * Replace the global BroadcastChannel with the mock; returns the restore function.
 */
export function installMockBroadcastChannel(): () => void {
  const globals = globalThis as Record<string, unknown>;
  const original = globals.BroadcastChannel;
  MockBroadcastChannel.instances = [];
  globals.BroadcastChannel = MockBroadcastChannel;
  return () => {
    globals.BroadcastChannel = original;
  };
}
