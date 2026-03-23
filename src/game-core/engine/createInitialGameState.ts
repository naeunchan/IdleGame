import type { GameState } from '@/entities/company';
import { getNextProject } from '@/game-core/engine/formulas';

export function createInitialGameState(now = Date.now()): GameState {
  return {
    companyName: '개발견 스튜디오',
    founder: {
      name: '멍발자',
      breedId: 'border-collie',
      role: 'founder',
      stage: 'puppy',
    },
    teamMembers: [],
    resources: {
      code: 12,
      focus: 100,
      cash: 30,
      reputation: 0,
    },
    employeeCount: 1,
    companyScaleId: 'garage',
    currentProcess: 'agile',
    activeProject: getNextProject(1),
    stats: {
      releases: 0,
      totalCodeProduced: 12,
      totalCashEarned: 30,
      totalOfflineMs: 0,
    },
    lastUpdatedAt: now,
  };
}
