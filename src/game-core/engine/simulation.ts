import {
  communityPerkDefinitions,
  getCommunityPerkCost,
  getCommunityPerkEffects,
  getCommunityPerkLevel,
  isCommunityPerkUnlocked,
} from '@/content/community/definitions';
import { hiringCandidateDefinitions } from '@/content/hiring/candidates';
import {
  createContractForSerial,
  getContractProgress,
} from '@/content/contracts/definitions';
import { isMilestoneReached } from '@/content/milestones/definitions';
import { breedDefinitions } from '@/content/breeds/definitions';
import { roleDefinitions } from '@/content/jobs/definitions';
import { processModeDefinitions } from '@/content/processModes/definitions';
import { projectTemplates } from '@/content/projects/templates';
import {
  getWorkshopUpgradeCost,
  getWorkshopUpgradeEffects,
  getWorkshopUpgradeLevel,
  workshopUpgradeDefinitions,
} from '@/content/upgrades/definitions';
import type {
  EmployeeProfile,
  GameState,
  ProgressReport,
  ProjectState,
  SimulationSnapshot,
  TickInput,
} from '@/entities/company';
import type { ProcessMode } from '@/entities/process';
import type { CommunityPerkId } from '@/entities/community';
import type { WorkshopUpgradeId } from '@/entities/upgrade';

const MAX_FOCUS = 100;
const MAX_OFFLINE_MS = 1000 * 60 * 60 * 3;
const STEP_MS = 1000;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function getBreedDefinition(breedId: string) {
  const breed = breedDefinitions.find((item) => item.id === breedId);

  if (!breed) {
    throw new Error(`Unknown breed: ${breedId}`);
  }

  return breed;
}

function getRoleDefinition(roleId: string) {
  const role = roleDefinitions.find((item) => item.id === roleId);

  if (!role) {
    throw new Error(`Unknown role: ${roleId}`);
  }

  return role;
}

function getProcessDefinition(processMode: ProcessMode) {
  const process = processModeDefinitions.find((item) => item.id === processMode);

  if (!process) {
    throw new Error(`Unknown process mode: ${processMode}`);
  }

  return process;
}

function getRoster(state: GameState) {
  return [
    {
      id: 'founder',
      name: state.founder.name,
      breedId: state.founder.breedId,
      role: state.founder.role,
      stage: state.founder.stage,
    },
    ...state.team,
  ];
}

function getOfficeLevel(employeeCount: number, completedProjects: number) {
  if (employeeCount >= 5 || completedProjects >= 8) {
    return 3;
  }

  if (employeeCount >= 3 || completedProjects >= 3) {
    return 2;
  }

  return 1;
}

export function createProjectForCycle(cycle: number): ProjectState {
  const template = projectTemplates[cycle % projectTemplates.length];
  const curve = Math.floor(cycle / projectTemplates.length);
  const requiredCode = 34 + cycle * 10 + curve * 8;
  const rewardCash = 22 + cycle * 9 + curve * 4;
  const rewardReputation = 2 + Math.floor(cycle / 2);

  return {
    id: `${template.id}-${cycle}`,
    name: template.name,
    summary: template.summary,
    requiredCode,
    progress: 0,
    rewardCash,
    rewardReputation,
    cycle,
  };
}

export function getSimulationSnapshot(state: GameState): SimulationSnapshot {
  const roster = getRoster(state);
  const process = getProcessDefinition(state.currentProcess);
  const upgradeEffects = getWorkshopUpgradeEffects(state.workshopUpgrades);
  const communityEffects = getCommunityPerkEffects(state.communityPerks);

  const aggregate = roster.reduce(
    (acc, member) => {
      const breed = getBreedDefinition(member.breedId);
      const role = getRoleDefinition(member.role);

      acc.production += role.productionBase * (1 + breed.productivityBonus / 100);
      acc.quality += role.qualityBase * (1 + breed.qualityBonus / 100);
      acc.focusUse += role.focusUse * (1 - breed.focusBonus / 220);
      acc.teamBuff += role.teamBuffBase + breed.teamBuffBonus / 100;

      return acc;
    },
    {
      production: 0,
      quality: 0,
      focusUse: 0,
      teamBuff: 0,
    },
  );

  const focusRatio = clamp(state.resources.focus / MAX_FOCUS, 0.45, 1);
  const teamHarmony = 1 + aggregate.teamBuff;
  const codePerSecond =
    aggregate.production *
    process.productionMultiplier *
    teamHarmony *
    focusRatio *
    (1 + upgradeEffects.productionMultiplierBonus + communityEffects.productionMultiplierBonus);
  const focusRecovery =
    0.42 +
    Math.min(0.32, aggregate.teamBuff * 0.28) +
    upgradeEffects.focusRecoveryBonus +
    communityEffects.focusRecoveryBonus;
  const focusDrain = aggregate.focusUse * process.focusDrainMultiplier;
  const focusDeltaPerSecond = focusRecovery - focusDrain;
  const qualityScore = aggregate.quality * process.qualityMultiplier;
  const rewardMultiplier =
    process.rewardMultiplier *
    (1 + Math.min(0.42, qualityScore / 22)) *
    (1 + upgradeEffects.rewardMultiplierBonus);

  return {
    codePerSecond: round(codePerSecond),
    focusDeltaPerSecond: round(focusDeltaPerSecond),
    qualityScore: round(qualityScore),
    teamHarmony: round(teamHarmony),
    rewardMultiplier: round(rewardMultiplier),
  };
}

export function getAvailableHiringCandidates(state: GameState) {
  const hiredIds = new Set(state.team.map((member) => member.id));

  return hiringCandidateDefinitions.filter(
    (candidate) => candidate.unlockAtProjects <= state.completedProjects + 1 && !hiredIds.has(candidate.id),
  );
}

function applyProjectCompletion(state: GameState, report: ProgressReport, rewardMultiplier: number) {
  const rewardCash = round(state.currentProject.rewardCash * rewardMultiplier);
  const rewardReputation = round(state.currentProject.rewardReputation * rewardMultiplier);

  state.resources.cash = round(state.resources.cash + rewardCash);
  state.resources.reputation = round(state.resources.reputation + rewardReputation);
  state.stats.totalCashEarned = round(state.stats.totalCashEarned + rewardCash);
  state.stats.totalReputationEarned = round(state.stats.totalReputationEarned + rewardReputation);
  state.resources.focus = clamp(round(state.resources.focus + 7), 0, MAX_FOCUS);
  state.completedProjects += 1;

  report.cashGained = round(report.cashGained + rewardCash);
  report.reputationGained = round(report.reputationGained + rewardReputation);
  report.projectsCompleted += 1;

  const leftoverProgress = state.currentProject.progress - state.currentProject.requiredCode;
  state.currentProject = createProjectForCycle(state.completedProjects);
  state.currentProject.progress = round(Math.max(0, leftoverProgress));
}

function stepGameState(state: GameState, deltaSeconds: number, report: ProgressReport) {
  const snapshot = getSimulationSnapshot(state);
  const codeGain = snapshot.codePerSecond * deltaSeconds;

  state.resources.code = round(state.resources.code + codeGain);
  state.stats.totalCodeProduced = round(state.stats.totalCodeProduced + codeGain);
  state.resources.focus = clamp(round(state.resources.focus + snapshot.focusDeltaPerSecond * deltaSeconds), 0, MAX_FOCUS);
  state.currentProject.progress = round(state.currentProject.progress + codeGain);

  report.codeGained = round(report.codeGained + codeGain);

  while (state.currentProject.progress >= state.currentProject.requiredCode) {
    applyProjectCompletion(state, report, snapshot.rewardMultiplier);
  }
}

export function advanceGameState(state: GameState, input: TickInput) {
  const cappedDeltaMs = Math.max(0, Math.min(input.deltaMs, input.isOffline ? MAX_OFFLINE_MS : input.deltaMs));
  const nextState: GameState = {
    ...state,
    resources: { ...state.resources },
    stats: { ...state.stats },
    contractBoard: state.contractBoard.map((contract) => ({ ...contract })),
    communityPerks: { ...(state.communityPerks ?? {}) },
    workshopUpgrades: { ...(state.workshopUpgrades ?? {}) },
    founder: { ...state.founder },
    team: state.team.map((member) => ({ ...member })),
    currentProject: { ...state.currentProject },
  };
  const report: ProgressReport = {
    elapsedMs: cappedDeltaMs,
    codeGained: 0,
    cashGained: 0,
    reputationGained: 0,
    projectsCompleted: 0,
  };

  if (cappedDeltaMs > 0) {
    let remainingMs = cappedDeltaMs;

    while (remainingMs > 0) {
      const stepMs = Math.min(STEP_MS, remainingMs);
      stepGameState(nextState, stepMs / 1000, report);
      remainingMs -= stepMs;
    }
  }

  nextState.employeeCount = nextState.team.length + 1;
  nextState.officeLevel = getOfficeLevel(nextState.employeeCount, nextState.completedProjects);
  nextState.lastUpdatedAt = input.now;

  return { gameState: nextState, report };
}

export function hireCandidate(state: GameState, candidateId: string) {
  const candidate = getAvailableHiringCandidates(state).find((item) => item.id === candidateId);

  if (!candidate || state.resources.cash < candidate.cost) {
    return state;
  }

  const nextEmployee: EmployeeProfile = {
    id: candidate.id,
    name: candidate.name,
    breedId: candidate.breedId,
    role: candidate.role,
    stage: 'adult',
    hiredAtProject: state.completedProjects,
  };

  const nextState: GameState = {
    ...state,
    resources: {
      ...state.resources,
      cash: round(state.resources.cash - candidate.cost),
    },
    stats: {
      ...state.stats,
      totalHires: state.stats.totalHires + 1,
    },
    team: [...state.team, nextEmployee],
  };

  nextState.employeeCount = nextState.team.length + 1;
  nextState.officeLevel = getOfficeLevel(nextState.employeeCount, nextState.completedProjects);

  return nextState;
}

export function switchProcessMode(state: GameState, processMode: ProcessMode) {
  if (state.currentProcess === processMode) {
    return state;
  }

  return {
    ...state,
    currentProcess: processMode,
  };
}

export function purchaseWorkshopUpgrade(state: GameState, upgradeId: WorkshopUpgradeId) {
  const definition = workshopUpgradeDefinitions.find((item) => item.id === upgradeId);

  if (!definition) {
    return state;
  }

  if (definition.unlockMilestoneId && !isMilestoneReached(state, definition.unlockMilestoneId)) {
    return state;
  }

  const currentLevel = getWorkshopUpgradeLevel(state.workshopUpgrades, upgradeId);
  const nextCost = getWorkshopUpgradeCost(definition, currentLevel);

  if (nextCost === null || state.resources.cash < nextCost) {
    return state;
  }

  return {
    ...state,
    resources: {
      ...state.resources,
      cash: round(state.resources.cash - nextCost),
    },
    stats: {
      ...state.stats,
      totalUpgradesPurchased: state.stats.totalUpgradesPurchased + 1,
    },
    workshopUpgrades: {
      ...(state.workshopUpgrades ?? {}),
      [upgradeId]: currentLevel + 1,
    },
  };
}

export function purchaseCommunityPerk(state: GameState, perkId: CommunityPerkId) {
  const definition = communityPerkDefinitions.find((item) => item.id === perkId);

  if (!definition || !isCommunityPerkUnlocked(state, definition)) {
    return state;
  }

  const currentLevel = getCommunityPerkLevel(state.communityPerks, perkId);
  const nextCost = getCommunityPerkCost(definition, currentLevel);

  if (nextCost === null || state.resources.reputation < nextCost) {
    return state;
  }

  return {
    ...state,
    resources: {
      ...state.resources,
      reputation: round(state.resources.reputation - nextCost),
    },
    communityPerks: {
      ...(state.communityPerks ?? {}),
      [perkId]: currentLevel + 1,
    },
  };
}

export function runFocusSession(state: GameState) {
  if (state.resources.focus < 14) {
    return state;
  }

  const nextState: GameState = {
    ...state,
    resources: {
      ...state.resources,
      focus: round(state.resources.focus - 14),
      code: round(state.resources.code + 8),
    },
    stats: {
      ...state.stats,
      totalCodeProduced: round(state.stats.totalCodeProduced + 8),
      totalFocusSessions: state.stats.totalFocusSessions + 1,
    },
    currentProject: {
      ...state.currentProject,
      progress: round(state.currentProject.progress + 16),
    },
  };

  const manualReport: ProgressReport = {
    elapsedMs: 0,
    codeGained: 8,
    cashGained: 0,
    reputationGained: 0,
    projectsCompleted: 0,
  };
  const snapshot = getSimulationSnapshot(nextState);

  while (nextState.currentProject.progress >= nextState.currentProject.requiredCode) {
    applyProjectCompletion(nextState, manualReport, snapshot.rewardMultiplier);
  }

  return {
    ...nextState,
    employeeCount: nextState.team.length + 1,
    officeLevel: getOfficeLevel(nextState.team.length + 1, nextState.completedProjects),
  };
}

export function takeSnackBreak(state: GameState) {
  if (state.resources.cash < 14) {
    return state;
  }

  return {
    ...state,
    resources: {
      ...state.resources,
      cash: round(state.resources.cash - 14),
      focus: clamp(round(state.resources.focus + 22), 0, MAX_FOCUS),
    },
    stats: {
      ...state.stats,
      totalSnacksPurchased: state.stats.totalSnacksPurchased + 1,
    },
  };
}

export function claimContract(state: GameState, contractId: string) {
  const contractIndex = state.contractBoard.findIndex((item) => item.id === contractId);

  if (contractIndex < 0) {
    return state;
  }

  const activeContract = state.contractBoard[contractIndex];
  const progress = getContractProgress(state, activeContract);

  if (!progress.isComplete) {
    return state;
  }

  const communityEffects = getCommunityPerkEffects(state.communityPerks);
  const contractRewardMultiplier = 1 + communityEffects.contractRewardMultiplierBonus;
  const rewardCash = round(activeContract.rewardCash * contractRewardMultiplier);
  const rewardReputation = round(activeContract.rewardReputation * contractRewardMultiplier);
  const nextStats = {
    ...state.stats,
    totalCashEarned: round(state.stats.totalCashEarned + rewardCash),
    totalReputationEarned: round(state.stats.totalReputationEarned + rewardReputation),
    totalContractsCompleted: state.stats.totalContractsCompleted + 1,
  };
  const nextContractSerial = state.nextContractSerial + 1;
  const nextContractBoard = state.contractBoard.map((contract, index) =>
    index === contractIndex
      ? createContractForSerial(state.nextContractSerial, nextStats, state.completedProjects)
      : { ...contract },
  );

  return {
    ...state,
    resources: {
      ...state.resources,
      cash: round(state.resources.cash + rewardCash),
      reputation: round(state.resources.reputation + rewardReputation),
      focus: clamp(round(state.resources.focus + activeContract.rewardFocus), 0, MAX_FOCUS),
    },
    stats: nextStats,
    contractBoard: nextContractBoard,
    nextContractSerial,
  };
}
