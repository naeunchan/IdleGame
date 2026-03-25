import { breedDefinitions } from '@/content/breeds/definitions';
import { companyScaleDefinitions } from '@/content/companyScales/definitions';
import { processModeDefinitions } from '@/content/processModes/definitions';
import { roleDefinitions } from '@/content/jobs/definitions';
import type { ModifierProfile } from '@/entities/progression';
import type { GameState } from '@/entities/company';
import type { ProcessMode } from '@/entities/process';
import type { ProjectState } from '@/entities/project';

import { BASE_CODE_PER_SECOND, BASE_FOCUS_DRIFT_PER_SECOND, MAX_FOCUS, MIN_FOCUS } from '@/game-core/engine/constants';

export function getBreedDefinition(state: GameState) {
  return breedDefinitions.find((breed) => breed.id === state.founder.breedId) ?? breedDefinitions[0];
}

function getProcessDefinition(mode: ProcessMode) {
  return processModeDefinitions.find((definition) => definition.id === mode) ?? processModeDefinitions[0];
}

function getCurrentScaleDefinition(state: GameState) {
  return companyScaleDefinitions.find((definition) => definition.id === state.companyScaleId) ?? companyScaleDefinitions[0];
}

function getRoleDefinition(roleId: GameState['teamMembers'][number]['roleId']) {
  return roleDefinitions.find((role) => role.id === roleId) ?? roleDefinitions[0];
}

function combineMultipliers(base: ModifierProfile, next: ModifierProfile): ModifierProfile {
  return {
    productivityMultiplier: base.productivityMultiplier * next.productivityMultiplier,
    focusMultiplier: base.focusMultiplier * next.focusMultiplier,
    teamMultiplier: base.teamMultiplier * next.teamMultiplier,
    qualityMultiplier: base.qualityMultiplier * next.qualityMultiplier,
    stabilityMultiplier: base.stabilityMultiplier * next.stabilityMultiplier,
  };
}

function getMatchWeight(breedId: GameState['teamMembers'][number]['breedId'], roleId: GameState['teamMembers'][number]['roleId']) {
  const breed = breedDefinitions.find((candidate) => candidate.id === breedId);
  return breed?.roleMatches.find((match) => match.roleId === roleId)?.weight ?? 0.6;
}

function getRoleBaseRate(roleId: GameState['teamMembers'][number]['roleId']) {
  switch (roleId) {
    case 'designer':
      return 0.38;
    case 'pm':
      return 0.24;
    case 'architect':
      return 0.82;
    case 'qa':
      return 0.2;
  }
}

function getAggregateProfile(state: GameState) {
  const founderBreed = getBreedDefinition(state);
  const process = getProcessDefinition(state.currentProcess);
  const scale = getCurrentScaleDefinition(state);
  const baseProfile = combineMultipliers(
    combineMultipliers(founderBreed.modifierProfile, process.modifierProfile),
    scale.modifierProfile,
  );

  const teamBoost = state.teamMembers.reduce(
    (totals, member) => {
      const role = getRoleDefinition(member.roleId);
      const breed = breedDefinitions.find((candidate) => candidate.id === member.breedId) ?? breedDefinitions[0];
      const matchWeight = getMatchWeight(member.breedId, member.roleId);

      return {
        productivity: totals.productivity + ((role.modifierProfile.productivityMultiplier - 1) + (breed.modifierProfile.productivityMultiplier - 1)) * matchWeight * 0.45,
        focus: totals.focus + ((role.modifierProfile.focusMultiplier - 1) + (breed.modifierProfile.focusMultiplier - 1)) * 0.32,
        team: totals.team + ((role.modifierProfile.teamMultiplier - 1) + (breed.modifierProfile.teamMultiplier - 1)) * matchWeight * 0.5,
        quality: totals.quality + ((role.modifierProfile.qualityMultiplier - 1) + (breed.modifierProfile.qualityMultiplier - 1)) * matchWeight * 0.38,
        stability: totals.stability + ((role.modifierProfile.stabilityMultiplier - 1) + (breed.modifierProfile.stabilityMultiplier - 1)) * matchWeight * 0.34,
        supportCode: totals.supportCode + getRoleBaseRate(member.roleId) * matchWeight * (0.75 + breed.modifierProfile.productivityMultiplier * 0.25),
      };
    },
    {
      productivity: 0,
      focus: 0,
      team: 0,
      quality: 0,
      stability: 0,
      supportCode: 0,
    },
  );

  return {
    combined: {
      productivityMultiplier: baseProfile.productivityMultiplier * (1 + teamBoost.productivity),
      focusMultiplier: baseProfile.focusMultiplier * (1 + teamBoost.focus),
      teamMultiplier: baseProfile.teamMultiplier * (1 + teamBoost.team),
      qualityMultiplier: baseProfile.qualityMultiplier * (1 + teamBoost.quality),
      stabilityMultiplier: baseProfile.stabilityMultiplier * (1 + teamBoost.stability),
    },
    supportCodePerSecond: teamBoost.supportCode,
  };
}

export function getFocusEfficiency(focus: number) {
  return 0.5 + focus / 200;
}

export function getCodePerSecond(state: GameState) {
  const aggregate = getAggregateProfile(state);

  return (BASE_CODE_PER_SECOND + aggregate.supportCodePerSecond) * aggregate.combined.productivityMultiplier * aggregate.combined.teamMultiplier * getFocusEfficiency(state.resources.focus);
}

export function getFocusDriftPerSecond(state: GameState) {
  const aggregate = getAggregateProfile(state);
  return BASE_FOCUS_DRIFT_PER_SECOND + (aggregate.combined.focusMultiplier - 1) * 0.6 - state.teamMembers.length * 0.03;
}

export function getReleaseRewardMultipliers(state: GameState) {
  const aggregate = getAggregateProfile(state);

  return {
    cash: aggregate.combined.qualityMultiplier * aggregate.combined.stabilityMultiplier,
    reputation: aggregate.combined.qualityMultiplier * aggregate.combined.teamMultiplier,
  };
}

export function getNextProject(stage: number): ProjectState {
  const target = Math.round(28 * Math.pow(1.18, stage - 1) + stage * 8);
  const rewardCash = Math.round(22 * Math.pow(1.15, stage - 1) + stage * 4);
  const rewardReputation = Math.max(1, Math.round(1 + stage * 0.65));

  return {
    stage,
    name: `앱 기능 스프린트 ${stage}`,
    progress: 0,
    target,
    rewardCash,
    rewardReputation,
  };
}

export function clampFocus(focus: number) {
  return Math.min(MAX_FOCUS, Math.max(MIN_FOCUS, focus));
}
