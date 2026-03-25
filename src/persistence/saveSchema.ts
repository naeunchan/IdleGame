import type { GameState } from '@/entities/company';
import type { SaveSnapshotV1 } from '@/shared/types/game';

export const CURRENT_SAVE_VERSION = 1;

export function createSaveSnapshot(state: GameState, savedAt = Date.now()): SaveSnapshotV1 {
  return {
    version: CURRENT_SAVE_VERSION,
    savedAt,
    state: {
      ...state,
      lastUpdatedAt: savedAt,
    },
  };
}

export function isSaveSnapshotV1(value: unknown): value is SaveSnapshotV1 {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<SaveSnapshotV1>;
  return snapshot.version === CURRENT_SAVE_VERSION && typeof snapshot.savedAt === 'number' && !!snapshot.state;
}

