/**
 * 2026 Environmental Impact Coefficients
 * Based on median values from AI industry sustainability reports.
 */

export const COEFFICIENTS = {
  // Base energy per prompt (infrastructure + routing)
  BASE_ENERGY_WH: 0.24,
  
  // Variable energy per 1000 tokens
  ENERGY_PER_1K_TOKENS_WH: 0.12,
  
  // Water multipliers (total lifecycle cooling)
  WATER_ML_PER_WH: 12.5, // ~3.0mL total for a 0.24Wh prompt
  
  // Carbon multipliers
  CARBON_G_PER_WH: 0.67, // Global average grid intensity
};

export interface ImpactResult {
  energyWh: number;
  waterMl: number;
  carbonG: number;
}

/**
 * Calculates the environmental impact based on token count.
 * @param tokens Estimated or actual token count
 */
export function calculateImpact(tokens: number): ImpactResult {
  const energyWh = COEFFICIENTS.BASE_ENERGY_WH + (tokens / 1000) * COEFFICIENTS.ENERGY_PER_1K_TOKENS_WH;
  
  return {
    energyWh,
    waterMl: energyWh * COEFFICIENTS.WATER_ML_PER_WH,
    carbonG: energyWh * COEFFICIENTS.CARBON_G_PER_WH,
  };
}

/**
 * Relatable analogies for the dashboard
 */
export const ANALOGIES = {
  getBurgers: (waterMl: number) => (waterMl / 2400).toFixed(2), // 2400L per burger (global avg)
  getSmartphoneCharges: (energyWh: number) => (energyWh / 12).toFixed(1), // ~12Wh per charge
  getTeslaMiles: (carbonG: number) => (carbonG / 160).toFixed(2), // ~160g per mile
};
