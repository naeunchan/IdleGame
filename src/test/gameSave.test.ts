import { createInitialGameState } from '@/game-core/engine/createInitialGameState';
import { GAME_SAVE_KEY, loadPersistedGame, parseSaveSnapshot, persistGame } from '@/persistence/gameSave';

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
    persistGame(initial);

    const parsed = parseSaveSnapshot(window.localStorage.getItem(GAME_SAVE_KEY));
    const loaded = loadPersistedGame(12_000);

    expect(parsed?.version).toBe(1);
    expect(loaded.gameState.lastUpdatedAt).toBe(12_000);
    expect(loaded.gameState.resources.code).toBeGreaterThan(initial.resources.code);
  });
});
