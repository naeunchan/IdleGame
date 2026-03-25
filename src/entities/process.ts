import type { ModifierProfile, UnlockRequirement } from '@/entities/progression';
import type { RoleId } from '@/entities/job';

export type ProcessMode = 'waterfall' | 'spiral' | 'agile';

export interface ProcessModeDefinition {
  id: ProcessMode;
  name: string;
  summary: string;
  bonusLabel: string;
  unlockRequirement: UnlockRequirement;
  modifierProfile: ModifierProfile;
  recommendedRoles: RoleId[];
}
