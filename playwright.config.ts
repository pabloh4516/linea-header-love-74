import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL:
      process.env.PLAYWRIGHT_BASE_URL ||
      "https://id-preview--13500751-9787-48f3-b789-08aacbee9874.lovable.app",
    trace: "retain-on-failure",
  },
});
