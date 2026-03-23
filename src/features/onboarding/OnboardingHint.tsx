import { useAppStore } from '@/app/providers/useAppStore';

export function OnboardingHint() {
  const hydrationSource = useAppStore((state) => state.hydrationSource);
  const onboardingDismissed = useAppStore((state) => state.onboardingDismissed);
  const dismissOnboarding = useAppStore((state) => state.dismissOnboarding);
  const gameState = useAppStore((state) => state.gameState);

  if (hydrationSource !== 'fresh-start' || onboardingDismissed || gameState.stats.releases > 0) {
    return null;
  }

  return (
    <aside className="floating-hint" role="note" aria-label="첫 세션 안내">
      <div className="floating-hint__eyebrow">Guide</div>
      <strong>첫 세션은 위에서 아래로 읽으면 됩니다.</strong>
      <ol>
        <li>프로세스를 먼저 고르고, 현재 회사 운영 스타일을 정합니다.</li>
        <li>규모를 키운 뒤 첫 역할을 고용해 팀 버프를 엽니다.</li>
        <li>저장 카드가 바뀌는지 보고, 앱을 닫아도 진행이 남는지 체감합니다.</li>
      </ol>
      <button className="floating-hint__cta" onClick={dismissOnboarding} type="button">
        시작하기
      </button>
    </aside>
  );
}
