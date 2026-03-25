import type { GameState } from '@/entities/company';

interface ShouldShowOnboardingInput {
  onboardingDismissed: boolean;
  gameState: GameState;
}

export function shouldShowOnboarding({ onboardingDismissed, gameState }: ShouldShowOnboardingInput) {
  return !onboardingDismissed && gameState.stats.releases === 0 && gameState.teamMembers.length === 0;
}
