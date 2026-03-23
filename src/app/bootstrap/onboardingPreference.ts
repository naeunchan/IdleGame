const STORAGE_KEY = 'gaebalgyeon-kiugi/ui/onboarding-dismissed';

export function loadOnboardingDismissed() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

export function saveOnboardingDismissed(value: boolean) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, String(value));
}

