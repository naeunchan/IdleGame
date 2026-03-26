import type { BreedId } from '@/entities/dog';
import type { RoleId } from '@/entities/job';
import type { ProcessMode } from '@/entities/process';
import type { CompanyStats, ContractState } from '@/entities/contract';
import type { WorkshopUpgradeLevels } from '@/entities/upgrade';

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

export interface EmployeeProfile {
  id: string;
  name: string;
  breedId: BreedId;
  role: Exclude<RoleId, 'founder'>;
  stage: 'adult';
  hiredAtProject: number;
}

export interface ProjectState {
  id: string;
  name: string;
  summary: string;
  requiredCode: number;
  progress: number;
  rewardCash: number;
  rewardReputation: number;
  cycle: number;
}

export interface TickInput {
  now: number;
  deltaMs: number;
  isOffline: boolean;
}

export interface SimulationSnapshot {
  codePerSecond: number;
  focusDeltaPerSecond: number;
  qualityScore: number;
  teamHarmony: number;
  rewardMultiplier: number;
}

export interface ProgressReport {
  elapsedMs: number;
  codeGained: number;
  cashGained: number;
  reputationGained: number;
  projectsCompleted: number;
}

export interface SaveSnapshotV1 {
  version: 1;
  savedAt: number;
  gameState: GameState;
}

export interface GameState {
  companyName: string;
  founder: FounderProfile;
  team: EmployeeProfile[];
  resources: Resources;
  stats: CompanyStats;
  contractBoard: ContractState[];
  nextContractSerial: number;
  workshopUpgrades?: WorkshopUpgradeLevels;
  employeeCount: number;
  currentProcess: ProcessMode;
  currentProject: ProjectState;
  completedProjects: number;
  officeLevel: number;
  lastUpdatedAt: number;
}
