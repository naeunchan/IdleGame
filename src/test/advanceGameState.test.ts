import { createInitialGameState } from '@/game-core/engine/createInitialGameState';
import { advanceGameState } from '@/game-core/engine/reducer';

describe('advanceGameState', () => {
  it('produces code and progresses the current project over time', () => {
    const state = createInitialGameState(1_000);

    const next = advanceGameState(state, {
      now: 6_000,
      deltaMs: 5_000,
      isOffline: false,
    });

    expect(next.resources.code).toBeGreaterThan(state.resources.code);
    expect(next.activeProject.progress).toBeGreaterThan(state.activeProject.progress);
    expect(next.lastUpdatedAt).toBe(6_000);
  });

  it('settles one or more releases when enough progress is accumulated', () => {
    const state = {
      ...createInitialGameState(1_000),
      activeProject: {
        stage: 1,
        name: '앱 기능 스프린트 1',
        progress: 26,
        target: 28,
        rewardCash: 20,
        rewardReputation: 2,
      },
    };

    const next = advanceGameState(state, {
      now: 11_000,
      deltaMs: 10_000,
      isOffline: false,
    });

    expect(next.stats.releases).toBeGreaterThan(0);
    expect(next.resources.cash).toBeGreaterThan(state.resources.cash);
    expect(next.activeProject.stage).toBeGreaterThanOrEqual(2);
  });
});

