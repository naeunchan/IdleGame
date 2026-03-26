import { isMilestoneReached } from '@/content/milestones/definitions';
import type { GameState } from '@/entities/company';
import type {
  CommunityPerkDefinition,
  CommunityPerkEffects,
  CommunityPerkId,
  CommunityPerkLevels,
} from '@/entities/community';

export const communityPerkDefinitions: CommunityPerkDefinition[] = [
  {
    id: 'local-ambassadors',
    name: '동네 홍보견',
    summary: '커뮤니티에서 우리 작업실을 소개해 계약 보상을 더 두툼하게 받습니다.',
    bonusLabel: '계약 보상',
    bonusType: 'contract',
    effectPerLevel: 0.12,
    maxLevel: 3,
    baseCost: 6,
    costMultiplier: 1.85,
  },
  {
    id: 'quiet-library',
    name: '조용한 자료실',
    summary: '근처 자료실을 빌려 집중 회복 흐름을 더 안정적으로 만듭니다.',
    bonusLabel: '집중 회복',
    bonusType: 'focus',
    effectPerLevel: 0.14,
    maxLevel: 3,
    baseCost: 5,
    costMultiplier: 1.74,
  },
  {
    id: 'open-source-club',
    name: '오픈소스 모임',
    summary: '이웃 개발 모임에서 팁을 얻어 생산 속도를 조금씩 높입니다.',
    unlockMilestoneId: 'local-buzz',
    bonusLabel: '생산',
    bonusType: 'production',
    effectPerLevel: 0.07,
    maxLevel: 3,
    baseCost: 8,
    costMultiplier: 1.92,
  },
];

export function getCommunityPerkLevel(levels: CommunityPerkLevels | undefined, perkId: CommunityPerkId) {
  return levels?.[perkId] ?? 0;
}

export function getCommunityPerkCost(definition: CommunityPerkDefinition, currentLevel: number) {
  if (currentLevel >= definition.maxLevel) {
    return null;
  }

  return Math.round(definition.baseCost * definition.costMultiplier ** currentLevel);
}

export function isCommunityPerkUnlocked(state: GameState, definition: CommunityPerkDefinition) {
  return definition.unlockMilestoneId ? isMilestoneReached(state, definition.unlockMilestoneId) : true;
}

export function getCommunityPerkEffects(levels: CommunityPerkLevels | undefined): CommunityPerkEffects {
  return communityPerkDefinitions.reduce<CommunityPerkEffects>(
    (acc, definition) => {
      const level = getCommunityPerkLevel(levels, definition.id);
      const totalEffect = definition.effectPerLevel * level;

      if (definition.bonusType === 'production') {
        acc.productionMultiplierBonus += totalEffect;
      }

      if (definition.bonusType === 'focus') {
        acc.focusRecoveryBonus += totalEffect;
      }

      if (definition.bonusType === 'contract') {
        acc.contractRewardMultiplierBonus += totalEffect;
      }

      return acc;
    },
    {
      productionMultiplierBonus: 0,
      focusRecoveryBonus: 0,
      contractRewardMultiplierBonus: 0,
    },
  );
}
