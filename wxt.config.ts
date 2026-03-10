import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  manifest: {
    permissions: ["sidePanel", "storage"],
  },
  modules: ["@wxt-dev/module-react"],
  runner: {
    startUrls: ["https://chatgpt.com"],
    chromiumArgs: ["--start-maximized"], // this was starting to annoy me so I added it back
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
