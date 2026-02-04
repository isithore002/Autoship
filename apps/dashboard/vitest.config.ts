import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";


export default defineConfig({
  plugins: [react()],
  test: {
    testTimeout: 30000,
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
test: {
    testTimeout: 30000 // 30 seconds globally
  }