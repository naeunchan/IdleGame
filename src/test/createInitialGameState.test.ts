import { createInitialGameState } from '@/game-core/engine/createInitialGameState';

describe('createInitialGameState', () => {
  it('creates the founder company shell with deterministic defaults', () => {
    const state = createInitialGameState(1234);

    expect(state.companyName).toBe('개발견 스튜디오');
    expect(state.founder.breedId).toBe('border-collie');
    expect(state.employeeCount).toBe(1);
    expect(state.currentProcess).toBe('agile');
    expect(state.lastUpdatedAt).toBe(1234);
  });
});

