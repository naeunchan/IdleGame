import { formatCompactNumber, formatDurationMs, formatInsets, formatSignedCompactNumber } from '@/shared/utils/format';

describe('formatInsets', () => {
  it('formats the safe area inset string', () => {
    expect(formatInsets({ top: 10, right: 4, bottom: 18, left: 0 })).toBe('10px / 4px / 18px / 0px');
  });
});

describe('format helpers', () => {
  it('formats compact numbers and signs', () => {
    expect(formatCompactNumber(12.34)).toBe('12.3');
    expect(formatSignedCompactNumber(-3.2)).toBe('-3.2');
    expect(formatSignedCompactNumber(0)).toBe('0');
  });

  it('formats duration text', () => {
    expect(formatDurationMs(18_000)).toBe('18초');
    expect(formatDurationMs(75_000)).toBe('1분 15초');
  });
});
