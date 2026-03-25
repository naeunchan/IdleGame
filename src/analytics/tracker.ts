import type { GameEventName, GameEventPayloadMap } from '@/analytics/events';

export function trackGameEvent<Name extends GameEventName>(
  name: Name,
  payload: GameEventPayloadMap[Name],
) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent('gaebalgyeon:track', {
      detail: {
        name,
        payload,
      },
    }),
  );

  if (import.meta.env.DEV) {
    console.info('[analytics]', name, payload);
  }
}

