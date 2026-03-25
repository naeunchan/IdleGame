import type { ProcessModeDefinition } from '@/entities/process';

export const processModeDefinitions = [
  {
    id: 'waterfall',
    name: '폭포형',
    summary: '예측 가능성과 품질을 우선합니다.',
    bonusLabel: '품질 안정 +',
    unlockRequirement: {
      companyStage: 1,
      releases: 0,
      reputation: 0,
      employeeCount: 1,
    },
    modifierProfile: {
      productivityMultiplier: 0.96,
      focusMultiplier: 1.08,
      teamMultiplier: 1.02,
      qualityMultiplier: 1.18,
      stabilityMultiplier: 1.16,
    },
    recommendedRoles: ['architect', 'qa'],
  },
  {
    id: 'spiral',
    name: '나선형',
    summary: '실험과 회고를 반복하며 리스크를 줄입니다.',
    bonusLabel: '리스크 완화 +',
    unlockRequirement: {
      companyStage: 2,
      releases: 1,
      reputation: 2,
      employeeCount: 2,
    },
    modifierProfile: {
      productivityMultiplier: 1.02,
      focusMultiplier: 1.06,
      teamMultiplier: 1.04,
      qualityMultiplier: 1.08,
      stabilityMultiplier: 1.12,
    },
    recommendedRoles: ['pm', 'architect'],
  },
  {
    id: 'agile',
    name: '애자일',
    summary: '짧은 주기로 빠르게 기능을 밀어냅니다.',
    bonusLabel: '생산 속도 +',
    unlockRequirement: {
      companyStage: 1,
      releases: 0,
      reputation: 0,
      employeeCount: 1,
    },
    modifierProfile: {
      productivityMultiplier: 1.14,
      focusMultiplier: 0.98,
      teamMultiplier: 1.08,
      qualityMultiplier: 0.96,
      stabilityMultiplier: 0.98,
    },
    recommendedRoles: ['designer', 'pm'],
  },
] satisfies ProcessModeDefinition[];
