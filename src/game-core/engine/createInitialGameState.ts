import type { GameState } from '@/entities/company';

export function createInitialGameState(now = Date.now()): GameState {
  return {
    companyName: '개발견 스튜디오',
    founder: {
      name: '멍발자',
      breedId: 'border-collie',
      role: 'founder',
      stage: 'puppy',
    },
    resources: {
      code: 12,
      focus: 100,
      cash: 30,
      reputation: 0,
    },
    employeeCount: 1,
    currentProcess: 'agile',
    lastUpdatedAt: now,
  };
}

