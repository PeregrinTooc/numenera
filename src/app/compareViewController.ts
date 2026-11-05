import { ensureBodyContainer } from "./bodyContainer";
import { CompareView } from "@/components/CompareView";
import type { AppContext } from "./appContext";

export function openCompareView(ctx: AppContext): void {
  const versionState = ctx.versionState;
  if (!versionState) return;

  const rightIndex = versionState.getCurrentVersionIndex();
  const leftIndex = Math.max(0, rightIndex - 1);

  ctx.compareView = new CompareView({
    versionState,
    initialLeftIndex: leftIndex,
    initialRightIndex: rightIndex,
    onExit: () => closeCompareView(ctx),
    onRestored: () => {
      // A restore inside Comparison View creates a new version in storage
      // without touching versionState's own single-pointer position, so the
      // navigator/banner behind this overlay would otherwise show a stale
      // version count once revealed again.
      void ctx.actions.updateVersionNavigator(true);
    },
  });

  const compareViewContainer = ensureBodyContainer("compare-view-container");
  ctx.compareView.mount(compareViewContainer);
}

function closeCompareView(ctx: AppContext): void {
  if (ctx.compareView) {
    ctx.compareView.unmount();
    ctx.compareView = null;
  }
}
