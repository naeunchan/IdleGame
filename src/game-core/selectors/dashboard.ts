import type { GameState } from '@/entities/company';

import { getCodePerSecond, getFocusDriftPerSecond, getFocusEfficiency } from '@/game-core/engine/formulas';

export function getDashboardMetrics(state: GameState) {
  return {
    codePerSecond: getCodePerSecond(state),
    focusTrendPerMinute: getFocusDriftPerSecond(state) * 60,
    focusEfficiency: getFocusEfficiency(state.resources.focus),
    projectRatio: state.activeProject.progress / state.activeProject.target,
  };
}

