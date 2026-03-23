import type { PlatformSnapshot, SafeAreaInsets } from '@/shared/types/platform';

const DEFAULT_WIDTH = 390;
const DEFAULT_HEIGHT = 844;

function readInset(cssVariable: string): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVariable).trim();
  const parsed = Number.parseFloat(value.replace('px', ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function readSafeAreaInsets(): SafeAreaInsets {
  return {
    top: readInset('--safe-top'),
    right: readInset('--safe-right'),
    bottom: readInset('--safe-bottom'),
    left: readInset('--safe-left'),
  };
}

function detectTossWebView(userAgent: string): boolean {
  const normalized = userAgent.toLowerCase();
  return normalized.includes('toss') || normalized.includes('apps-in-toss');
}

export function readPlatformSnapshot(): PlatformSnapshot {
  if (typeof window === 'undefined') {
    return {
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
      isPortrait: true,
      isReducedMotion: false,
      isVisible: true,
      isTossWebView: false,
    };
  }

  const width = window.innerWidth || DEFAULT_WIDTH;
  const height = window.innerHeight || DEFAULT_HEIGHT;

  return {
    width,
    height,
    insets: readSafeAreaInsets(),
    isPortrait: height >= width,
    isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isVisible: document.visibilityState !== 'hidden',
    isTossWebView: detectTossWebView(window.navigator.userAgent),
  };
}

