/**
 * Comparison View is unavailable on phone-width viewports regardless of the
 * settings toggle (two full character sheets side by side don't fit on a
 * Pixel 5 / iPhone 12 width). "Phone" is defined as narrower than Tailwind's
 * stock `md` breakpoint (768px, unmodified in this project's @theme block -
 * see src/styles/main.css) which cleanly separates Pixel 5 / iPhone 12
 * (~390px) from iPad Pro (1024px+), so iPad Pro still gets the split view
 * (Rule 9: responsive across Desktop Chrome, Pixel 5, iPhone 12, iPad Pro).
 */
export function isPhoneViewport(): boolean {
  return !window.matchMedia("(min-width: 768px)").matches;
}
