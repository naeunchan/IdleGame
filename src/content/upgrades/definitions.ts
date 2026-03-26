import type {
  WorkshopUpgradeDefinition,
  WorkshopUpgradeEffects,
  WorkshopUpgradeId,
  WorkshopUpgradeLevels,
} from '@/entities/upgrade';

export const workshopUpgradeDefinitions: WorkshopUpgradeDefinition[] = [
  {
    id: 'warm-desk',
    name: '햇살 책상',
    summary: '책상 배치를 다듬어 기능 생산 속도를 더 안정적으로 끌어올립니다.',
    bonusLabel: '생산',
    bonusType: 'production',
    effectPerLevel: 0.08,
    maxLevel: 3,
    baseCost: 48,
    costMultiplier: 1.65,
  },
  {
    id: 'snack-cart',
    name: '간식 수레',
    summary: '당 충전 동선을 줄여 집중 회복 흐름을 더 부드럽게 만듭니다.',
    unlockMilestoneId: 'first-team-huddle',
    bonusLabel: '집중 회복',
    bonusType: 'focus',
    effectPerLevel: 0.18,
    maxLevel: 3,
    baseCost: 52,
    costMultiplier: 1.58,
  },
  {
    id: 'showcase-wall',
    name: '성과 진열장',
    summary: '지난 납품 사례를 정리해 다음 의뢰의 보상을 더 크게 만듭니다.',
    unlockMilestoneId: 'local-buzz',
    bonusLabel: '보상',
    bonusType: 'reward',
    effectPerLevel: 0.06,
    maxLevel: 3,
    baseCost: 64,
    costMultiplier: 1.72,
  },
];

export function getWorkshopUpgradeLevel(
  levels: WorkshopUpgradeLevels | undefined,
  upgradeId: WorkshopUpgradeId,
) {
  return levels?.[upgradeId] ?? 0;
}

export function getWorkshopUpgradeCost(
  definition: WorkshopUpgradeDefinition,
  currentLevel: number,
) {
  if (currentLevel >= definition.maxLevel) {
    return null;
  }

  return Math.round(definition.baseCost * definition.costMultiplier ** currentLevel);
}

export function getWorkshopUpgradeEffects(
  levels: WorkshopUpgradeLevels | undefined,
): WorkshopUpgradeEffects {
  return workshopUpgradeDefinitions.reduce<WorkshopUpgradeEffects>(
    (acc, definition) => {
      const level = getWorkshopUpgradeLevel(levels, definition.id);
      const totalEffect = definition.effectPerLevel * level;

      if (definition.bonusType === 'production') {
        acc.productionMultiplierBonus += totalEffect;
      }

      if (definition.bonusType === 'focus') {
        acc.focusRecoveryBonus += totalEffect;
      }

      if (definition.bonusType === 'reward') {
        acc.rewardMultiplierBonus += totalEffect;
      }

      return acc;
    },
    {
      productionMultiplierBonus: 0,
      focusRecoveryBonus: 0,
      rewardMultiplierBonus: 0,
    },
  );
}
