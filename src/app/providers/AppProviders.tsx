import type { PropsWithChildren } from 'react';
import { startTransition, useEffect, useEffectEvent, useMemo, useRef } from 'react';

import { createPlatformBridge } from '@/platform/appsInToss/bridge';
import { ACTIVE_TICK_MS } from '@/game-core/engine/constants';
import { loadGameState, persistGameState } from '@/persistence/storage';
import { useAppStore } from '@/app/providers/useAppStore';

export function AppProviders({ children }: PropsWithChildren) {
  const bridge = useMemo(() => createPlatformBridge(), []);
  const setBridge = useAppStore((state) => state.setBridge);
  const setPlatform = useAppStore((state) => state.setPlatform);
  const setGameState = useAppStore((state) => state.setGameState);
  const tickGame = useAppStore((state) => state.tickGame);
  const markSaved = useAppStore((state) => state.markSaved);
  const gameState = useAppStore((state) => state.gameState);
  const isHydrated = useAppStore((state) => state.isHydrated);
  const latestStateRef = useRef(gameState);

  latestStateRef.current = gameState;

  const persistLatestState = useEffectEvent(() => {
    const savedAt = Date.now();
    persistGameState(latestStateRef.current, savedAt);
    markSaved(savedAt);
  });

  useEffect(() => {
    setBridge(bridge);
    setPlatform(bridge.getSnapshot());

    return bridge.subscribe((snapshot) => {
      setPlatform(snapshot);
    });
  }, [bridge, setBridge, setPlatform]);

  useEffect(() => {
    const hydrated = loadGameState(Date.now());
    setGameState(hydrated.state, hydrated.source);
  }, [setGameState]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const intervalId = window.setInterval(() => {
      startTransition(() => {
        tickGame(Date.now());
      });
    }, ACTIVE_TICK_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isHydrated, tickGame]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const intervalId = window.setInterval(() => {
      persistLatestState();
    }, 2000);

    const handlePageHide = () => {
      persistLatestState();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        persistLatestState();
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isHydrated, persistLatestState]);

  return children;
}
