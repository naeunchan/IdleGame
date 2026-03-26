import type { PropsWithChildren } from 'react';
import { useEffect, useMemo } from 'react';

import { createPlatformBridge } from '@/platform/appsInToss/bridge';
import { persistGame } from '@/persistence/gameSave';
import { useAppStore } from '@/app/providers/useAppStore';

export function AppProviders({ children }: PropsWithChildren) {
  const bridge = useMemo(() => createPlatformBridge(), []);
  const setBridge = useAppStore((state) => state.setBridge);
  const setPlatform = useAppStore((state) => state.setPlatform);
  const gameState = useAppStore((state) => state.gameState);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const hydrateGame = useAppStore((state) => state.hydrateGame);
  const tick = useAppStore((state) => state.tick);
  const isVisible = useAppStore((state) => state.platform.isVisible);

  useEffect(() => {
    setBridge(bridge);
    setPlatform(bridge.getSnapshot());

    return bridge.subscribe((snapshot) => {
      setPlatform(snapshot);
    });
  }, [bridge, setBridge, setPlatform]);

  useEffect(() => {
    hydrateGame(Date.now());
  }, [hydrateGame]);

  useEffect(() => {
    if (!hasHydrated || !isVisible) {
      return;
    }

    tick(Date.now());

    const intervalId = window.setInterval(() => {
      tick(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasHydrated, isVisible, tick]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    persistGame(gameState);
  }, [gameState, hasHydrated]);

  return children;
}
