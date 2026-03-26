import type { MilestoneId } from '@/entities/milestone';

export type CommunityPerkId = 'local-ambassadors' | 'quiet-library' | 'open-source-club';

export type CommunityPerkLevels = Partial<Record<CommunityPerkId, number>>;

export interface CommunityPerkDefinition {
  id: CommunityPerkId;
  name: string;
  summary: string;
  unlockMilestoneId?: MilestoneId;
  bonusLabel: string;
  bonusType: 'production' | 'focus' | 'contract';
  effectPerLevel: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
}

export interface CommunityPerkEffects {
  productionMultiplierBonus: number;
  focusRecoveryBonus: number;
  contractRewardMultiplierBonus: number;
}
