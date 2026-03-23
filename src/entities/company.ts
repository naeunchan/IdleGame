import type { BreedId } from '@/entities/dog';
import type { ProcessMode } from '@/entities/process';

export interface Resources {
  code: number;
  focus: number;
  cash: number;
  reputation: number;
}

export interface FounderProfile {
  name: string;
  breedId: BreedId;
  role: 'founder';
  stage: 'puppy';
}

export interface GameState {
  companyName: string;
  founder: FounderProfile;
  resources: Resources;
  employeeCount: number;
  currentProcess: ProcessMode;
  lastUpdatedAt: number;
}

