type Impact = {
  tokens: number;
  water_mL: number;
  energy_Wh: number;
};

// Industry average accounting for both data center cooling and power plant consumption
const WATER_INTENSITY_L_PER_KWH = 2.85;
const WATER_FACTOR = WATER_INTENSITY_L_PER_KWH; // Translates directly to mL per Wh

// Calculates water based on energy
// This includes direct water usage (used to cool AI data centers)
// AND indirect water usage (used for electricity generation)
function getWaterFromEnergy(energyWh: number): number {
  return parseFloat((energyWh * WATER_FACTOR).toFixed(2));
}

// Takes in the length of the prompt string
export function calculatePromptImpact(textLength: number): Impact {
  // If there's no text, return zero impact instead of the baseline energy cost.
  if (!textLength || textLength <= 0) {
    return {
      tokens: 0,
      energy_Wh: 0,
      water_mL: 0,
    };
  }

  const tokens = Math.ceil(textLength / 4);
  
  // ADJUSTED MATH: 
  // Lowered the "connection" base cost to 0.05 Wh
  // This makes the numbers actually climb as the user types a sentence.
  const energy = 0.05 + (tokens / 100) * 0.1;

  return {
    tokens,
    energy_Wh: energy,
    water_mL: getWaterFromEnergy(energy),
  };
}

// Reports water/energy impact based on file size and type
export function calculateFileImpact(file: File): Impact {
  const sizeMB = file.size / (1024 * 1024);
  let estimatedTokens = 0;
  let energyWh = 0;

  if (file.type.startsWith("image/")) {
    // Vision models: Fixed cost for high-intensity GPU inference
    estimatedTokens = 1000;
    energyWh = 4.3;
  } else if (file.type === "application/pdf" || file.type.includes("text")) {
    // Document logic: Base extraction cost + variable size cost
    estimatedTokens = Math.floor(sizeMB * 750000);
    energyWh = 1.5 + sizeMB * 0.5;
  } else {
    // Generic files
    estimatedTokens = Math.floor(sizeMB * 500000);
    energyWh = 1.0 + sizeMB * 0.3;
  }

  return {
    tokens: estimatedTokens,
    energy_Wh: energyWh,
    water_mL: getWaterFromEnergy(energyWh),
  };
}
