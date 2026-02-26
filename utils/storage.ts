import { storage } from "@wxt-dev/storage";
import { ImpactResult } from "./calculator";

export interface Totals {
  energyWh: number;
  waterMl: number;
  carbonG: number;
  promptsCount: number;
}

// Key for storage: 'local:stats'
export const statsStorage = storage.defineItem<Totals>("local:stats", {
  defaultValue: {
    energyWh: 0,
    waterMl: 0,
    carbonG: 0,
    promptsCount: 0,
  },
});

/**
 * Updates the global statistics in storage
 */
export async function recordImpact(impact: ImpactResult) {
  const current = await statsStorage.getValue();
  
  await statsStorage.setValue({
    energyWh: current.energyWh + impact.energyWh,
    waterMl: current.waterMl + impact.waterMl,
    carbonG: current.carbonG + impact.carbonG,
    promptsCount: current.promptsCount + 1,
  });
  
  console.log("[AI-Footprint] Impact recorded and storage updated");
}
