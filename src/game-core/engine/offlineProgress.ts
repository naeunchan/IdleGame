import type { GameState } from '@/entities/company';

import { ACTIVE_TICK_MS, MAX_OFFLINE_MS } from '@/game-core/engine/constants';
import { advanceGameState } from '@/game-core/engine/reducer';

export function applyOfflineProgress(state: GameState, now: number) {
  const deltaMs = Math.max(0, now - state.lastUpdatedAt);
  const appliedDeltaMs = Math.min(deltaMs, MAX_OFFLINE_MS);

  if (appliedDeltaMs < ACTIVE_TICK_MS * 2) {
    return state;
  }

  return advanceGameState(state, {
    now,
    deltaMs: appliedDeltaMs,
    isOffline: true,
  });
}

