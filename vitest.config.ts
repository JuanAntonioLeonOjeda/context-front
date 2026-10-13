import { mergeConfig, defineConfig } from "vitest/config";

import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      // No network in tests: an unhandled request fails instead of reaching a server.
      restoreMocks: true,
    },
  }),
);
