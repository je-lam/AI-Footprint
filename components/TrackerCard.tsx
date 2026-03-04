import { useState } from "react";
import { Settings, ChevronDown } from "lucide-react";
import CircularProgress from "./CircularProgress";

const TrackerCard = () => {
  const [waterUsage, setWaterUsage] = useState<number | string>(2387);
  
  const SCU_POPULATION = 10903;
  const currentUsageML = typeof waterUsage === 'string' ? parseFloat(waterUsage) || 0 : waterUsage;
  const campusTotalLiters = (currentUsageML * SCU_POPULATION) / 1000;

  return (
    <div className="bg-white p-6 w-full min-h-screen">

      {/* header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[17px] font-semibold text-gray-900 flex items-center gap-2 whitespace-nowrap">
          Water used by ChatGPT this
          <button className="bg-gray-200 hover:bg-gray-200 px-3 py-1.5 rounded-[12px] text-[15px] font-semibold flex items-center gap-1 transition-colors">
            Month <ChevronDown className="w-4 h-4 text-gray-600" strokeWidth={3} color="#1a1a1a"/>
          </button>
        </h2>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* water used */}
      <div className="mb-4 flex items-baseline gap-2">
        <input
          type="number"
          value={waterUsage}
          onChange={(e) => setWaterUsage(e.target.value)}
          className="text-[64px] font-bold leading-none tracking-tight text-gray-900 bg-transparent outline-none w-[180px] border-b-2 border-dashed border-gray-200 hover:border-gray-400 focus:border-blue-500 transition-colors"
        />
        <span className="text-[40px] font-medium text-gray-900">
          mL
        </span>
      </div>

      <p className="text-[15px] text-gray-800 mb-6 font-medium">
        If everyone at SCU had the same AI usage as you, that's:
      </p>

      {/* progress bars */}
      {/* can easily swap items by changing emoji, label, waterPerItemL */}
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

    </div>
  );
};

export default TrackerCard;