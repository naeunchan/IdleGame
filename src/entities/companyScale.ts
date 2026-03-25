import type { ModifierProfile, ResourceCost, UnlockRequirement } from '@/entities/progression';
import type { RoleId } from '@/entities/job';

export type CompanyScaleId = 'garage' | 'small-studio' | 'product-team' | 'scale-up';

export interface CompanyScaleDefinition {
  id: CompanyScaleId;
  name: string;
  summary: string;
  unlockRequirement: UnlockRequirement;
  upgradeCost: ResourceCost;
  headcountCap: number;
  hireSlots: number;
  modifierProfile: ModifierProfile;
  unlockedRoles: RoleId[];
}
