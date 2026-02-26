import React, { useEffect, useState } from "react";
import { statsStorage, Totals } from "@/utils/storage";

const WeeklyImpactInline = () => {
  const [stats, setStats] = useState<Totals>({
    energyWh: 0,
    waterMl: 0,
    carbonG: 0,
    promptsCount: 0,
  });

  useEffect(() => {
    // 1. Get initial value from storage
    const loadStats = async () => {
      const current = await statsStorage.getValue();
      setStats(current);
    };
    loadStats();

    // 2. Subscribe to updates in storage (from any tab/background)
    const unwatch = statsStorage.watch((newVal) => {
      if (newVal) setStats(newVal);
    });

    return () => unwatch();
  }, []);

  // Format the outputs for readability
  const formattedEnergy = stats.energyWh >= 1000 
    ? `${(stats.energyWh / 1000).toFixed(2)} kWh`
    : `${stats.energyWh.toFixed(2)} Wh`;

  const formattedWater = stats.waterMl >= 1000
    ? `${(stats.waterMl / 1000).toFixed(2)} L`
    : `${stats.waterMl.toFixed(1)} mL`;

  // Analogy: 2400 Liters per beef burger (approx)
  // Converting mL to L then to burgers
  const burgers = (stats.waterMl / 1000 / 2400).toFixed(4);

  return (
    <div
      className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-[#212121] text-gray-400 text-[11px] border border-white/5 hover:border-white/10 hover:text-gray-300 cursor-default transition-all select-none w-fit my-2 shadow-sm font-sans"
      style={{
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <span className="text-emerald-500 opacity-80">🍃</span>
      <span className="font-medium tracking-tight uppercase text-[9px] opacity-70">
        Total Impact Tracking:
      </span>
      <span className="text-gray-200">{formattedEnergy}</span>
      <span className="text-gray-600">|</span>
      <span className="text-gray-200">{formattedWater}</span>
      <span className="text-gray-500 ml-0.5">(≈ {burgers} burgers 🍔)</span>
    </div>
  );
};

export default WeeklyImpactInline;
