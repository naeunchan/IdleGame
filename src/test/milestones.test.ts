import {
  getMilestoneTimeline,
  getNextMilestone,
  isMilestoneReached,
} from '@/content/milestones/definitions';
import { createInitialGameState } from '@/game-core/engine/createInitialGameState';

describe('milestone progress', () => {
  it('starts from the first incomplete milestone', () => {
    const initial = createInitialGameState(0);
    const nextMilestone = getNextMilestone(initial);
    const timeline = getMilestoneTimeline(initial);

    expect(nextMilestone?.definition.id).toBe('steady-shipments');
    expect(timeline[0].status).toBe('current');
    expect(timeline[1].status).toBe('locked');
  });

  it('marks later milestones complete as the company grows', () => {
    const initial = createInitialGameState(0);
    const progressed = {
      ...initial,
      completedProjects: 4,
      employeeCount: 2,
      resources: {
        ...initial.resources,
        reputation: 9,
      },
      workshopUpgrades: {
        'warm-desk': 2,
        'snack-cart': 1,
      },
    };

    const nextMilestone = getNextMilestone(progressed);

    expect(isMilestoneReached(progressed, 'steady-shipments')).toBe(true);
    expect(isMilestoneReached(progressed, 'first-team-huddle')).toBe(true);
    expect(isMilestoneReached(progressed, 'local-buzz')).toBe(true);
    expect(isMilestoneReached(progressed, 'toolchain-stack')).toBe(true);
    expect(nextMilestone?.definition.id).toBe('neighborhood-studio');
  });
});
