module.exports = {
  default: {
    import: ["tests/e2e/support/**/*.ts", "tests/e2e/step-definitions/**/*.ts"],
    loader: ["ts-node/esm"],
    format: ["progress", "html:test-results/cucumber-report.html"],
    formatOptions: { snippetInterface: "async-await" },
    tags: "not @skip and not @wip",
    timeout: 300, // 300 milliseconds for e2e tests with modal rendering
    failFast: true, // Stop on first failure
    // eslint-disable-next-line no-undef
    parallel: process.env.CI ? 1 : 6, // 6 workers locally
  },
};
