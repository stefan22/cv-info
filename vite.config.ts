/// <reference types="vitest/config" />

import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const isVitest = process.env.VITEST === "true";

export default defineConfig({
  plugins: [
    tailwindcss(),
    ...(isVitest ? [react()] : [reactRouter()]),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./app/test/setup.ts"],
    include: ["app/**/*.{test,spec}.{ts,tsx}"],
    css: true,
    pool: "forks",
  },
});
