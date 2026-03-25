import type { GameState } from '@/entities/company';

export interface TickInput {
  now: number;
  deltaMs: number;
  isOffline: boolean;
}

export interface SaveSnapshotV1 {
  version: 1;
  savedAt: number;
  state: GameState;
}

