import type { GameState } from '@/entities/company';
import { createProjectForCycle } from '@/game-core/engine/simulation';

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
      cash: 42,
      reputation: 0,
    },
    team: [],
    employeeCount: 1,
    currentProcess: 'agile',
    currentProject: createProjectForCycle(0),
    completedProjects: 0,
    officeLevel: 1,
    lastUpdatedAt: now,
  };
}
