import { create } from 'zustand';

import type { GameState } from '@/entities/company';
import { createInitialGameState } from '@/game-core/engine/createInitialGameState';
import type { PlatformBridge, PlatformSnapshot } from '@/shared/types/platform';

interface AppStoreState {
  bridge: PlatformBridge | null;
  platform: PlatformSnapshot;
  gameState: GameState;
  setBridge: (bridge: PlatformBridge) => void;
  setPlatform: (snapshot: PlatformSnapshot) => void;
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
  setBridge: (bridge) => set({ bridge }),
  setPlatform: (platform) => set({ platform }),
}));

