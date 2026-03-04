// entrypoints/chat-observer.content.ts
export default defineContentScript({
  matches: ["https://chatgpt.com/*"],
  main(ctx) {
    console.log("hello world from AI footprint chat listerne");

    // 1. Listen for Typing (Token Estimation)
    document.addEventListener("input", (e) => {
      const target = e.target as HTMLElement;
      if (
        target.id === "prompt-textarea" ||
        target.getAttribute("contenteditable") === "true"
      ) {
        const text =
          target.innerText || (target as HTMLTextAreaElement).value || "";
        const tokens = Math.ceil(text.length / 4);
        console.log(`Typing: ${text.length} chars (~${tokens} tokens)`);
      }
    });

    // 2. Listen for "Send" Action
    document.addEventListener("keydown", (e) => {
      const target = e.target as HTMLElement;
      if (target.id === "prompt-textarea" && e.key === "Enter" && !e.shiftKey) {
        console.log("Prompt Sent via Enter key!");
        // This is where you would "commit" the usage to your local storage
      }
    });

    // Also catch clicking the "Send" button
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      // ChatGPT's send button usually contains an SVG arrow, checking parent buttons
      if (
        target.closest('button[data-testid="send-button"]') ||
        target.closest("button.bg-black")
      ) {
        console.log("Prompt Sent via Click!");
      }
    });
  },
});
