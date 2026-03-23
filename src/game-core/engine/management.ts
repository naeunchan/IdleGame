import { breedDefinitions } from '@/content/breeds/definitions';
import { companyScaleDefinitions } from '@/content/companyScales/definitions';
import { roleDefinitions } from '@/content/jobs/definitions';
import { processModeDefinitions } from '@/content/processModes/definitions';
import type { CompanyScaleDefinition } from '@/entities/companyScale';
import type { GameState, TeamMember } from '@/entities/company';
import type { BreedDefinition, BreedId } from '@/entities/dog';
import type { RoleDefinition, RoleId } from '@/entities/job';
import type { ProcessMode } from '@/entities/process';
import type { ResourceCost, UnlockRequirement } from '@/entities/progression';

const recruitNames: Record<Exclude<RoleId, 'founder'>, string> = {
  designer: '모카',
  pm: '토리',
  architect: '코드',
  qa: '젤리',
};

function currentCompanyStage(state: GameState) {
  return companyScaleDefinitions.findIndex((scale) => scale.id === state.companyScaleId) + 1;
}

function canAfford(state: GameState, cost: ResourceCost) {
  return (
    state.resources.cash >= cost.cash &&
    state.resources.code >= cost.code &&
    state.resources.reputation >= cost.reputation
  );
}

function spendResources(state: GameState, cost: ResourceCost) {
  return {
    ...state.resources,
    cash: state.resources.cash - cost.cash,
    code: state.resources.code - cost.code,
    reputation: state.resources.reputation - cost.reputation,
  };
}

function getRoleDefinition(roleId: RoleId): RoleDefinition {
  return roleDefinitions.find((role) => role.id === roleId) ?? roleDefinitions[0];
}

function pickBreedForRole(role: RoleDefinition): BreedDefinition {
  const ranked = breedDefinitions
    .map((breed) => ({
      breed,
      weight: breed.roleMatches.find((match) => match.roleId === role.id)?.weight ?? 0,
    }))
    .sort((left, right) => right.weight - left.weight);

  return ranked[0]?.breed ?? breedDefinitions[0];
}

function meetsRequirement(
  state: GameState,
  requirement: UnlockRequirement,
  options?: {
    nextEmployeeCount?: number;
    ignoreCompanyStage?: boolean;
    ignoreEmployeeCount?: boolean;
  },
) {
  const employeeCount = options?.nextEmployeeCount ?? state.employeeCount;

  return (
    (options?.ignoreCompanyStage || currentCompanyStage(state) >= requirement.companyStage) &&
    state.stats.releases >= requirement.releases &&
    state.resources.reputation >= requirement.reputation &&
    (options?.ignoreEmployeeCount || employeeCount >= requirement.employeeCount)
  );
}

export function getCurrentCompanyScale(state: GameState): CompanyScaleDefinition {
  return companyScaleDefinitions.find((scale) => scale.id === state.companyScaleId) ?? companyScaleDefinitions[0];
}

export function getNextCompanyScale(state: GameState) {
  const currentIndex = companyScaleDefinitions.findIndex((scale) => scale.id === state.companyScaleId);
  return companyScaleDefinitions[currentIndex + 1] ?? null;
}

export function canUpgradeCompanyScale(state: GameState) {
  const nextScale = getNextCompanyScale(state);

  if (!nextScale) {
    return false;
  }

  return (
    canAfford(state, nextScale.upgradeCost) &&
    meetsRequirement(state, nextScale.unlockRequirement, {
      ignoreCompanyStage: true,
      ignoreEmployeeCount: true,
    })
  );
}

export function upgradeCompanyScale(state: GameState, now: number): GameState {
  const nextScale = getNextCompanyScale(state);

  if (!nextScale || !canUpgradeCompanyScale(state)) {
    return state;
  }

  return {
    ...state,
    companyScaleId: nextScale.id,
    resources: spendResources(state, nextScale.upgradeCost),
    lastUpdatedAt: now,
  };
}

export function canHireRole(state: GameState, roleId: Exclude<RoleId, 'founder'>) {
  const role = getRoleDefinition(roleId);
  const scale = getCurrentCompanyScale(state);
  const alreadyHired = state.teamMembers.some((member) => member.roleId === roleId);
  const nextEmployeeCount = state.employeeCount + 1;
  const hireSlotsUsed = state.teamMembers.length;

  return (
    !alreadyHired &&
    scale.unlockedRoles.includes(roleId) &&
    hireSlotsUsed < scale.hireSlots &&
    canAfford(state, role.hireCost) &&
    meetsRequirement(state, role.unlockRequirement, {
      nextEmployeeCount,
    })
  );
}

export function hireRole(state: GameState, roleId: Exclude<RoleId, 'founder'>, now: number): GameState {
  if (!canHireRole(state, roleId)) {
    return state;
  }

  const role = getRoleDefinition(roleId);
  const breed = pickBreedForRole(role);

  const member: TeamMember = {
    id: `${roleId}-${now}`,
    name: recruitNames[roleId],
    breedId: breed.id,
    roleId,
    stage: 'adult',
    hiredAt: now,
  };

  return {
    ...state,
    teamMembers: [...state.teamMembers, member],
    employeeCount: state.employeeCount + 1,
    resources: spendResources(state, role.hireCost),
    lastUpdatedAt: now,
  };
}

export function canChangeProcessMode(state: GameState, mode: ProcessMode) {
  const processMode = processModeDefinitions.find((candidate) => candidate.id === mode);

  if (!processMode) {
    return false;
  }

  return meetsRequirement(state, processMode.unlockRequirement);
}

export function changeProcessMode(state: GameState, mode: ProcessMode, now: number): GameState {
  if (state.currentProcess === mode || !canChangeProcessMode(state, mode)) {
    return state;
  }

  return {
    ...state,
    currentProcess: mode,
    lastUpdatedAt: now,
  };
}

export function getRecommendedBreed(roleId: Exclude<RoleId, 'founder'>): BreedId {
  return pickBreedForRole(getRoleDefinition(roleId)).id;
}
