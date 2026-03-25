import { loadOnboardingDismissed, saveOnboardingDismissed } from '@/app/bootstrap/onboardingPreference';

describe('onboarding preference', () => {
  it('persists the onboarding dismissal flag', () => {
    expect(loadOnboardingDismissed()).toBe(false);

    saveOnboardingDismissed(true);

    expect(loadOnboardingDismissed()).toBe(true);
  });
});
