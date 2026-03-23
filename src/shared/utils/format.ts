import type { SafeAreaInsets } from '@/shared/types/platform';

export function formatInsets(insets: SafeAreaInsets): string {
  return `${insets.top}px / ${insets.right}px / ${insets.bottom}px / ${insets.left}px`;
}

