export type BreedId = 'border-collie' | 'shiba' | 'golden-retriever' | 'corgi';

export interface BreedDefinition {
  id: BreedId;
  name: string;
  title: string;
  specialty: string;
  passive: string;
  focusBonus: number;
  productivityBonus: number;
  teamBuffBonus: number;
  qualityBonus: number;
}

