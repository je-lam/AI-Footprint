import { useState, useEffect } from "react";
import { Settings, ChevronDown } from "lucide-react";
import CircularProgress from "./CircularProgress";
import { browser } from "wxt/browser"; // Make sure to import this!

const TrackerCard = () => {
  const [waterUsage, setWaterUsage] = useState(0);
  const [liveUsage, setLiveDraftUsage] = useState(0);

  useEffect(() => {
    browser.storage.sync.get("savedWaterUsage").then((result) => {
      if (result.savedWaterUsage !== undefined) {
        setWaterUsage(Number(result.savedWaterUsage));
      } else {
        setWaterUsage(2387);
      }
    });

    browser.storage.local.get("live_draft_impact").then((result: any) => {
      if (
        result.live_draft_impact !== undefined &&
        result.live_draft_impact !== null
      ) {
        console.log("UPDAED LIVE USAGE FOR UI");
        setLiveDraftUsage(Number(result.live_draft_impact.water_mL));
      } else {
        setLiveDraftUsage(0);
      }
    });

    const handleStorageChange = (changes: any, areaName: string) => {
      if (areaName === "sync" && changes.savedWaterUsage) {
        setWaterUsage(Number(changes.savedWaterUsage.newValue));
      } else if (areaName === "local" && changes.live_draft_impact) {
        setLiveDraftUsage(Number(changes.live_draft_impact.newValue.water_mL));
      }
    };
    browser.storage.onChanged.addListener(handleStorageChange);

    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const handleWaterUsageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const parsed = parseFloat(newValue);

    if (!isNaN(parsed)) {
      setWaterUsage(parsed);
      browser.storage.sync.set({ savedWaterUsage: parsed });
    }
  };

  const SCU_POPULATION = 10903;
  const currentUsageML =
    typeof waterUsage === "string" ? parseFloat(waterUsage) || 0 : waterUsage;
  const campusTotalLiters = (currentUsageML * SCU_POPULATION) / 1000;

  return (
    <div className="bg-white p-4 w-full h-full overflow-y-auto overflow-x-hidden flex flex-col box-border [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* header */}
      <div className="mb-4 shrink-0">
        <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
          Water used by ChatGPT
        </h2>
      </div>

      {/* water used */}
      <div className="mb-4 flex items-baseline gap-2 shrink-0">
        <input
          type="number"
          value={waterUsage.toFixed(3)}
          onChange={handleWaterUsageChange}
          className="text-5xl font-bold leading-none tracking-tight text-gray-900 bg-transparent outline-none w-48 border-b-2 border-dashed border-gray-200 hover:border-gray-400 focus:border-blue-500 transition-colors"
        />
        <span className="text-3xl font-medium text-gray-900">mL</span>
      </div>

      <p className="text-[13px] text-gray-800 mb-6 font-medium wrap-break-word leading-relaxed shrink-0">
        If everyone at SCU had the same AI usage as you, that's:
      </p>

      {/* progress bars */}
      <div className="flex flex-col gap-6 shrink-0">
        <CircularProgress
          emoji="🥤"
          label="Standard U.S. Soda Cans"
          totalLiters={campusTotalLiters}
          waterPerItemL={0.355}
          ringColorClass="text-[#ff5c77]"
        />
        <CircularProgress
          emoji="🏊"
          label="Olympic Swimming Pools"
          totalLiters={campusTotalLiters}
          waterPerItemL={2500000}
          ringColorClass="text-[#4ade80]"
        />
      </div>

      {/* current prompt estimate */}
      {liveUsage > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="bg-red-50 border-l-4 border-red-600 p-3 rounded-md shadow-sm w-full mt-6 box-border shrink-0 max-w-full overflow-hidden"
        >
          <div className="flex items-start gap-3 min-w-0">
            <h1 className="font-bold text-black shrink-0">!</h1>
            <div className="min-w-0 flex-1 overflow-hidden">
              <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide truncate">
                CURRENT PROMPT ESTIMATE
              </h3>
              <p className="mt-1 text-sm text-red-600">
                Estimated:{" "}
                <span className="font-mono font-semibold">
                  {liveUsage.toFixed(2)} mL
                </span>
              </p>
              <p className="mt-1 text-xs text-gray-500 break-words leading-tight whitespace-normal">
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
