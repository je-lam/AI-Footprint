import { calculateFileImpact, calculatePromptImpact } from "@/lib/calculator";
import { browser } from "wxt/browser";

export default defineContentScript({
  matches: ["https://chatgpt.com/*"],
  main(_) {
    console.log("hello world from AI footprint");

    let currentTextLength = 0;

    type PendingEntry = {
      fileName: string;
      impact: ReturnType<typeof calculateFileImpact>;
      addedAt: number;
      node?: Element | null;
      observer?: MutationObserver | null;
    };

    // store files by a deterministic key to avoid collisions and ref equality issues
    const pendingFiles = new Map<string, PendingEntry>();

    // stable key for files
    function fileKey(file: File) {
      return `${file.name}-${file.size}-${file.lastModified}`;
    }

    // attempt to find an attachment node that contains the filename
    // we keep the selector generic because we don't control ChatGPT's internal markup
    function findAttachmentNodeByName(fileName: string): Element | null {
      // search for visible nodes containing the file name
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>("*"),
      ).filter((el) => {
        const text = (el.textContent || "").trim();
        if (!text) return false;
        // exact match or contains (some UIs prepend icons or counters)
        return text === fileName || text.includes(fileName);
      });

      // prefer candidates that are likely attachment elements (not <html>, <body>, or huge containers)
      for (const el of candidates) {
        // skip elements that are obviously not attachment containers
        if (
          el.tagName.toLowerCase() === "html" ||
          el.tagName.toLowerCase() === "body"
        )
          continue;
        // ensure element is visible
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) continue;
        return el;
      }
      return null;
    }

    // Observe parent for the removal of `node`. When removed, we cleanup the pendingFiles entry.
    function observeNodeRemoval(key: string, node: Element) {
      const parent = node.parentElement;
      if (!parent) return null;

      const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const removed of Array.from(m.removedNodes)) {
            if (
              removed === node ||
              (removed instanceof Element && removed.contains(node))
            ) {
              // Node was removed from the DOM -> treat as explicit removal
              console.log(`🗑️ [FILE NODE REMOVED] ${key}`);
              cleanupFileEntry(key);
              return;
            }
          }
        }
      });

      observer.observe(parent, { childList: true, subtree: true });
      return observer;
    }

    // cleanup helper - remove entry and disconnect observer
    function cleanupFileEntry(key: string) {
      const entry = pendingFiles.get(key);
      if (!entry) return;
      if (entry.observer) {
        try {
          entry.observer.disconnect();
        } catch (err) {
          // ignore
        }
      }
      pendingFiles.delete(key);
      console.log(
        `🗑️ [FILE CLEANUP] Removed ${entry.fileName} (${key}) from draft.`,
      );
      // update estimate after the removal
      void updateLiveEstimate();
    }

    // After adding a file, the UI might asynchronously insert an attachment node.
    // Poll a few times for it, and if found attach an observer.
    async function pollForAttachmentNode(
      key: string,
      fileName: string,
      tries = 5,
      delay = 200,
    ) {
      for (let i = 0; i < tries; i++) {
        const entry = pendingFiles.get(key);
        if (!entry) return; // was removed in the meantime
        const node = findAttachmentNodeByName(fileName);
        if (node) {
          entry.node = node;
          entry.observer = observeNodeRemoval(key, node);
          // Found node — update estimate and stop polling
          console.log(`[FILE NODE FOUND] ${fileName} ->`, node);
          void updateLiveEstimate();
          return;
        }
        // wait a bit before next try
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, delay));
      }
      // If we never found the node, we'll rely on the grace window and DOM checks on click/update
      console.log(`[FILE NODE NOT FOUND] ${fileName} after polling`);
    }

    // update estimate anytime the user types, adds a file, or clicks a button
    const updateLiveEstimate = async () => {
      // // Determine whether any pending file entries should be considered deleted.
      // const now = Date.now();
      // for (const [key, entry] of Array.from(pendingFiles.entries())) {
      //   // If we already have a node observed, keep it until that node is removed by the observer.
      //   if (entry.node) continue;

      //   // If file was added very recently, give the UI time to render an attachment node.
      //   const age = now - entry.addedAt;
      //   const GRACE_MS = 1000; // 1 second grace to avoid race removal
      //   if (age < GRACE_MS) {
      //     // still within grace period -> keep it
      //     continue;
      //   }

      //   // After grace period, double-check DOM for the attachment node once more
      //   const node = findAttachmentNodeByName(entry.fileName);
      //   if (node) {
      //     entry.node = node;
      //     entry.observer = observeNodeRemoval(key, node);
      //     continue;
      //   }

      //   // No node found after grace period -> assume user removed it (or the UI didn't show it)
      //   console.log(`🗑️ [FILE ASSUMED DELETED] ${entry.fileName} (no DOM node)`);
      //   cleanupFileEntry(key);
      // }

      //  calculate prompt text impact and sum up results
      const textImpact = calculatePromptImpact(currentTextLength);
      let totalWater = textImpact.water_mL;
      let totalEnergy = textImpact.energy_Wh;

      pendingFiles.forEach((entry) => {
        totalWater += entry.impact.water_mL;
        totalEnergy += entry.impact.energy_Wh;
      });

      console.log(
        `ESTIMATE: Text: ${currentTextLength} | Files: ${pendingFiles.size} | Est. Water: ${totalWater.toFixed(
          3,
        )} mL`,
      );

      // share value with UI through storage (maybe there's a faster way to communicate this? idk)
      await browser.storage.local.set({
        live_draft_impact: totalWater,
      });
    };

    // detect file uploads
    document.addEventListener(
      "change",
      (e) => {
        const target = e.target as HTMLInputElement;
        if (target.type === "file" && target.files) {
          Array.from(target.files).forEach((file) => {
            // basic safety checks
            if (!file || file.size === 0) {
              console.log(
                `[FILE IGNORED] zero-size or invalid file: ${file?.name}`,
              );
              return;
            }

            const key = fileKey(file);
            if (pendingFiles.has(key)) {
              console.log(`[FILE SKIPPED] Already tracking ${file.name}`);
              return;
            }

            const impact = calculateFileImpact(file);
            pendingFiles.set(key, {
              fileName: file.name,
              impact,
              addedAt: Date.now(),
              node: null,
              observer: null,
            });

            console.log(`[FILE ADDED] Name: ${file.name} (${key})`);
            // Start polling to find the DOM node representing this attachment (ChatGPT UI adds it asynchronously)
            void pollForAttachmentNode(key, file.name);
          });
          void updateLiveEstimate();
        }
      },
      true,
    );

    // stalk user and read every button they type to track prompt
    document.addEventListener(
      "input",
      (e) => {
        const target = e.target as HTMLElement;
        if (
          target.id === "prompt-textarea" ||
          target.getAttribute("contenteditable") === "true"
        ) {
          const text =
            (target as any).innerText ??
            (target as HTMLTextAreaElement).value ??
            "";
          currentTextLength = text.length || 0;
          void updateLiveEstimate();
        }
      },
      true,
    );

    // nevermind this was obviously too naive to work
    // detect interactions near the prompt area - recalc after a short delay (clicks may remove attachments)
    document.addEventListener(
      "click",
      (e) => {
        const target = e.target as HTMLElement;
        if (target.closest("fieldset") || target.closest("form")) {
          // Give the UI a moment to update then recalc
          setTimeout(() => {
            void updateLiveEstimate();
          }, 150);
        }
      },
      true,
    );

    // save data to browser's storage
    const commitPrompt = async () => {
      console.log("🚀 [PROMPT SENT] Committing to lifetime storage...");

      // 1. Calculate the draft water usage from the current prompt
      const textImpact = calculatePromptImpact(currentTextLength);
      let promptWater = textImpact.water_mL;
      pendingFiles.forEach((entry) => {
        promptWater += entry.impact.water_mL;
      });

      // If there's no measurable impact, don't commit (prevents empty commits)
      if (!promptWater || promptWater <= 0) {
        console.log("No impact to commit (zero water). Skipping.");
        // still clear local draft trackers to avoid stale UI state
        currentTextLength = 0;
        // disconnect any observers
        pendingFiles.forEach((entry) => {
          if (entry.observer) {
            try {
              entry.observer.disconnect();
            } catch (err) {
              // ignore
            }
          }
        });
        pendingFiles.clear();
        return;
      }

      // fetch and sum with current total in storage
      const data = await browser.storage.sync.get("savedWaterUsage");
      const currentTotal: number = (data.savedWaterUsage as number) || 0; // Default to 0 if empty
      const newTotal = currentTotal + promptWater;

      // save back to sync storage (triggers listener in UI code)
      await browser.storage.sync.set({ savedWaterUsage: newTotal });

      console.log(`Total AI Water Usage Updated: ${newTotal.toFixed(2)} mL`);

      // clear local memory for the next prompt and disconnect observers
      currentTextLength = 0;
      pendingFiles.forEach((entry) => {
        if (entry.observer) {
          try {
            entry.observer.disconnect();
          } catch (err) {
            // ignore
          }
        }
      });
      pendingFiles.clear();
      // update live estimate (should be zero)
      void updateLiveEstimate();
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
          void commitPrompt();
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
          void commitPrompt();
        }
      },
      true,
    );
  },
});
