import { createContractForSerial, getContractProgress } from '@/content/contracts/definitions';
import { createInitialGameState } from '@/game-core/engine/createInitialGameState';

describe('contract definitions', () => {
  it('creates a rotating contract board entry from serials', () => {
    const state = createInitialGameState(0);
    const contract = createContractForSerial(4, state.stats, state.completedProjects);

    expect(contract.id).toBe('code-bundle-4');
    expect(contract.tier).toBe(1);
    expect(contract.targetValue).toBeGreaterThan(0);
  });

  it('calculates progress from lifetime stats and completed projects', () => {
    const state = createInitialGameState(0);
    const contract = {
      ...state.contractBoard[0],
      definitionId: 'cashflow-cleanup' as const,
      baselineValue: 0,
      targetValue: 70,
    };
    const progressedState = {
      ...state,
      stats: {
        ...state.stats,
        totalCashEarned: 84,
      },
    };
    const progress = getContractProgress(progressedState, contract);

    expect(progress.progressValue).toBe(70);
    expect(progress.progressPercent).toBe(100);
    expect(progress.isComplete).toBe(true);
  });
});
