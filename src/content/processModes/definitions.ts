import type { ProcessModeDefinition } from '@/entities/process';

export const processModeDefinitions: ProcessModeDefinition[] = [
  {
    id: 'waterfall',
    name: '폭포형',
    summary: '예측 가능성과 품질을 우선합니다.',
    bonusLabel: '품질 안정 +',
  },
  {
    id: 'spiral',
    name: '나선형',
    summary: '실험과 회고를 반복하며 리스크를 줄입니다.',
    bonusLabel: '리스크 완화 +',
  },
  {
    id: 'agile',
    name: '애자일',
    summary: '짧은 주기로 빠르게 기능을 밀어냅니다.',
    bonusLabel: '생산 속도 +',
  },
];

