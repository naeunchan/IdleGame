export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PlatformSnapshot {
  width: number;
  height: number;
  insets: SafeAreaInsets;
  isPortrait: boolean;
  isReducedMotion: boolean;
  isVisible: boolean;
  isTossWebView: boolean;
}

export interface PlatformBridge {
  getSnapshot: () => PlatformSnapshot;
  subscribe: (listener: (snapshot: PlatformSnapshot) => void) => () => void;
}

