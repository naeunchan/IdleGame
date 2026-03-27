import { getWorkshopUpgradeLevel } from '@/content/upgrades/definitions';
import type { GameState, SimulationSnapshot } from '@/entities/company';
import type { ProcessMode } from '@/entities/process';

export interface PhaserStageSnapshot {
  officeLevel: number;
  workerCount: number;
  processMode: ProcessMode;
  projectProgressPercent: number;
  projectProgressLabel: string;
  workstationCount: number;
  serverRackCount: number;
  workPace: number;
  automationLevel: number;
  refreshStationLevel: number;
  releaseArchiveLevel: number;
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
  const automationLevel = getWorkshopUpgradeLevel(state.workshopUpgrades, 'warm-desk');
  const refreshStationLevel = getWorkshopUpgradeLevel(state.workshopUpgrades, 'snack-cart');
  const releaseArchiveLevel = getWorkshopUpgradeLevel(state.workshopUpgrades, 'showcase-wall');

  return {
    officeLevel: state.officeLevel,
    workerCount: clamp(state.employeeCount, 1, 4),
    processMode: state.currentProcess,
    projectProgressPercent,
    projectProgressLabel: `${Math.round(projectProgressPercent)}%`,
    workstationCount: clamp(2 + state.officeLevel + Math.floor(state.completedProjects / 2), 2, 6),
    serverRackCount: clamp(Math.floor(state.completedProjects / 2) + releaseArchiveLevel, 0, 4),
    workPace: clamp(simulation.codePerSecond / 5, 0.8, 2.4),
    automationLevel,
    refreshStationLevel,
    releaseArchiveLevel,
  };
}
