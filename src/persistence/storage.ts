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

function normalizeState(candidate: Partial<GameState>, now: number): GameState {
  const fallback = createInitialGameState(now);

  const teamMembers = Array.isArray(candidate.teamMembers) ? candidate.teamMembers : fallback.teamMembers;

  return {
    ...fallback,
    ...candidate,
    founder: {
      ...fallback.founder,
      ...candidate.founder,
    },
    teamMembers,
    resources: {
      ...fallback.resources,
      ...candidate.resources,
    },
    activeProject: {
      ...fallback.activeProject,
      ...candidate.activeProject,
    },
    stats: {
      ...fallback.stats,
      ...candidate.stats,
    },
    employeeCount:
      typeof candidate.employeeCount === 'number' ? candidate.employeeCount : 1 + teamMembers.length,
    companyScaleId: candidate.companyScaleId ?? fallback.companyScaleId,
    lastUpdatedAt: candidate.lastUpdatedAt ?? now,
  };
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
      state: applyOfflineProgress(normalizeState(parsed.state, parsed.savedAt), now),
      source: 'save-recovered',
    };
  } catch {
    return {
      state: createInitialGameState(now),
      source: 'save-reset',
    };
  }
}
