import { getOnboardingGuide } from '@/features/onboarding/getOnboardingGuide';
import { createInitialGameState } from '@/game-core/engine/createInitialGameState';
import {
  createProjectForCycle,
  getAvailableHiringCandidates,
  hireCandidate,
  switchProcessMode,
} from '@/game-core/engine/simulation';

describe('getOnboardingGuide', () => {
  it('starts by guiding the player toward the first delivery', () => {
    const guide = getOnboardingGuide(createInitialGameState(0));

    expect(guide.currentGoal.id).toBe('first-project');
    expect(guide.steps[0].status).toBe('current');
    expect(guide.steps[1].status).toBe('locked');
  });

  it('moves the next goal to hiring after the first delivery', () => {
    const initial = createInitialGameState(0);
    const deliveredOnce = {
      ...initial,
      completedProjects: 1,
      currentProject: createProjectForCycle(1),
      resources: {
        ...initial.resources,
        cash: 82,
      },
    };

    const guide = getOnboardingGuide(deliveredOnce);

    expect(guide.currentGoal.id).toBe('first-hire');
    expect(guide.steps[0].status).toBe('done');
    expect(guide.steps[1].status).toBe('current');
  });

  it('advances from hiring to process comparison and office growth', () => {
    const initial = createInitialGameState(0);
    const readyToHire = {
      ...initial,
      completedProjects: 1,
      currentProject: createProjectForCycle(1),
      resources: {
        ...initial.resources,
        cash: 140,
      },
    };
    const firstCandidate = getAvailableHiringCandidates(readyToHire)[0];
    const hired = hireCandidate(readyToHire, firstCandidate.id);
    const processGuide = getOnboardingGuide(hired);
    const shifted = switchProcessMode(hired, 'waterfall');
    const officeGuide = getOnboardingGuide(shifted);

    expect(processGuide.currentGoal.id).toBe('first-process-shift');
    expect(processGuide.steps[1].status).toBe('done');
    expect(officeGuide.currentGoal.id).toBe('office-growth');
    expect(officeGuide.steps[2].status).toBe('done');
  });
});
