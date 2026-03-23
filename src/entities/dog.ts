import type { RoleId } from '@/entities/job';
import type { ModifierProfile } from '@/entities/progression';

export type BreedId = 'border-collie' | 'shiba' | 'golden-retriever' | 'corgi';

export type BreedAffinity = 'productivity' | 'focus' | 'team' | 'quality';

export interface BreedRoleMatch {
  roleId: RoleId;
  weight: number;
  note: string;
}

export interface BreedDefinition {
  id: BreedId;
  name: string;
  title: string;
  specialty: string;
  specialtyRoleId: RoleId;
  affinity: BreedAffinity;
  passive: string;
  progressionHint: string;
  roleMatches: BreedRoleMatch[];
  modifierProfile: ModifierProfile;
  focusBonus: number;
  productivityBonus: number;
  teamBuffBonus: number;
  qualityBonus: number;
}
