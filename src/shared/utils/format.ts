import type { SafeAreaInsets } from '@/shared/types/platform';

export function formatInsets(insets: SafeAreaInsets): string {
  return `${insets.top}px / ${insets.right}px / ${insets.bottom}px / ${insets.left}px`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

export function formatSignedCompactNumber(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${formatCompactNumber(Math.abs(value))}`;
}

export function formatDurationMs(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }

  if (minutes > 0) {
    return `${minutes}분 ${seconds}초`;
  }

  return `${seconds}초`;
}

function padNumber(value: number) {
  return value.toString().padStart(2, '0');
}

export function formatDateTime(value: number) {
  const date = new Date(value);

  return `${date.getFullYear()}.${padNumber(date.getMonth() + 1)}.${padNumber(date.getDate())} ${padNumber(
    date.getHours(),
  )}:${padNumber(date.getMinutes())}`;
}
