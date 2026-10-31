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

  let compareViewContainer = document.getElementById("compare-view-container");
  if (!compareViewContainer) {
    compareViewContainer = document.createElement("div");
    compareViewContainer.id = "compare-view-container";
    document.body.appendChild(compareViewContainer);
  }
  ctx.compareView.mount(compareViewContainer);
}

export function closeCompareView(ctx: AppContext): void {
  if (ctx.compareView) {
    ctx.compareView.unmount();
    ctx.compareView = null;
  }
}
