import { mergeConfig, defineConfig } from "vitest/config";

import viteConfig from "./vite.config.ts";

export default defineConfig((env) =>
  mergeConfig(
    viteConfig(env),
    defineConfig({
      test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        restoreMocks: true,
        // Node's fetch (used under jsdom) needs an absolute URL; browsers accept "/api".
        env: { VITE_API_BASE_URL: "http://api.test/api" },
      },
    }),
  ),
);
