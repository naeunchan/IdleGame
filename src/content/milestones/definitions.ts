import type { GameState } from '@/entities/company';
import type { MilestoneDefinition, MilestoneId, MilestoneRequirementType } from '@/entities/milestone';

export interface MilestoneProgress {
  definition: MilestoneDefinition;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
  progressText: string;
  isComplete: boolean;
}

export interface MilestoneTimelineItem extends MilestoneProgress {
  status: 'done' | 'current' | 'locked';
}

export const milestoneDefinitions: MilestoneDefinition[] = [
  {
    id: 'steady-shipments',
    name: '납품 루프 안정화',
    summary: '작은 납품을 두 번 마쳐 반복 루프를 안정권에 올립니다.',
    requirementType: 'projects',
    targetValue: 2,
    rewardLabel: '후속 의뢰 루틴 정착',
    unlocks: ['채용 후보 흐름 안정화'],
  },
  {
    id: 'first-team-huddle',
    name: '첫 스탠드업',
    summary: '창업견 혼자 일하던 자리에서 첫 팀원과 협업 루틴을 시작합니다.',
    requirementType: 'team',
    targetValue: 2,
    rewardLabel: '리프레시 스테이션 해금',
    unlocks: ['리프레시 스테이션 업그레이드'],
  },
  {
    id: 'local-buzz',
    name: '제품 반응 확보',
    summary: '평판을 쌓아 더 좋은 의뢰와 릴리즈 보상을 받을 준비를 합니다.',
    requirementType: 'reputation',
    targetValue: 8,
    rewardLabel: '릴리즈 아카이브 해금',
    unlocks: ['릴리즈 아카이브 업그레이드'],
  },
  {
    id: 'toolchain-stack',
    name: '개발 환경 정착',
    summary: '개발 시스템을 세 단계 이상 적용해 장기 운영 기반을 만듭니다.',
    requirementType: 'upgrade-levels',
    targetValue: 3,
    rewardLabel: '시스템 투자 루프 완성',
    unlocks: ['업그레이드 운영 루프 고착'],
  },
  {
    id: 'neighborhood-studio',
    name: '제품 팀 도약',
    summary: '다섯 번째 납품까지 달성해 더 큰 제품 팀으로 확장할 준비를 마칩니다.',
    requirementType: 'projects',
    targetValue: 5,
    rewardLabel: '중기 성장권 진입',
    unlocks: ['제품 팀 플로어 운영 안정화'],
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getTotalUpgradeLevels(state: GameState) {
  return Object.values(state.workshopUpgrades ?? {}).reduce((total, level) => total + (level ?? 0), 0);
}

function getRequirementValue(state: GameState, requirementType: MilestoneRequirementType) {
  if (requirementType === 'projects') {
    return state.completedProjects;
  }

  if (requirementType === 'team') {
    return state.employeeCount;
  }

  if (requirementType === 'reputation') {
    return state.resources.reputation;
  }

  return getTotalUpgradeLevels(state);
}

function getRequirementUnit(requirementType: MilestoneRequirementType) {
  if (requirementType === 'projects') {
    return '납품';
  }

  if (requirementType === 'team') {
    return '마리';
  }

  if (requirementType === 'reputation') {
    return '평판';
  }

  return '단계';
}

export function getMilestoneProgress(state: GameState, definition: MilestoneDefinition): MilestoneProgress {
  const currentValue = getRequirementValue(state, definition.requirementType);
  const targetValue = definition.targetValue;
  const unit = getRequirementUnit(definition.requirementType);

  return {
    definition,
    currentValue,
    targetValue,
    progressPercent: clamp((currentValue / targetValue) * 100, 0, 100),
    progressText: `${Math.min(currentValue, targetValue)} / ${targetValue} ${unit}`,
    isComplete: currentValue >= targetValue,
  };
}

export function isMilestoneReached(state: GameState, milestoneId: MilestoneId) {
  const definition = milestoneDefinitions.find((item) => item.id === milestoneId);

  if (!definition) {
    return false;
  }

  return getMilestoneProgress(state, definition).isComplete;
}

export function getNextMilestone(state: GameState) {
  return milestoneDefinitions
    .map((definition) => getMilestoneProgress(state, definition))
    .find((progress) => !progress.isComplete) ?? null;
}

export function getMilestoneTimeline(state: GameState): MilestoneTimelineItem[] {
  const progressList = milestoneDefinitions.map((definition) => getMilestoneProgress(state, definition));
  const firstIncompleteIndex = progressList.findIndex((progress) => !progress.isComplete);
  const activeIndex = firstIncompleteIndex === -1 ? progressList.length - 1 : firstIncompleteIndex;

  return progressList.map((progress, index) => ({
    ...progress,
    status: progress.isComplete ? 'done' : index === activeIndex ? 'current' : 'locked',
  }));
}
