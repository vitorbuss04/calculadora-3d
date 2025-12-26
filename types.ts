
export interface MaterialConfig {
  spoolPrice: number;
  spoolWeight: number; // in grams
  filamentDiameter: number; // 1.75 or 2.85
  density: number; // e.g., 1.24 for PLA
}

export interface MachineConfig {
  powerConsumption: number; // Watts
  electricityCost: number; // Cost per kWh
  machinePrice: number;
  lifespanHours: number; // Estimated hours before replacement/major overhaul
}

export interface PrintJob {
  filamentUsedGrams: number;  // Changed from meters to grams
  printTimeHours: number;
  printTimeMinutes: number;
  activeLaborHours: number;   
  activeLaborMinutes: number; 
  failRate: number; // Percentage
  laborHourlyRate: number;
  platformFeePercent: number;
  desiredProfitPercent: number;
}

export interface CalculationResult {
  filamentCost: number;
  energyCost: number;
  depreciationCost: number;
  laborCost: number;
  failRateCost: number;
  totalCost: number;
  recommendedPrice: number;
  profitAmount: number;
  platformFeeAmount: number;
}
