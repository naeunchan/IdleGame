import { create } from 'zustand';

import type { GameState } from '@/entities/company';
import { advanceGameState } from '@/game-core/engine/reducer';
import { createInitialGameState } from '@/game-core/engine/createInitialGameState';
import type { HydrationSource } from '@/persistence/storage';
import type { PlatformBridge, PlatformSnapshot } from '@/shared/types/platform';

interface AppStoreState {
  bridge: PlatformBridge | null;
  platform: PlatformSnapshot;
  gameState: GameState;
  hydrationSource: HydrationSource;
  isHydrated: boolean;
  lastSavedAt: number | null;
  setBridge: (bridge: PlatformBridge) => void;
  setPlatform: (snapshot: PlatformSnapshot) => void;
  setGameState: (state: GameState, source?: HydrationSource) => void;
  tickGame: (now: number) => void;
  markSaved: (savedAt: number) => void;
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
  hydrationSource: 'fresh-start',
  isHydrated: false,
  lastSavedAt: null,
  setBridge: (bridge) => set({ bridge }),
  setPlatform: (platform) => set({ platform }),
  setGameState: (gameState, source = 'fresh-start') =>
    set({
      gameState,
      hydrationSource: source,
      isHydrated: true,
    }),
  tickGame: (now) =>
    set((state) => {
      const deltaMs = Math.max(0, now - state.gameState.lastUpdatedAt);

      if (deltaMs < 120) {
        return state;
      }

      return {
        gameState: advanceGameState(state.gameState, {
          now,
          deltaMs,
          isOffline: deltaMs >= 1500,
        }),
      };
    }),
  markSaved: (lastSavedAt) => set({ lastSavedAt }),
}));
