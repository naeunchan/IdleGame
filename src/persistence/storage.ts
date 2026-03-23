import { createInitialGameState } from '@/game-core/engine/createInitialGameState';
import { applyOfflineProgress } from '@/game-core/engine/offlineProgress';
import { createSaveSnapshot, isSaveSnapshotV1 } from '@/persistence/saveSchema';
import type { GameState } from '@/entities/company';

const STORAGE_KEY = 'gaebalgyeon-kiugi/save';

export type HydrationSource = 'fresh-start' | 'save-recovered' | 'save-reset';

export interface HydratedGameState {
  state: GameState;
  source: HydrationSource;
}

export function persistGameState(state: GameState, savedAt = Date.now()) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(createSaveSnapshot(state, savedAt)));
}

export function loadGameState(now = Date.now()): HydratedGameState {
  if (typeof window === 'undefined') {
    return {
      state: createInitialGameState(now),
      source: 'fresh-start',
    };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {
      state: createInitialGameState(now),
      source: 'fresh-start',
    };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!isSaveSnapshotV1(parsed)) {
      return {
        state: createInitialGameState(now),
        source: 'save-reset',
      };
    }

    return {
      state: applyOfflineProgress(parsed.state, now),
      source: 'save-recovered',
    };
  } catch {
    return {
      state: createInitialGameState(now),
      source: 'save-reset',
    };
  }
}

