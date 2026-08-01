module.exports = {
  default: {
    import: ["tests/e2e/support/**/*.ts", "tests/e2e/step-definitions/**/*.ts"],
    loader: ["ts-node/esm"],
    format: ["progress", "html:test-results/cucumber-report.html"],
    formatOptions: { snippetInterface: "async-await" },
    tags: "not @skip and not @wip and not @deprecated",
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
