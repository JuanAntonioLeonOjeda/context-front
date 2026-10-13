import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // `API_PROXY_TARGET` is read here, not exposed to the browser (no VITE_ prefix).
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    // One alias, `@/` → `src/` (.claude/rules/import-conventions.md); keep in sync with tsconfig.
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    server: {
      proxy: {
        // The backend serves `/health`, `/territories`…: the `/api` prefix is only the proxy's.
        "/api": {
          target: env.API_PROXY_TARGET ?? "http://localhost:8000",
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
