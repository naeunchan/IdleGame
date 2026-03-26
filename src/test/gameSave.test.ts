import { createInitialGameState } from '@/game-core/engine/createInitialGameState';
import {
  clearPersistedGame,
  GAME_SAVE_KEY,
  loadPersistedGame,
  parseSaveSnapshot,
  persistGame,
  readPersistedGameSummary,
} from '@/persistence/gameSave';

describe('game save persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('rejects corrupted snapshots and falls back to a fresh game', () => {
    window.localStorage.setItem(GAME_SAVE_KEY, '{"broken":true');

    const loaded = loadPersistedGame(5000);

    expect(loaded.gameState.companyName).toBe('개발견 스튜디오');
    expect(loaded.report).toBeNull();
  });

  it('parses valid snapshots and restores progress', () => {
    const initial = createInitialGameState(1000);
    persistGame(initial, 1000);

    const parsed = parseSaveSnapshot(window.localStorage.getItem(GAME_SAVE_KEY));
    const loaded = loadPersistedGame(12_000);

    expect(parsed?.version).toBe(1);
    expect(loaded.summary?.savedAt).toBe(1000);
    expect(loaded.gameState.lastUpdatedAt).toBe(12_000);
    expect(loaded.gameState.resources.code).toBeGreaterThan(initial.resources.code);
  });

  it('returns a compact save summary for the current slot', () => {
    const initial = createInitialGameState(2_500);
    const summary = persistGame(initial, 4_000);

    expect(summary).toEqual({
      version: 1,
      savedAt: 4_000,
      companyName: '개발견 스튜디오',
      employeeCount: 1,
      completedProjects: 0,
      cash: 42,
      reputation: 0,
    });
    expect(readPersistedGameSummary()).toEqual(summary);
  });

  it('clears the current save slot', () => {
    const initial = createInitialGameState(1000);
    persistGame(initial, 1000);

    clearPersistedGame();

    expect(window.localStorage.getItem(GAME_SAVE_KEY)).toBeNull();
    expect(readPersistedGameSummary()).toBeNull();
  });

  it('fills missing modern state fields when loading an older save', () => {
    const initial = createInitialGameState(1000);
    const legacyState = JSON.parse(JSON.stringify(initial)) as Record<string, unknown>;

    delete legacyState.stats;
    delete legacyState.contractBoard;
    delete legacyState.nextContractSerial;
    delete legacyState.communityPerks;

    window.localStorage.setItem(
      GAME_SAVE_KEY,
      JSON.stringify({
        version: 1,
        savedAt: 1000,
        gameState: legacyState,
      }),
    );

    const loaded = loadPersistedGame(3000);

    expect(loaded.gameState.stats.totalCashEarned).toBeGreaterThanOrEqual(0);
    expect(loaded.gameState.contractBoard).toHaveLength(3);
    expect(loaded.gameState.nextContractSerial).toBeGreaterThanOrEqual(3);
    expect(loaded.gameState.communityPerks).toEqual({});
  });
});
