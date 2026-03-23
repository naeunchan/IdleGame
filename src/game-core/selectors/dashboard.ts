import { companyScaleDefinitions } from '@/content/companyScales/definitions';
import { roleDefinitions } from '@/content/jobs/definitions';
import { processModeDefinitions } from '@/content/processModes/definitions';
import type { GameState } from '@/entities/company';

import { getCodePerSecond, getFocusDriftPerSecond, getFocusEfficiency } from '@/game-core/engine/formulas';
import { canChangeProcessMode, canHireRole, canUpgradeCompanyScale, getCurrentCompanyScale, getNextCompanyScale, getRecommendedBreed } from '@/game-core/engine/management';

export function getDashboardMetrics(state: GameState) {
  return {
    codePerSecond: getCodePerSecond(state),
    focusTrendPerMinute: getFocusDriftPerSecond(state) * 60,
    focusEfficiency: getFocusEfficiency(state.resources.focus),
    projectRatio: state.activeProject.progress / state.activeProject.target,
  };
}

export function getHireCards(state: GameState) {
  const currentScale = getCurrentCompanyScale(state);

  return roleDefinitions
    .filter((role) => role.id !== 'founder')
    .map((role) => ({
      ...role,
      isHired: state.teamMembers.some((member) => member.roleId === role.id),
      isUnlockedByScale: currentScale.unlockedRoles.includes(role.id),
      recommendedBreedId: getRecommendedBreed(role.id),
      canHire: canHireRole(state, role.id),
    }));
}

export function getProcessCards(state: GameState) {
  return processModeDefinitions.map((processMode) => ({
    ...processMode,
    isActive: state.currentProcess === processMode.id,
    canChange: canChangeProcessMode(state, processMode.id),
  }));
}

export function getScaleProgress(state: GameState) {
  const currentScale = getCurrentCompanyScale(state);
  const nextScale = getNextCompanyScale(state);

  return {
    currentScale,
    nextScale,
    canUpgrade: canUpgradeCompanyScale(state),
    totalStages: companyScaleDefinitions.length,
  };
}
