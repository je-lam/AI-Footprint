import { calculateFileImpact, calculatePromptImpact } from "@/lib/calculator";

// entrypoints/chat-observer.content.ts
export default defineContentScript({
  matches: ["https://chatgpt.com/*"],
  main(ctx) {
    console.log("🌱 Eco-Tracker: Hooked into ChatGPT System");

    // --- 1. DETECT FILE EXPLORER UPLOADS ---
    // We listen for the 'change' event on any file input, even hidden ones.
    document.addEventListener(
      "change",
      (e) => {
        const target = e.target as HTMLInputElement;
        if (target.type === "file" && target.files) {
          const files = Array.from(target.files);
          files.forEach((file) => {
            const impact = calculateFileImpact(file);
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            console.log(
              `📎 [FILE DETECTED] Name: ${file.name} | Water: ${impact.water_mL} mL`,
            );

            // MVP Logic: Assign 1.5 Wh per file
            window.dispatchEvent(
              new CustomEvent("eco-update", {
                detail: { type: "file", val: 1.5 },
              }),
            );
          });
        }
      },
      true,
    ); // 'true' uses Capturing mode to prevent ChatGPT from blocking it

    // --- 2. DETECT TYPING (Universal Capture) ---
    window.addEventListener(
      "keydown",
      (e) => {
        const target = e.target as HTMLElement;
        // Only track if typing in the prompt area
        if (
          target.id === "prompt-textarea" ||
          target.getAttribute("contenteditable") === "true"
        ) {
          // We log every keypress but only calculate on 'Enter'
          if (e.key === "Enter" && !e.shiftKey) {
            const text =
              target.innerText || (target as HTMLTextAreaElement).value || "";
            const impact = calculatePromptImpact(text.length);

            console.log(
              `🚀 [PROMPT SENT] Length: ${text.length} chars | Estimated Water: ${impact.water_mL.toFixed(3)} mL`,
            );

            // Reset UI or commit to storage here
            // } else if (e.key.length === 1) {
            //   // Normal character typing
            //   // This allows you to update your "Pre-prompt" bubble live
            //   console.log("✍️ User is typing...");
          }
        }
      },
      true,
    );

    // --- 3. DETECT SEND BUTTON CLICK ---
    document.addEventListener(
      "click",
      (e) => {
        const target = e.target as HTMLElement;
        // Target the send button by its common 2026 attributes
        if (
          target.closest('button[data-testid="send-button"]') ||
          target.closest('button[aria-label="Send prompt"]')
        ) {
          console.log("🚀 [SEND CLICKED] Committing energy usage...");
        }
      },
      true,
    );
  },
});
