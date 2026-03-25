import { loadGameState } from '@/persistence/storage';

describe('loadGameState', () => {
  it('falls back safely when save data is corrupted', () => {
    window.localStorage.setItem('gaebalgyeon-kiugi/save', '{broken-json');

    const hydrated = loadGameState(1234);

    expect(hydrated.source).toBe('save-reset');
    expect(hydrated.state.lastUpdatedAt).toBe(1234);
  });
});
