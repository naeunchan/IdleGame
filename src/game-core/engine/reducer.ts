import type { GameState } from '@/entities/company';
import type { ProjectState } from '@/entities/project';
import type { TickInput } from '@/shared/types/game';

import { MAX_RELEASES_PER_TICK } from '@/game-core/engine/constants';
import {
  clampFocus,
  getCodePerSecond,
  getFocusDriftPerSecond,
  getNextProject,
  getReleaseRewardMultipliers,
} from '@/game-core/engine/formulas';

function settleProjectProgress(
  state: GameState,
  startingProject: ProjectState,
  carriedProgress: number,
) {
  let releasesInTick = 0;
  let nextProject = startingProject;
  let progress = carriedProgress;
  let nextCash = state.resources.cash;
  let nextReputation = state.resources.reputation;
  let totalCashEarned = state.stats.totalCashEarned;

  const rewardMultipliers = getReleaseRewardMultipliers(state);

  while (progress >= nextProject.target && releasesInTick < MAX_RELEASES_PER_TICK) {
    progress -= nextProject.target;
    releasesInTick += 1;

    nextCash += nextProject.rewardCash * rewardMultipliers.cash;
    nextReputation += nextProject.rewardReputation * rewardMultipliers.reputation;
    totalCashEarned += nextProject.rewardCash * rewardMultipliers.cash;
    nextProject = {
      ...getNextProject(nextProject.stage + 1),
      progress,
    };
  }

  return {
    activeProject: {
      ...nextProject,
      progress,
    },
    nextCash,
    nextReputation,
    releasesInTick,
    totalCashEarned,
  };
}

export function advanceGameState(state: GameState, input: TickInput): GameState {
  const safeDeltaMs = Math.max(0, input.deltaMs);

  if (safeDeltaMs === 0) {
    return state;
  }

  const deltaSeconds = safeDeltaMs / 1000;
  const codeGain = getCodePerSecond(state) * deltaSeconds;
  const nextFocus = clampFocus(state.resources.focus + getFocusDriftPerSecond(state) * deltaSeconds);
  const progressBeforeRewards = state.activeProject.progress + codeGain;

  const settled = settleProjectProgress(state, state.activeProject, progressBeforeRewards);

  return {
    ...state,
    resources: {
      code: state.resources.code + codeGain,
      focus: nextFocus,
      cash: settled.nextCash,
      reputation: settled.nextReputation,
    },
    activeProject: settled.activeProject,
    stats: {
      releases: state.stats.releases + settled.releasesInTick,
      totalCodeProduced: state.stats.totalCodeProduced + codeGain,
      totalCashEarned: settled.totalCashEarned,
      totalOfflineMs: state.stats.totalOfflineMs + (input.isOffline ? safeDeltaMs : 0),
    },
    lastUpdatedAt: input.now,
  };
}

