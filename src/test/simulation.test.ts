import { createInitialGameState } from '@/game-core/engine/createInitialGameState';
import {
  advanceGameState,
  getAvailableHiringCandidates,
  getSimulationSnapshot,
  hireCandidate,
  purchaseWorkshopUpgrade,
  runFocusSession,
  switchProcessMode,
  takeSnackBreak,
} from '@/game-core/engine/simulation';

describe('simulation core loop', () => {
  it('advances production and completes projects over time', () => {
    const initial = createInitialGameState(1_000);
    const advanced = advanceGameState(initial, {
      now: 11_000,
      deltaMs: 10_000,
      isOffline: false,
    });

    expect(advanced.gameState.resources.code).toBeGreaterThan(initial.resources.code);
    expect(advanced.gameState.currentProject.cycle).toBeGreaterThanOrEqual(1);
    expect(advanced.report.cashGained).toBeGreaterThan(0);
    expect(advanced.report.projectsCompleted).toBeGreaterThan(0);
  });

  it('changes simulation output when process mode changes', () => {
    const initial = createInitialGameState(0);
    const agile = getSimulationSnapshot(initial);
    const waterfall = getSimulationSnapshot(switchProcessMode(initial, 'waterfall'));

    expect(agile.codePerSecond).toBeGreaterThan(waterfall.codePerSecond);
    expect(waterfall.qualityScore).toBeGreaterThan(agile.qualityScore);
  });

  it('supports hiring and active actions', () => {
    const initial = createInitialGameState(0);
    const advanced = advanceGameState(initial, {
      now: 25_000,
      deltaMs: 25_000,
      isOffline: false,
    });
    const candidate = getAvailableHiringCandidates(advanced.gameState)[0];
    const hired = hireCandidate(advanced.gameState, candidate.id);
    const focused = runFocusSession(hired);
    const snacked = takeSnackBreak(focused);

    expect(hired.employeeCount).toBe(2);
    expect(hired.resources.cash).toBeLessThan(advanced.gameState.resources.cash);
    expect(focused.currentProject.progress).toBeGreaterThan(hired.currentProject.progress);
    expect(snacked.resources.focus).toBeGreaterThan(focused.resources.focus);
  });

  it('lets the player buy workshop upgrades that improve the long-term loop', () => {
    const initial = createInitialGameState(0);
    const upgradeReady = {
      ...initial,
      resources: {
        ...initial.resources,
        cash: 120,
      },
    };
    const before = getSimulationSnapshot(upgradeReady);
    const upgraded = purchaseWorkshopUpgrade(upgradeReady, 'warm-desk');
    const after = getSimulationSnapshot(upgraded);

    expect(upgraded.workshopUpgrades?.['warm-desk']).toBe(1);
    expect(upgraded.resources.cash).toBeLessThan(upgradeReady.resources.cash);
    expect(after.codePerSecond).toBeGreaterThan(before.codePerSecond);
  });

  it('caps offline progress to a safe maximum window', () => {
    const initial = createInitialGameState(0);
    const advanced = advanceGameState(initial, {
      now: 1000 * 60 * 60 * 12,
      deltaMs: 1000 * 60 * 60 * 12,
      isOffline: true,
    });

    expect(advanced.report.elapsedMs).toBe(1000 * 60 * 60 * 3);
  });
});
