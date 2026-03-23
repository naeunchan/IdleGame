import type { RoleDefinition } from '@/entities/job';

export const roleDefinitions: RoleDefinition[] = [
  {
    id: 'founder',
    name: '창업 개발견',
    lane: 'core',
    summary: '초기 코드를 책임지고 회사를 시작합니다.',
  },
  {
    id: 'designer',
    name: '디자인 견',
    lane: 'product',
    summary: '화면과 감성을 책임집니다.',
  },
  {
    id: 'pm',
    name: 'PM 견',
    lane: 'product',
    summary: '우선순위를 조율하고 속도를 끌어올립니다.',
  },
  {
    id: 'architect',
    name: '아키텍트 견',
    lane: 'platform',
    summary: '장기 생산성과 구조 안정성을 끌어올립니다.',
  },
  {
    id: 'qa',
    name: 'QA 견',
    lane: 'release',
    summary: '배포 직전 사고를 줄여줍니다.',
  },
];

