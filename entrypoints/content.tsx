import "./popup/style.css";
import { createRoot } from "react-dom/client";
import WeeklyImpactInline from "@/components/WeeklyImpactInline";
import { calculateImpact } from "@/utils/calculator";
import { recordImpact } from "@/utils/storage";

export default defineContentScript({
  matches: ["https://chatgpt.com/*"],
  cssInjectionMode: "ui",
  async main(ctx) {
    console.log("[AI-Footprint] Content script active with storage fixes");

    const mountingInProgress = new Set<string>();

    const injectAt = async (
      selector: string, 
      name: string, 
      appendType: "first" | "last" | "before" | "after" = "first"
    ) => {
      // 1. Strict check: Is it already in the DOM?
      if (document.querySelector(name)) return;
      
      // 2. Strict check: Are we already trying to mount this exact name?
      if (mountingInProgress.has(name)) return;
      
      const anchor = document.querySelector(selector);
      if (!anchor) return;

      mountingInProgress.add(name);

      try {
        console.log(`[AI-Footprint] Mounting ${name}...`);
        const ui = await createIntegratedUi(ctx, {
          position: "inline",
          anchor: selector,
          append: appendType, 
          onMount: (container) => {
            const wrapper = document.createElement(name);
            wrapper.style.display = "block";
            wrapper.style.width = "fit-content";
            
            // Special styling for splash screen
            if (name === "ai-impact-tracker-splash") {
               wrapper.style.margin = "0 auto";
               wrapper.style.textAlign = "center";
            }

            container.appendChild(wrapper);
            const root = createRoot(wrapper);
            root.render(<WeeklyImpactInline />);
            return root;
          },
          onRemove: (root) => {
            mountingInProgress.delete(name);
            root?.unmount();
          },
        });
        ui.mount();
      } catch (err) {
        // fail silently
      } finally {
        // Small delay before clearing the lock to prevent double-firing in rapid intervals
        setTimeout(() => mountingInProgress.delete(name), 500);
      }
    };

    // Polling interval to handle React clearing our UI
    const checkAndInject = () => {
      // Header: Inside the actions bar
      injectAt("#conversation-header-actions", "ai-impact-tracker-header", "first");
      
      // Splash: ABOVE the headline (before it) to prevent the "flex-side" issue
      const splash = document.querySelector("h1.text-page-header");
      if (splash) {
        injectAt("h1.text-page-header", "ai-impact-tracker-splash", "before");
      }
    };

    const poll = setInterval(checkAndInject, 1500);

    const handleCapture = () => {
      const composer = document.querySelector("#prompt-textarea");
      const text = (composer as HTMLTextAreaElement)?.value || "";
      const tokens = Math.max(5, Math.ceil(text.length / 4));
      const impact = calculateImpact(tokens);
      recordImpact(impact);
    };

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-testid="send-button"]')) handleCapture();
    });

    document.addEventListener("keydown", (e) => {
      const target = e.target as HTMLElement;
      if (target.id === "prompt-textarea" && e.key === "Enter" && !e.shiftKey) {
        handleCapture();
      }
    });

    ctx.onInvalidated(() => {
      clearInterval(poll);
    });

    checkAndInject();
  },
});
