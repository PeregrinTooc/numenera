const port = process.env.E2E_PORT;
if (!port) {
  throw new Error("E2E_PORT is not set: run E2E tests through the npm test:e2e* scripts");
}

export const BASE_URL = `http://localhost:${port}`;
