import type { BreedId } from '@/entities/dog';
import type { RoleId } from '@/entities/job';

export interface HiringCandidateDefinition {
  id: string;
  name: string;
  breedId: BreedId;
  role: Exclude<RoleId, 'founder'>;
  cost: number;
  unlockAtProjects: number;
  summary: string;
}

export const hiringCandidateDefinitions: HiringCandidateDefinition[] = [
  {
    id: 'maru-designer',
    name: '마루',
    breedId: 'golden-retriever',
    role: 'designer',
    cost: 82,
    unlockAtProjects: 1,
    summary: '분위기를 정리해 화면과 팀 사기를 같이 끌어올립니다.',
  },
  {
    id: 'bori-pm',
    name: '보리',
    breedId: 'shiba',
    role: 'pm',
    cost: 108,
    unlockAtProjects: 2,
    summary: '우선순위를 재배치해 집중 손실을 줄여줍니다.',
  },
  {
    id: 'tori-qa',
    name: '토리',
    breedId: 'corgi',
    role: 'qa',
    cost: 128,
    unlockAtProjects: 3,
    summary: '릴리즈 직전 오류를 줄여 보상 안정성을 높입니다.',
  },
  {
    id: 'byte-architect',
    name: '바이트',
    breedId: 'border-collie',
    role: 'architect',
    cost: 156,
    unlockAtProjects: 4,
    summary: '구조를 다듬어 장기적인 생산 효율을 올립니다.',
  },
];
