import type { BreedDefinition } from '@/entities/dog';

export const breedDefinitions: BreedDefinition[] = [
  {
    id: 'border-collie',
    name: '보더콜리',
    title: '집중 개발견',
    specialty: '생산성',
    passive: '혼자서도 빠르게 기능을 찍어냅니다.',
    focusBonus: 6,
    productivityBonus: 14,
    teamBuffBonus: 0,
    qualityBonus: 4,
  },
  {
    id: 'shiba',
    name: '시바',
    title: '몰입 개발견',
    specialty: '집중력',
    passive: '컨텍스트 스위칭 피해를 덜 받습니다.',
    focusBonus: 16,
    productivityBonus: 8,
    teamBuffBonus: 0,
    qualityBonus: 2,
  },
  {
    id: 'golden-retriever',
    name: '골든리트리버',
    title: '팀 케어견',
    specialty: '팀 버프',
    passive: '팀 사기를 올려 전체 효율을 밀어줍니다.',
    focusBonus: 8,
    productivityBonus: 6,
    teamBuffBonus: 15,
    qualityBonus: 6,
  },
  {
    id: 'corgi',
    name: '코기',
    title: 'QA 견',
    specialty: '품질',
    passive: '릴리즈 직전 버그를 잘 잡아냅니다.',
    focusBonus: 4,
    productivityBonus: 4,
    teamBuffBonus: 4,
    qualityBonus: 18,
  },
];

