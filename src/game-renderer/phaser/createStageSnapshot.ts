import { getWorkshopUpgradeLevel } from '@/content/upgrades/definitions';
import type { GameState, SimulationSnapshot } from '@/entities/company';
import type { ProcessMode } from '@/entities/process';

export interface PhaserStageSnapshot {
  officeLevel: number;
  workerCount: number;
  processMode: ProcessMode;
  projectProgressPercent: number;
  projectProgressLabel: string;
  cropPatchCount: number;
  deliveryCrateCount: number;
  workPace: number;
  warmDeskLevel: number;
  snackCartLevel: number;
  showcaseWallLevel: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function createPhaserStageSnapshot(
  state: GameState,
  simulation: SimulationSnapshot,
): PhaserStageSnapshot {
  const requiredCode = Math.max(1, state.currentProject.requiredCode);
  const projectProgressPercent = clamp((state.currentProject.progress / requiredCode) * 100, 0, 100);
  const warmDeskLevel = getWorkshopUpgradeLevel(state.workshopUpgrades, 'warm-desk');
  const snackCartLevel = getWorkshopUpgradeLevel(state.workshopUpgrades, 'snack-cart');
  const showcaseWallLevel = getWorkshopUpgradeLevel(state.workshopUpgrades, 'showcase-wall');

  return {
    officeLevel: state.officeLevel,
    workerCount: clamp(state.employeeCount, 1, 4),
    processMode: state.currentProcess,
    projectProgressPercent,
    projectProgressLabel: `${Math.round(projectProgressPercent)}%`,
    cropPatchCount: clamp(2 + state.officeLevel + Math.floor(state.completedProjects / 2), 2, 6),
    deliveryCrateCount: clamp(Math.floor(state.completedProjects / 2) + showcaseWallLevel, 0, 4),
    workPace: clamp(simulation.codePerSecond / 5, 0.8, 2.4),
    warmDeskLevel,
    snackCartLevel,
    showcaseWallLevel,
  };
}
