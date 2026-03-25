import { createInitialGameState } from '@/game-core/engine/createInitialGameState';
import { getCodePerSecond } from '@/game-core/engine/formulas';
import { canHireRole, canUpgradeCompanyScale, changeProcessMode, hireRole, upgradeCompanyScale } from '@/game-core/engine/management';

describe('team growth systems', () => {
  it('upgrades into the first company scale when requirements are met', () => {
    const state = {
      ...createInitialGameState(1_000),
      resources: {
        code: 20,
        focus: 100,
        cash: 120,
        reputation: 1,
      },
      stats: {
        releases: 1,
        totalCodeProduced: 20,
        totalCashEarned: 120,
        totalOfflineMs: 0,
      },
    };

    expect(canUpgradeCompanyScale(state)).toBe(true);

    const next = upgradeCompanyScale(state, 2_000);

    expect(next.companyScaleId).toBe('small-studio');
    expect(next.resources.cash).toBeLessThan(state.resources.cash);
  });

  it('hires unlocked roles after a scale upgrade', () => {
    const state = {
      ...createInitialGameState(1_000),
      companyScaleId: 'small-studio' as const,
      employeeCount: 1,
      resources: {
        code: 20,
        focus: 100,
        cash: 120,
        reputation: 1,
      },
      stats: {
        releases: 1,
        totalCodeProduced: 20,
        totalCashEarned: 120,
        totalOfflineMs: 0,
      },
    };

    expect(canHireRole(state, 'designer')).toBe(true);

    const next = hireRole(state, 'designer', 2_000);

    expect(next.teamMembers).toHaveLength(1);
    expect(next.employeeCount).toBe(2);
  });

  it('process mode and team composition change throughput measurably', () => {
    const state = {
      ...createInitialGameState(1_000),
      companyScaleId: 'product-team' as const,
      employeeCount: 3,
      teamMembers: [
        {
          id: 'designer-1',
          name: '모카',
          breedId: 'golden-retriever' as const,
          roleId: 'designer' as const,
          stage: 'adult' as const,
          hiredAt: 1_500,
        },
        {
          id: 'pm-1',
          name: '토리',
          breedId: 'shiba' as const,
          roleId: 'pm' as const,
          stage: 'adult' as const,
          hiredAt: 1_600,
        },
      ],
      resources: {
        code: 40,
        focus: 100,
        cash: 160,
        reputation: 4,
      },
      stats: {
        releases: 2,
        totalCodeProduced: 40,
        totalCashEarned: 160,
        totalOfflineMs: 0,
      },
    };

    const waterfall = getCodePerSecond(changeProcessMode(state, 'waterfall', 3_000));
    const agile = getCodePerSecond(changeProcessMode(state, 'agile', 3_000));

    expect(agile).toBeGreaterThan(waterfall);
  });
});
