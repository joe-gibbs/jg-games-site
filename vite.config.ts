import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { guideInputs, webkilnGuides } from "./guides.ts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), webkilnGuides()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        webkiln: resolve(__dirname, "webkiln/index.html"),
        webkilnDocs: resolve(__dirname, "webkiln/docs/index.html"),
        webkilnDownloads: resolve(__dirname, "webkiln/downloads/index.html"),
        webkilnTry: resolve(__dirname, "webkiln/try/index.html"),
        webkilnDashboard: resolve(__dirname, "webkiln/dashboard/index.html"),
        ...guideInputs,
      },
    },
  },
});
