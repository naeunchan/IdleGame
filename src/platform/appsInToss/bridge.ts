import { readPlatformSnapshot } from '@/platform/appsInToss/viewport';
import type { PlatformBridge, PlatformSnapshot } from '@/shared/types/platform';

export function createPlatformBridge(): PlatformBridge {
  return {
    getSnapshot: readPlatformSnapshot,
    subscribe(listener) {
      if (typeof window === 'undefined') {
        return () => undefined;
      }

      const notify = () => {
        listener(readPlatformSnapshot());
      };

      const onVisibility = () => notify();

      window.addEventListener('resize', notify);
      window.addEventListener('orientationchange', notify);
      document.addEventListener('visibilitychange', onVisibility);

      return () => {
        window.removeEventListener('resize', notify);
        window.removeEventListener('orientationchange', notify);
        document.removeEventListener('visibilitychange', onVisibility);
      };
    },
  };
}

export function createBridgeSnapshot(bridge: PlatformBridge): PlatformSnapshot {
  return bridge.getSnapshot();
}

