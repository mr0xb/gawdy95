import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build:
    mode === "demo"
      ? { outDir: "demo-dist" }
      : {
          lib: {
            entry: here("src/index.ts"),
            formats: ["es", "cjs"],
            fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
          },
          rollupOptions: { external: ["react", "react-dom", "react/jsx-runtime"] },
          copyPublicDir: false,
          sourcemap: true,
        },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/test-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
}));
