import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  manifest: {
    permissions: ['sidePanel', 'storage'],
  },
  modules: ["@wxt-dev/module-react"],
  runner: {
    startUrls: ["https://chatgpt.com"],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
