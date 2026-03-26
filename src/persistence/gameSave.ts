import type { GameState, SaveSnapshotV1 } from '@/entities/company';
import { createInitialGameState } from '@/game-core/engine/createInitialGameState';
import { advanceGameState } from '@/game-core/engine/simulation';

export const GAME_SAVE_KEY = 'gaebalgyeon-kiugi.save.v1';

function isValidGameState(value: unknown): value is GameState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const state = value as Record<string, unknown>;

  return (
    typeof state.companyName === 'string' &&
    !!state.founder &&
    !!state.resources &&
    Array.isArray(state.team) &&
    typeof state.currentProcess === 'string' &&
    !!state.currentProject &&
    typeof state.lastUpdatedAt === 'number'
  );
}

export function parseSaveSnapshot(raw: string | null): SaveSnapshotV1 | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SaveSnapshotV1>;

    if (parsed.version !== 1 || typeof parsed.savedAt !== 'number' || !isValidGameState(parsed.gameState)) {
      return null;
    }

    return parsed as SaveSnapshotV1;
  } catch {
    return null;
  }
}

export function loadPersistedGame(now = Date.now()) {
  if (typeof window === 'undefined') {
    return {
      gameState: createInitialGameState(now),
      report: null,
    };
  }

  const snapshot = parseSaveSnapshot(window.localStorage.getItem(GAME_SAVE_KEY));

  if (!snapshot) {
    return {
      gameState: createInitialGameState(now),
      report: null,
    };
  }

  const advanced = advanceGameState(snapshot.gameState, {
    now,
    deltaMs: now - snapshot.gameState.lastUpdatedAt,
    isOffline: true,
  });

  return {
    gameState: advanced.gameState,
    report: advanced.report.projectsCompleted > 0 || advanced.report.codeGained > 0 ? advanced.report : null,
  };
}

export function persistGame(gameState: GameState) {
  if (typeof window === 'undefined') {
    return;
  }

  const snapshot: SaveSnapshotV1 = {
    version: 1,
    savedAt: Date.now(),
    gameState,
  };

  window.localStorage.setItem(GAME_SAVE_KEY, JSON.stringify(snapshot));
}
