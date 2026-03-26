import { createInitialGameState } from '@/game-core/engine/createInitialGameState';

describe('createInitialGameState', () => {
  it('creates the founder company shell with deterministic defaults', () => {
    const state = createInitialGameState(1234);

    expect(state.companyName).toBe('개발견 스튜디오');
    expect(state.founder.breedId).toBe('border-collie');
    expect(state.employeeCount).toBe(1);
    expect(state.currentProcess).toBe('agile');
    expect(state.team).toEqual([]);
    expect(state.communityPerks).toEqual({});
    expect(state.workshopUpgrades).toEqual({});
    expect(state.contractBoard).toHaveLength(3);
    expect(state.nextContractSerial).toBe(3);
    expect(state.stats.totalContractsCompleted).toBe(0);
    expect(state.currentProject.name).toBe('온보딩 랜딩 정리');
    expect(state.completedProjects).toBe(0);
    expect(state.officeLevel).toBe(1);
    expect(state.lastUpdatedAt).toBe(1234);
  });
});
