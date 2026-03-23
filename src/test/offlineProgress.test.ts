import { createInitialGameState } from '@/game-core/engine/createInitialGameState';
import { applyOfflineProgress } from '@/game-core/engine/offlineProgress';

describe('applyOfflineProgress', () => {
  it('recovers progress when enough time has passed offline', () => {
    const state = createInitialGameState(0);
    const recovered = applyOfflineProgress(state, 1000 * 60 * 30);

    expect(recovered.resources.code).toBeGreaterThan(state.resources.code);
    expect(recovered.stats.totalOfflineMs).toBeGreaterThan(0);
  });
});

