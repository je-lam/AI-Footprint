import { calculateFileImpact, calculatePromptImpact } from "@/lib/calculator";
import { browser } from "wxt/browser";

export default defineContentScript({
  matches: ["https://chatgpt.com/*"],
  main(ctx) {
    console.log("🌱 Eco-Tracker: Hooked into ChatGPT System");

    // --- 1. LOCAL STATE MANAGEMENT ---
    let pendingFiles = new Map<
      string,
      ReturnType<typeof calculateFileImpact>
    >();

    // NEW: Helper to grab the absolute latest text directly from the DOM
    const getLatestPromptTextLength = (): number => {
      const editor =
        document.querySelector("#prompt-textarea") ||
        document.querySelector('div[contenteditable="true"]');
      return (editor ? (editor as HTMLElement).innerText : "").length;
    };

    // --- 2. LIVE ESTIMATION ENGINE ---
    const updateLiveEstimate = async () => {
      // Fetch fresh text straight from the source
      const currentText = getLatestPromptTextLength();
      const promptArea = document.querySelector("form") || document.body;
      const promptContext = promptArea.innerText || "";

      // VERY faulty assumptions made here
      // // Step A: Check for deleted files.
      // for (const [fileName, impact] of pendingFiles.entries()) {
      //   if (
      //     !promptContext.includes(fileName) &&
      //     !fileName.startsWith("image")
      //   ) {
      //     pendingFiles.delete(fileName);
      //     console.log(`🗑️ [FILE DELETED] Removed ${fileName} from draft.`);
      //   }
      // }

      // Step B: Calculate Text Impact using the fresh text
      const textImpact = calculatePromptImpact(currentText);

      // Step C: Sum everything up
      let totalWater = textImpact.water_mL;
      let totalEnergy = textImpact.energy_Wh;

      pendingFiles.forEach((impact) => {
        totalWater += impact.water_mL;
        totalEnergy += impact.energy_Wh;
      });

      console.log(
        `📊 [LIVE DRAFT] Text: ${currentText} | Files: ${pendingFiles.size} | Est. Water: ${totalWater.toFixed(3)} mL`,
      );

      // Step D: Share this live value with the Sidepanel!
      await browser.storage.local.set({
        live_draft_impact: { water_mL: totalWater, energy_Wh: totalEnergy },
      });
    };

    // --- 3. DETECT FILE UPLOADS (Click Picker) ---
    document.addEventListener(
      "change",
      (e) => {
        const target = e.target as HTMLInputElement;
        if (target.type === "file" && target.files) {
          Array.from(target.files).forEach((file) => {
            const impact = calculateFileImpact(file);
            pendingFiles.set(file.name, impact);
            console.log(`📎 [FILE ADDED] Name: ${file.name}`);
          });
          // FIX: Wait 500ms for ChatGPT's UI to render the file pill.
          // Otherwise, the aggressive cleanup logic instantly deletes it!
          setTimeout(updateLiveEstimate, 500);
        }
      },
      true,
    );

    // NEW: DETECT DRAG AND DROP FILES ---
    document.addEventListener(
      "drop",
      (e) => {
        // Only trigger if files were actually dropped into the window
        if (
          e.dataTransfer &&
          e.dataTransfer.files &&
          e.dataTransfer.files.length > 0
        ) {
          Array.from(e.dataTransfer.files).forEach((file) => {
            const impact = calculateFileImpact(file);
            pendingFiles.set(file.name, impact);
            console.log(`📎 [FILE DROPPED] Name: ${file.name}`);
          });
          // Give the UI time to process the drop
          setTimeout(updateLiveEstimate, 500);
        }
      },
      true,
    );

    // --- 4. DETECT TYPING AND PASTING ---
    document.addEventListener(
      "input",
      () => setTimeout(updateLiveEstimate, 50),
      true,
    );
    document.addEventListener(
      "paste",
      () => setTimeout(updateLiveEstimate, 50),
      true,
    );

    // --- 5. DETECT FILE REMOVAL CLICKS ---
    document.addEventListener(
      "click",
      (e) => {
        const target = e.target as HTMLElement;
        // If they click anywhere near the prompt box (like an X on a file), recalculate
        if (target.closest("fieldset") || target.closest("form")) {
          // Wait slightly longer (200ms) for the file pill to completely vanish from the DOM
          setTimeout(updateLiveEstimate, 200);
        }
      },
      true,
    );

    // --- 6. COMMIT TO STORAGE ON SEND ---
    const commitPrompt = async () => {
      // 1. Grab the text right before ChatGPT clears it!
      const finalPromptText = getLatestPromptTextLength();

      // Prevent blank submissions from adding footprint
      if (finalPromptText === 0 && pendingFiles.size === 0) return;

      console.log(`🚀 [PROMPT SENT] Length: ${finalPromptText}. Committing...`);

      const textImpact = calculatePromptImpact(finalPromptText);
      let promptWater = textImpact.water_mL;
      pendingFiles.forEach((impact) => {
        promptWater += impact.water_mL;
      });

      const data = await browser.storage.sync.get("savedWaterUsage");
      const currentTotal: number = Number(data.savedWaterUsage) || 0;
      const newTotal = currentTotal + promptWater;

      await browser.storage.sync.set({ savedWaterUsage: newTotal });
      console.log(`💧 Total Updated: ${newTotal.toFixed(2)} mL`);

      // 5. Clear local memory and zero out the live sidepanel
      pendingFiles.clear();
      await browser.storage.local.set({
        live_draft_impact: { water_mL: 0, energy_Wh: 0 },
      });
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
      true, // Capture phase ensures we grab the text before React processes the Enter key
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
