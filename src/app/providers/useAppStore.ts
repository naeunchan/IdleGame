import { create } from 'zustand';

import type { GameState, ProgressReport } from '@/entities/company';
import { createInitialGameState } from '@/game-core/engine/createInitialGameState';
import {
  advanceGameState,
  hireCandidate,
  runFocusSession,
  switchProcessMode,
  takeSnackBreak,
} from '@/game-core/engine/simulation';
import { loadPersistedGame } from '@/persistence/gameSave';
import type { PlatformBridge, PlatformSnapshot } from '@/shared/types/platform';
import type { ProcessMode } from '@/entities/process';

interface AppStoreState {
  bridge: PlatformBridge | null;
  platform: PlatformSnapshot;
  gameState: GameState;
  hasHydrated: boolean;
  lastProgressReport: ProgressReport | null;
  setBridge: (bridge: PlatformBridge) => void;
  setPlatform: (snapshot: PlatformSnapshot) => void;
  hydrateGame: (now?: number) => void;
  tick: (now?: number) => void;
  hireTeamMember: (candidateId: string) => void;
  changeProcessMode: (processMode: ProcessMode) => void;
  startFocusSession: () => void;
  buySnackBreak: () => void;
  dismissProgressReport: () => void;
}

const defaultPlatform: PlatformSnapshot = {
  width: 390,
  height: 844,
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  isPortrait: true,
  isReducedMotion: false,
  isVisible: true,
  isTossWebView: false,
};

export const useAppStore = create<AppStoreState>((set) => ({
  bridge: null,
  platform: defaultPlatform,
  gameState: createInitialGameState(),
  hasHydrated: false,
  lastProgressReport: null,
  setBridge: (bridge) => set({ bridge }),
  setPlatform: (platform) => set({ platform }),
  hydrateGame: (now = Date.now()) =>
    set((state) => {
      if (state.hasHydrated) {
        return state;
      }

      const hydrated = loadPersistedGame(now);

      return {
        gameState: hydrated.gameState,
        hasHydrated: true,
        lastProgressReport: hydrated.report,
      };
    }),
  tick: (now = Date.now()) =>
    set((state) => {
      if (!state.hasHydrated) {
        return state;
      }

      const advanced = advanceGameState(state.gameState, {
        now,
        deltaMs: now - state.gameState.lastUpdatedAt,
        isOffline: false,
      });

      return {
        gameState: advanced.gameState,
      };
    }),
  hireTeamMember: (candidateId) =>
    set((state) => ({
      gameState: hireCandidate(state.gameState, candidateId),
    })),
  changeProcessMode: (processMode) =>
    set((state) => ({
      gameState: switchProcessMode(state.gameState, processMode),
    })),
  startFocusSession: () =>
    set((state) => ({
      gameState: runFocusSession(state.gameState),
    })),
  buySnackBreak: () =>
    set((state) => ({
      gameState: takeSnackBreak(state.gameState),
    })),
  dismissProgressReport: () => set({ lastProgressReport: null }),
}));
