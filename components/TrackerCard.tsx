import { Settings, ChevronDown } from "lucide-react";

const CircularProgress = ({
  emoji,
  value,
  label,
  percentage,
  ringColorClass
}: {
  emoji: string;
  value: string;
  label: string;
  percentage: number;
  ringColorClass: string;
}) => {
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[76px] h-[76px] mb-3">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            className="text-gray-200"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={ringColorClass}
            strokeDasharray={strokeDasharray}
            strokeWidth="3.5"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-3xl">
          {emoji}
        </div>
      </div>
      <div className="text-[15px] font-semibold text-gray-900 leading-tight">{value}</div>
      <div className="text-[13px] text-gray-800 font-medium">{label}</div>
    </div>
  );
};

const TrackerCard = () => {
  return (
    <div className="bg-white p-6 w-full h-full">

      {/* header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[17px] font-semibold text-gray-900 flex items-center gap-2 whitespace-nowrap">
          Water used by ChatGPT this
          <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-[12px] text-[15px] font-semibold flex items-center gap-1 transition-colors">
            Month <ChevronDown className="w-4 h-4 text-gray-600" strokeWidth={3} />
          </button>
        </h2>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* water used */}
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-[64px] font-bold leading-none tracking-tight text-gray-900">
          2387
        </span>
        <span className="text-[40px] font-medium text-gray-900">
          mL
        </span>
      </div>

      <p className="text-[15px] text-gray-800 mb-6 font-medium">
        If everyone at SCU had the same AI usage as you, that's:
      </p>

      {/* progress bars */}
      <div className="flex justify-between px-2">
        <CircularProgress
          emoji="🍔"
          value="10,808"
          label="Burgers"
          percentage={70}
          ringColorClass="text-[#ff5c77]"
        />
        <CircularProgress
          emoji="🛁"
          value="172,930"
          label="Bathtubs"
          percentage={40}
          ringColorClass="text-[#5c85ff]"
        />
        <CircularProgress
          emoji="👖"
          value="6,860"
          label="Jeans"
          percentage={55}
          ringColorClass="text-[#4ade80]"
        />
      </div>

    </div>
  );
};

export default TrackerCard;