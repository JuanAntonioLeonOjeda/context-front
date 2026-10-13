import { setupServer } from "msw/node";

// Handlers are added per test with `server.use(...)`, serving real API fixtures.
export const server = setupServer();
