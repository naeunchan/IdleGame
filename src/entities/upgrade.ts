export type WorkshopUpgradeId = 'warm-desk' | 'snack-cart' | 'showcase-wall';

export type WorkshopUpgradeLevels = Partial<Record<WorkshopUpgradeId, number>>;

export interface WorkshopUpgradeDefinition {
  id: WorkshopUpgradeId;
  name: string;
  summary: string;
  bonusLabel: string;
  bonusType: 'production' | 'focus' | 'reward';
  effectPerLevel: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
}

export interface WorkshopUpgradeEffects {
  productionMultiplierBonus: number;
  focusRecoveryBonus: number;
  rewardMultiplierBonus: number;
}
