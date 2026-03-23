import { formatInsets } from '@/shared/utils/format';

describe('formatInsets', () => {
  it('formats the safe area inset string', () => {
    expect(formatInsets({ top: 10, right: 4, bottom: 18, left: 0 })).toBe('10px / 4px / 18px / 0px');
  });
});
