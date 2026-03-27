import { createPhaserStageSnapshot } from '@/game-renderer/phaser/createStageSnapshot';
import { createInitialGameState } from '@/game-core/engine/createInitialGameState';
import { getSimulationSnapshot } from '@/game-core/engine/simulation';

describe('createPhaserStageSnapshot', () => {
  it('maps the initial game state into a compact stage snapshot', () => {
    const initial = createInitialGameState(0);
    const snapshot = createPhaserStageSnapshot(initial, getSimulationSnapshot(initial));

    expect(snapshot.officeLevel).toBe(1);
    expect(snapshot.workerCount).toBe(1);
    expect(snapshot.processMode).toBe('agile');
    expect(snapshot.workstationCount).toBeGreaterThanOrEqual(2);
    expect(snapshot.projectProgressLabel).toBe('0%');
  });

  it('reflects growth, progress, and upgrades in the stage snapshot', () => {
    const grown = {
      ...createInitialGameState(0),
      employeeCount: 5,
      officeLevel: 3,
      completedProjects: 7,
      currentProject: {
        ...createInitialGameState(0).currentProject,
        requiredCode: 100,
        progress: 76,
      },
      workshopUpgrades: {
        'warm-desk': 2,
        'snack-cart': 1,
        'showcase-wall': 2,
      },
    };

    const snapshot = createPhaserStageSnapshot(grown, getSimulationSnapshot(grown));

    expect(snapshot.workerCount).toBe(4);
    expect(snapshot.officeLevel).toBe(3);
    expect(snapshot.projectProgressLabel).toBe('76%');
    expect(snapshot.automationLevel).toBe(2);
    expect(snapshot.refreshStationLevel).toBe(1);
    expect(snapshot.releaseArchiveLevel).toBe(2);
    expect(snapshot.serverRackCount).toBeGreaterThan(0);
  });
});
