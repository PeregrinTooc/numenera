import { render } from "lit-html";
import { registerSW } from "virtual:pwa-register";
import { UpdateBanner } from "@/components/UpdateBanner";
import { ensureBodyContainer } from "./bodyContainer";

/** Register the service worker and offer a waiting newer version with a banner. */
export function registerUpdatePrompt(): void {
  const updateServiceWorker = registerSW({
    onNeedRefresh: () => {
      const banner = new UpdateBanner(() => updateServiceWorker());
      render(banner.render(), ensureBodyContainer("update-banner-container"));
    },
  });
}
