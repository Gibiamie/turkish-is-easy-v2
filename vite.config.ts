import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({ base: "/turkish-is-easy-v2/", plugins: [react()], server: { allowedHosts: true }, build: { target: "es2022", sourcemap: true }, test: { environment: "node", include: ["src/**/*.test.ts"] } });
