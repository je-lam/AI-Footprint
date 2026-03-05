import "./sidepanel/style.css";
import { createRoot } from "react-dom/client";
import App from "./sidepanel/App";

export default defineContentScript({
  matches: ["https://chatgpt.com/*"],
  cssInjectionMode: "ui", // This tells WXT to bundle the CSS for UI injection
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "ai-impact-tracker",
      position: "inline",
      anchor: "main", // or specific selector
      onMount: (container) => {
        const root = createRoot(container);
        root.render(<App />);
        return root;
      },
    });
    ui.mount();
  },
});
