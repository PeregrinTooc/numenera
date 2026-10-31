import { VersionNavigator } from "@/components/VersionNavigator";
import { VersionWarningBanner } from "@/components/VersionWarningBanner";

export interface VersionNavigatorProps {
  versionCount: number;
  currentIndex: number;
  onNavigateBackward: () => void;
  onNavigateForward: () => void;
}

/**
 * Owns the version navigator and the "viewing an old version" banner that
 * main.ts mounts into containers rendered by the character sheet.
 */
export class SheetVersionUi {
  private navigator: VersionNavigator | null = null;
  private warningBanner: VersionWarningBanner | null = null;

  mountNavigator(container: HTMLElement, props: VersionNavigatorProps): void {
    this.navigator = new VersionNavigator(props);
    this.navigator.mount(container);
  }

  updateNavigator(props: VersionNavigatorProps): void {
    this.navigator?.update(props);
  }

  mountWarningBanner(
    container: HTMLElement,
    description: string,
    timestamp: Date,
    onReturn: () => void,
    onRestore: () => void
  ): void {
    this.warningBanner = new VersionWarningBanner({ description, timestamp, onReturn, onRestore });
    this.warningBanner.mount(container);
  }

  unmountWarningBanner(): void {
    if (this.warningBanner) {
      this.warningBanner.unmount();
      this.warningBanner = null;
    }
  }
}
