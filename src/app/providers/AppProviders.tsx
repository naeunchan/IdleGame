import type { PropsWithChildren } from 'react';
import { useEffect, useMemo } from 'react';

import { createPlatformBridge } from '@/platform/appsInToss/bridge';
import { useAppStore } from '@/app/providers/useAppStore';

export function AppProviders({ children }: PropsWithChildren) {
  const bridge = useMemo(() => createPlatformBridge(), []);
  const setBridge = useAppStore((state) => state.setBridge);
  const setPlatform = useAppStore((state) => state.setPlatform);

  useEffect(() => {
    setBridge(bridge);
    setPlatform(bridge.getSnapshot());

    return bridge.subscribe((snapshot) => {
      setPlatform(snapshot);
    });
  }, [bridge, setBridge, setPlatform]);

  return children;
}

