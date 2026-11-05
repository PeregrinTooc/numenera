import { beforeEach, afterEach, vi, type Mock } from "vitest";

export function setupTestContainer(): () => HTMLElement {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "test-container";
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    document.body.innerHTML = "";
  });

  return () => container;
}

export function createMockUpdateFn<T = unknown>(): {
  fn: Mock<(arg: T) => void>;
  getCalls: () => T[];
  getLastCall: () => T | undefined;
} {
  const fn = vi.fn<(arg: T) => void>();

  return {
    fn,
    getCalls: () => fn.mock.calls.map((call) => call[0]),
    getLastCall: () => {
      const calls = fn.mock.calls;
      return calls.length > 0 ? calls[calls.length - 1][0] : undefined;
    },
  };
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function nextTick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
