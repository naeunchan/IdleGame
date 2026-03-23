import type { BreedId } from '@/entities/dog';
import type { ModifierProfile, ResourceCost, UnlockRequirement } from '@/entities/progression';

export type RoleId = 'founder' | 'designer' | 'pm' | 'architect' | 'qa';

export interface RoleDefinition {
  id: RoleId;
  name: string;
  lane: string;
  summary: string;
  unlockRequirement: UnlockRequirement;
  hireCost: ResourceCost;
  modifierProfile: ModifierProfile;
  recommendedBreeds: BreedId[];
  unlockNotes: string;
}
