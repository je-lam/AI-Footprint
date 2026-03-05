import { useState, useEffect } from "react";
import { Settings, ChevronDown } from "lucide-react";
import CircularProgress from "./CircularProgress";
import { browser } from "wxt/browser";

const TrackerCard = () => {
  const [waterUsage, setWaterUsage] = useState(0);
  const [liveUsage, setLiveDraftUsage] = useState(0);

  useEffect(() => {
    browser.storage.sync.get("savedWaterUsage").then((result) => {
      if (result.savedWaterUsage !== undefined) {
        setWaterUsage(result.savedWaterUsage as number);
      } else {
        setWaterUsage(0); // Start at 0 please
      }
    });
    browser.storage.sync.get("live_draft_impact").then((result) => {
      if (result.live_draft_impact !== undefined) {
        setLiveDraftUsage(result.live_draft_impact as number);
      } else {
        setLiveDraftUsage(0); // Start at 0 please
      }
    });

    // listen for updates from the chat observer
    const handleStorageChange = (changes: any, areaName: string) => {
      if (areaName === "sync" && changes.savedWaterUsage) {
        setWaterUsage(changes.savedWaterUsage.newValue);
      } else if (areaName === "local" && changes.live_draft_impact) {
        setLiveDraftUsage(changes.live_draft_impact.newValue);
      }
    };
    browser.storage.onChanged.addListener(handleStorageChange);

    // Cleanup the listener if the component closes
    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const handleWaterUsageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setWaterUsage(parseFloat(newValue));
    browser.storage.sync.set({ savedWaterUsage: Number(newValue) });
  };

  const SCU_POPULATION = 10903;
  const currentUsageML =
    typeof waterUsage === "string" ? parseFloat(waterUsage) || 0 : waterUsage;
  const campusTotalLiters = (currentUsageML * SCU_POPULATION) / 1000;

  return (
    <div className="bg-white p-6 w-full min-h-screen">
      {/* header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[30px] font-semibold text-gray-900 flex items-center gap-2 whitespace-nowrap">
          Water used by ChatGPT
        </h2>
      </div>

      {/* water used */}
      <div className="mb-4 flex items-baseline gap-2">
        <input
          type="number"
          value={waterUsage.toFixed(3)}
          onChange={handleWaterUsageChange}
          className="text-[64px] font-bold leading-none tracking-tight text-gray-900 bg-transparent outline-none w-45 border-b-2 border-dashed border-gray-200 hover:border-gray-400 focus:border-blue-500 transition-colors"
        />
        <span className="text-[40px] font-medium text-gray-900">mL</span>
      </div>

      <p className="text-[15px] text-gray-800 mb-6 font-medium">
        If everyone at SCU had the same AI usage as you, that's:
      </p>

      {/* progress bars */}
      <div className="flex justify-between px-2">
        <CircularProgress
          emoji="🥤"
          label="Standard U.S. soda cans"
          totalLiters={campusTotalLiters}
          waterPerItemL={0.355}
          ringColorClass="text-[#ff5c77]"
        />
        <CircularProgress
          emoji="🛁"
          label="Bathtubs"
          totalLiters={campusTotalLiters}
          waterPerItemL={189.3}
          ringColorClass="text-[#5c85ff]"
        />
        <CircularProgress
          emoji="🏊"
          label="Olympic swimming pools"
          totalLiters={campusTotalLiters}
          waterPerItemL={2500000}
          ringColorClass="text-[#4ade80]"
        />
      </div>

      {/* current prompt estimate */}
      {liveUsage > 0.5 && (
        <div
          role="status"
          aria-live="polite"
          className="bg-red-50 border-l-4 border-red-600 p-3 rounded-md shadow-sm"
        >
          <div className="flex items-start gap-3">
            <h1 className="font-bold text-black">!</h1>
            {/*<svg
              className="h-5 w-5 text-red-600 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.68-1.36 3.445 0l6.518 11.59c.75 1.334-.213 2.98-1.722 2.98H3.461c-1.51 0-2.472-1.646-1.722-2.98L8.257 3.1zM9 7a1 1 0 10-2 0v4a1 1 0 102 0V7zm0 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                clipRule="evenodd"
              />
            </svg>*/}
            <div>
              <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide">
                Current prompt estimate
              </h3>
              <p className="mt-1 text-sm text-red-600">
                Estimated:{" "}
                <span className="font-mono font-semibold">
                  {liveUsage.toFixed(2)} mL
                </span>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Consider shortening your prompt or removing attachments to lower
                usage.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackerCard;
