module.exports = {
  default: {
    import: ["tests/e2e/support/**/*.ts", "tests/e2e/step-definitions/**/*.ts"],
    loader: ["ts-node/esm"],
    format: ["progress", "html:test-results/cucumber-report.html"],
    formatOptions: { snippetInterface: "async-await" },
    tags: "not @skip and not @wip",
    timeout: 200, // 200ms for faster feedback on steps
    hookTimeout: 30000, // 30 seconds for hooks (BeforeAll/AfterAll need time to start/stop server)
  },
};
