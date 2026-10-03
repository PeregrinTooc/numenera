// Device-aware tag filter (see tests/e2e/support/device.ts for the profiles).
// The phone and WebKit sets are listed here rather than loaded from device.ts:
// this config is CommonJS and is read before tsx is registered, and device.ts
// has no notion of "phone" anyway. Keep these lists in step with DEVICE_PROFILES.
// eslint-disable-next-line no-undef
const device = process.env.DEVICE || "desktop";
const PHONE_DEVICES = ["pixel5", "iphone12"]; // narrower than the app's 768px phone breakpoint
const WEBKIT_DEVICES = ["iphone12", "ipadpro"];

const excludedTags = ["@skip", "@wip", "@deprecated"];
if (device !== "desktop") excludedTags.push("@desktop-only");
if (PHONE_DEVICES.includes(device)) excludedTags.push("@not-phone");
if (WEBKIT_DEVICES.includes(device)) {
  excludedTags.push("@chromium-only", "@known-issue-webkit-unload");
}

module.exports = {
  default: {
    // tsx-register.js must come first: it registers the TypeScript loader
    // that the following .ts globs depend on.
    import: [
      "tests/e2e/support/tsx-register.js",
      "tests/e2e/support/**/*.ts",
      "tests/e2e/step-definitions/**/*.ts",
    ],
    format: ["progress", "html:test-results/cucumber-report.html"],
    formatOptions: { snippetInterface: "async-await" },
    // DEVICE unset or "desktop" → "not @skip and not @wip and not @deprecated".
    tags: excludedTags.map((tag) => `not ${tag}`).join(" and "),
    // NOTE: `timeout` is not a recognized cucumber-js configuration key (see
    // IConfiguration in @cucumber/cucumber) and was previously set here to
    // 300 with a comment claiming it controlled the per-step timeout — it
    // never did anything. The real per-step/hook timeout is set via
    // setDefaultTimeout(30000) in tests/e2e/support/world.ts.
    failFast: false, // Run all scenarios even after a failure
    // eslint-disable-next-line no-undef
    parallel: process.env.CI ? 1 : 6, // 6 workers locally
  },
};
