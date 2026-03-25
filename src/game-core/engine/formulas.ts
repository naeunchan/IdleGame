import { breedDefinitions } from '@/content/breeds/definitions';
import type { GameState } from '@/entities/company';
import type { ProcessMode } from '@/entities/process';
import type { ProjectState } from '@/entities/project';

import { BASE_CODE_PER_SECOND, BASE_FOCUS_DRIFT_PER_SECOND, MAX_FOCUS, MIN_FOCUS } from '@/game-core/engine/constants';

const processModifiers: Record<
  ProcessMode,
  {
    codeMultiplier: number;
    cashMultiplier: number;
    reputationMultiplier: number;
    focusOffsetPerSecond: number;
  }
> = {
  waterfall: {
    codeMultiplier: 0.94,
    cashMultiplier: 1.02,
    reputationMultiplier: 1.1,
    focusOffsetPerSecond: 0.08,
  },
  spiral: {
    codeMultiplier: 1,
    cashMultiplier: 1.04,
    reputationMultiplier: 1.04,
    focusOffsetPerSecond: 0.04,
  },
  agile: {
    codeMultiplier: 1.12,
    cashMultiplier: 1.08,
    reputationMultiplier: 0.98,
    focusOffsetPerSecond: -0.03,
  },
};

export function getBreedDefinition(state: GameState) {
  return breedDefinitions.find((breed) => breed.id === state.founder.breedId) ?? breedDefinitions[0];
}

export function getProcessModifiers(mode: ProcessMode) {
  return processModifiers[mode];
}

export function getFocusEfficiency(focus: number) {
  return 0.5 + focus / 200;
}

export function getCodePerSecond(state: GameState) {
  const breed = getBreedDefinition(state);
  const process = getProcessModifiers(state.currentProcess);
  const breedMultiplier = 1 + breed.productivityBonus / 100;

  return BASE_CODE_PER_SECOND * breedMultiplier * process.codeMultiplier * getFocusEfficiency(state.resources.focus);
}

export function getFocusDriftPerSecond(state: GameState) {
  const breed = getBreedDefinition(state);
  const process = getProcessModifiers(state.currentProcess);
  return BASE_FOCUS_DRIFT_PER_SECOND + breed.focusBonus * 0.01 + process.focusOffsetPerSecond;
}

export function getReleaseRewardMultipliers(state: GameState) {
  const breed = getBreedDefinition(state);
  const process = getProcessModifiers(state.currentProcess);

  return {
    cash: process.cashMultiplier * (1 + breed.qualityBonus / 160),
    reputation: process.reputationMultiplier * (1 + breed.qualityBonus / 180),
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

