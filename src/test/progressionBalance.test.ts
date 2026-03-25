import { createInitialGameState } from '@/game-core/engine/createInitialGameState';
import { canHireRole, canUpgradeCompanyScale, hireRole, upgradeCompanyScale } from '@/game-core/engine/management';
import { advanceGameState } from '@/game-core/engine/reducer';

function simulateMinutes(minutes: number) {
  let state = createInitialGameState(0);

  for (let tick = 0; tick < minutes * 4; tick += 1) {
    state = advanceGameState(state, {
      now: (tick + 1) * 15_000,
      deltaMs: 15_000,
      isOffline: false,
    });
  }

  return state;
}

describe('progression balance', () => {
  it('reaches the first scale upgrade and first hire within the opening session window', () => {
    const simulated = simulateMinutes(12);

    expect(canUpgradeCompanyScale(simulated)).toBe(true);

    const scaled = upgradeCompanyScale(simulated, 12 * 60_000 + 1);

    expect(canHireRole(scaled, 'designer')).toBe(true);

    const hired = hireRole(scaled, 'designer', 12 * 60_000 + 2);

    expect(hired.employeeCount).toBe(2);
  });
});

