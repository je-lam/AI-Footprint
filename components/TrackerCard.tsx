import { useState, useEffect } from "react";
import CircularProgress from "./CircularProgress";
import { browser } from "wxt/browser"; // Make sure to import this!

const TrackerCard = () => {
  const [waterUsage, setWaterUsage] = useState<number | string>(0);

  useEffect(() => {
    browser.storage.sync.get("savedWaterUsage").then((result) => {
      if (result.savedWaterUsage !== undefined) {
        setWaterUsage(Number(parseFloat(result.savedWaterUsage as string).toFixed(2)));
      } else {
        setWaterUsage(2387);
      }
    });

    const handleStorageChange = (changes: any, areaName: string) => {
      if (areaName === "sync" && changes.savedWaterUsage) {
        setWaterUsage(Number(parseFloat(changes.savedWaterUsage.newValue).toFixed(2)));
      }
    };
    browser.storage.onChanged.addListener(handleStorageChange);

    return () => {
      browser.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const handleWaterUsageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setWaterUsage(newValue);

    const parsed = parseFloat(newValue);
    if (!isNaN(parsed)) { 
      browser.storage.sync.set({ savedWaterUsage: parsed });
    }
  };

  const SCU_POPULATION = 10903;
  const currentUsageML =
    typeof waterUsage === "string" ? parseFloat(waterUsage) || 0 : waterUsage;
  const campusTotalLiters = (currentUsageML * SCU_POPULATION) / 1000;

  return (
    <div className="bg-white p-4 w-full h-full overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

      {/* header */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
          Water used by ChatGPT
        </h2>
      </div>

      {/* water used */}
      <div className="mb-4 flex items-baseline gap-2">
        <input
          type="number"
          value={waterUsage}
          onChange={handleWaterUsageChange}
          className="text-5xl font-bold leading-none tracking-tight text-gray-900 bg-transparent outline-none w-48 border-b-2 border-dashed border-gray-200 hover:border-gray-400 focus:border-blue-500 transition-colors"
        />
        <span className="text-3xl font-medium text-gray-900">
          mL
        </span>
      </div>

      <p className="text-[13px] text-gray-800 mb-6 font-medium break-words leading-relaxed">
        If everyone at SCU had the same AI usage as you, that's:
      </p>

      {/* progress bars */}
      <div className="flex flex-col gap-6">
        <CircularProgress
          emoji="🥤"
          label="Standard U.S. Soda Cans"
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
          label="Olympic Swimming Pools"
          totalLiters={campusTotalLiters}
          waterPerItemL={2500000}
          ringColorClass="text-[#4ade80]"
        />
      </div>
    </div>
  );
};

export default TrackerCard;
