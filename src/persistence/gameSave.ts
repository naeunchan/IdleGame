import type { GameState, SaveSnapshotV1 } from '@/entities/company';
import { createInitialGameState } from '@/game-core/engine/createInitialGameState';
import { advanceGameState } from '@/game-core/engine/simulation';

export const GAME_SAVE_KEY = 'gaebalgyeon-kiugi.save.v1';

export interface SaveSummary {
  version: 1;
  savedAt: number;
  companyName: string;
  employeeCount: number;
  completedProjects: number;
  cash: number;
  reputation: number;
}

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

function createSaveSummary(snapshot: SaveSnapshotV1): SaveSummary {
  return {
    version: snapshot.version,
    savedAt: snapshot.savedAt,
    companyName: snapshot.gameState.companyName,
    employeeCount: snapshot.gameState.employeeCount,
    completedProjects: snapshot.gameState.completedProjects,
    cash: snapshot.gameState.resources.cash,
    reputation: snapshot.gameState.resources.reputation,
  };
}

export function readPersistedGameSummary() {
  if (typeof window === 'undefined') {
    return null;
  }

  const snapshot = parseSaveSnapshot(window.localStorage.getItem(GAME_SAVE_KEY));

  return snapshot ? createSaveSummary(snapshot) : null;
}

export function loadPersistedGame(now = Date.now()) {
  if (typeof window === 'undefined') {
    return {
      gameState: createInitialGameState(now),
      report: null,
      summary: null,
    };
  }

  const snapshot = parseSaveSnapshot(window.localStorage.getItem(GAME_SAVE_KEY));

  if (!snapshot) {
    return {
      gameState: createInitialGameState(now),
      report: null,
      summary: null,
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
    summary: createSaveSummary(snapshot),
  };
}

export function persistGame(gameState: GameState, savedAt = Date.now()) {
  if (typeof window === 'undefined') {
    return null;
  }

  const snapshot: SaveSnapshotV1 = {
    version: 1,
    savedAt,
    gameState,
  };

  window.localStorage.setItem(GAME_SAVE_KEY, JSON.stringify(snapshot));

  return createSaveSummary(snapshot);
}

export function clearPersistedGame() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(GAME_SAVE_KEY);
}
