export interface ResourceCost {
  cash: number;
  code: number;
  reputation: number;
}

export interface UnlockRequirement {
  companyStage: number;
  releases: number;
  reputation: number;
  employeeCount: number;
}

export interface ModifierProfile {
  productivityMultiplier: number;
  focusMultiplier: number;
  teamMultiplier: number;
  qualityMultiplier: number;
  stabilityMultiplier: number;
}

