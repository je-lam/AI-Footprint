import { calculateFileImpact, calculatePromptImpact } from "@/lib/calculator";
import { browser } from "wxt/browser";

export default defineContentScript({
  matches: ["https://chatgpt.com/*"],
  main(ctx) {
    console.log("🌱 Eco-Tracker: Hooked into ChatGPT System");

    // --- 1. LOCAL STATE MANAGEMENT ---
    let currentText = "";
    // We use a Map to store files by name, so we can easily add/remove them
    let pendingFiles = new Map<
      string,
      ReturnType<typeof calculateFileImpact>
    >();

    // --- 2. LIVE ESTIMATION ENGINE ---
    // This runs anytime the user types, adds a file, or clicks a button
    const updateLiveEstimate = async () => {
      // Step A: Check for deleted files.
      // If a file name is no longer visible anywhere in the prompt container, the user likely deleted it.
      const promptArea = document.querySelector("form") || document.body;
      const promptContext = promptArea.innerText || "";

      for (const [fileName, impact] of pendingFiles.entries()) {
        if (
          !promptContext.includes(fileName) &&
          !fileName.startsWith("image")
        ) {
          pendingFiles.delete(fileName);
          console.log(`🗑️ [FILE DELETED] Removed ${fileName} from draft.`);
        }
      }

      // Step B: Calculate Text Impact
      const textImpact = calculatePromptImpact(currentText.length);

      // Step C: Sum everything up
      let totalWater = textImpact.water_mL;
      let totalEnergy = textImpact.energy_Wh;

      pendingFiles.forEach((impact) => {
        totalWater += impact.water_mL;
        totalEnergy += impact.energy_Wh;
      });

      console.log(
        `📊 [LIVE DRAFT] Text: ${currentText.length} | Files: ${pendingFiles.size} | Est. Water: ${totalWater.toFixed(3)} mL`,
      );

      // Step D: Share this live value with the Sidepanel!
      // The sidepanel can listen to 'live_draft_impact' to update its UI instantly.
      await browser.storage.local.set({
        live_draft_impact: { water_mL: totalWater, energy_Wh: totalEnergy },
      });
    };

    // --- 3. DETECT FILE UPLOADS ---
    document.addEventListener(
      "change",
      (e) => {
        const target = e.target as HTMLInputElement;
        if (target.type === "file" && target.files) {
          Array.from(target.files).forEach((file) => {
            const impact = calculateFileImpact(file);
            pendingFiles.set(file.name, impact); // Add to state
            console.log(`📎 [FILE ADDED] Name: ${file.name}`);
          });
          updateLiveEstimate();
        }
      },
      true,
    );

    // --- 4. DETECT TYPING (Handles backspaces/deletes) ---
    // We use 'input' instead of 'keydown' because 'input' reliably catches pastes and backspaces
    document.addEventListener(
      "input",
      (e) => {
        const target = e.target as HTMLElement;
        if (
          target.id === "prompt-textarea" ||
          target.getAttribute("contenteditable") === "true"
        ) {
          currentText =
            target.innerText || (target as HTMLTextAreaElement).value || "";
          updateLiveEstimate();
        }
      },
      true,
    );

    // --- 5. DETECT FILE REMOVAL CLICKS ---
    // If the user clicks anywhere in the prompt area (like the 'X' on a file),
    // we wait a split second for the UI to update, then recalculate.
    document.addEventListener(
      "click",
      (e) => {
        const target = e.target as HTMLElement;
        if (target.closest("fieldset") || target.closest("form")) {
          setTimeout(updateLiveEstimate, 100);
        }
      },
      true,
    );

    // --- 6. COMMIT TO STORAGE ON SEND ---
    const commitPrompt = async () => {
      console.log("🚀 [PROMPT SENT] Committing to lifetime storage...");

      // 1. Calculate the draft water usage from the current prompt
      const textImpact = calculatePromptImpact(currentText.length);
      let promptWater = textImpact.water_mL;
      pendingFiles.forEach((impact) => {
        promptWater += impact.water_mL;
      });

      // 2. Fetch the CURRENT total from Sync storage
      const data = await browser.storage.sync.get("savedWaterUsage");
      const currentTotal: number = (data.savedWaterUsage as number) || 0; // Default to 0 if empty

      // 3. Add them together
      const newTotal = currentTotal + promptWater;

      // 4. Save back to Sync storage!
      // (This instantly triggers the listener in your React component)
      await browser.storage.sync.set({ savedWaterUsage: newTotal });

      console.log(`💧 Total Updated: ${newTotal.toFixed(2)} mL`);

      // 5. Clear local memory for the next prompt
      currentText = "";
      pendingFiles.clear();
    };

    // Trigger commit on "Enter"
    window.addEventListener(
      "keydown",
      (e) => {
        const target = e.target as HTMLElement;
        if (
          (target.id === "prompt-textarea" ||
            target.getAttribute("contenteditable") === "true") &&
          e.key === "Enter" &&
          !e.shiftKey
        ) {
          commitPrompt();
        }
      },
      true,
    );

    // Trigger commit on "Send Button" click
    document.addEventListener(
      "click",
      (e) => {
        const target = e.target as HTMLElement;
        if (
          target.closest('button[data-testid="send-button"]') ||
          target.closest('button[aria-label="Send prompt"]')
        ) {
          commitPrompt();
        }
      },
      true,
    );
  },
});
