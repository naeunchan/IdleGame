import type { TeamMember } from '@/entities/company';
import { createInitialGameState } from '@/game-core/engine/createInitialGameState';
import { shouldShowOnboarding } from '@/features/onboarding/visibility';

describe('shouldShowOnboarding', () => {
  it('shows the guide during the opening session until the first hire', () => {
    const state = createInitialGameState(0);

    expect(
      shouldShowOnboarding({
        onboardingDismissed: false,
        gameState: state,
      }),
    ).toBe(true);
  });

  it('keeps the guide visible after save recovery if the player is still in the opening state', () => {
    const recoveredOpeningState = {
      ...createInitialGameState(0),
      resources: {
        code: 64,
        cash: 96,
        focus: 18,
        reputation: 0.9,
      },
    };

    expect(
      shouldShowOnboarding({
        onboardingDismissed: false,
        gameState: recoveredOpeningState,
      }),
    ).toBe(true);
  });

  it('hides the guide after the player dismisses it or hires the first teammate', () => {
    const initialState = createInitialGameState(0);
    const firstHire: TeamMember = {
      id: 'member-1',
      name: '도기 디자이너',
      breedId: 'golden-retriever',
      roleId: 'designer',
      stage: 'adult',
      hiredAt: 12_000,
    };
    const staffedState = {
      ...initialState,
      employeeCount: 2,
      teamMembers: [firstHire],
    };

    expect(
      shouldShowOnboarding({
        onboardingDismissed: true,
        gameState: initialState,
      }),
    ).toBe(false);

    expect(
      shouldShowOnboarding({
        onboardingDismissed: false,
        gameState: staffedState,
      }),
    ).toBe(false);
  });
});
