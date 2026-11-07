// Scrolls the page while a touch drag is held near the top or bottom edge of
// the viewport. Native mouse drags get this from the browser.

/** How far from the viewport edge the scroll zone reaches. */
export const EDGE_ZONE_PX = 64;
/** Scroll speed at the very edge. */
const MAX_SPEED_PX_PER_S = 900;

/**
 * Scroll speed for a finger at viewport `y`, negative upwards: rising from 0
 * where an edge zone begins to the maximum at the edge; 0 outside the zones.
 */
function edgeVelocity(y: number): number {
  const intoTop = EDGE_ZONE_PX - y;
  const intoBottom = y - (window.innerHeight - EDGE_ZONE_PX);
  if (intoTop > 0) return -speedAt(intoTop);
  if (intoBottom > 0) return speedAt(intoBottom);
  return 0;
}

/** Speed `depth` pixels into an edge zone. */
function speedAt(depth: number): number {
  return MAX_SPEED_PX_PER_S * Math.min(1, depth / EDGE_ZONE_PX);
}

interface Scrolling {
  /** Where the finger rests. */
  x: number;
  y: number;
  /** The animation frame that scrolls next. */
  frame: number;
  /** When the previous frame scrolled; null before the first. */
  lastFrameTime: number | null;
}

export class EdgeAutoScroll {
  private scrolling: Scrolling | null = null;

  /**
   * `onScrolled`: the page scrolled under the finger at (`x`, `y`), so what is
   * under it may have changed.
   */
  constructor(private readonly onScrolled: (x: number, y: number) => void) {}

  /** The finger is at (`x`, `y`): scroll while it rests in an edge zone. */
  follow(x: number, y: number): void {
    if (edgeVelocity(y) === 0) {
      this.stop();
    } else if (this.scrolling) {
      Object.assign(this.scrolling, { x, y });
    } else {
      const scrolling: Scrolling = { x, y, frame: 0, lastFrameTime: null };
      scrolling.frame = this.nextFrame(scrolling);
      this.scrolling = scrolling;
    }
  }

  stop(): void {
    if (this.scrolling) window.cancelAnimationFrame(this.scrolling.frame);
    this.scrolling = null;
  }

  private nextFrame(scrolling: Scrolling): number {
    return window.requestAnimationFrame((time) => this.step(scrolling, time));
  }

  private step(scrolling: Scrolling, time: number): void {
    const elapsedMs = scrolling.lastFrameTime === null ? 0 : time - scrolling.lastFrameTime;
    scrolling.lastFrameTime = time;
    window.scrollBy(0, (edgeVelocity(scrolling.y) * elapsedMs) / 1000);
    // Scheduled first, so that stopping from onScrolled cancels it
    scrolling.frame = this.nextFrame(scrolling);
    this.onScrolled(scrolling.x, scrolling.y);
  }
}
