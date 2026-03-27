import type { OnboardingGuide } from '@/features/onboarding/getOnboardingGuide';

interface OnboardingHintProps {
  guide: OnboardingGuide;
}

const statusLabel = {
  done: '완료',
  current: '지금',
  locked: '다음',
} as const;

export function OnboardingHint({ guide }: OnboardingHintProps) {
  return (
    <aside className="floating-hint">
      <div className="floating-hint__header">
        <span className="floating-hint__eyebrow">실행 가이드</span>
        <span className="floating-hint__status">
          {guide.completedSteps} / {guide.totalSteps} 단계
        </span>
      </div>

      <strong>{guide.currentGoal.title}</strong>
      <p>{guide.currentGoal.description}</p>

      <div className="floating-hint__meta">
        <span>{guide.currentGoal.progressText}</span>
        <span>{guide.currentGoal.reward}</span>
      </div>

      <div className="progress-track progress-track--hint" aria-label="onboarding progress">
        <div
          className="progress-track__fill"
          style={{ width: `${guide.currentGoal.progressPercent}%` }}
        />
      </div>

      <div className="guide-step-list">
        {guide.steps.map((step) => (
          <div className={`guide-step guide-step--${step.status}`} key={step.id}>
            <span>{statusLabel[step.status]}</span>
            <strong>{step.label}</strong>
            <small>{step.note}</small>
          </div>
        ))}
      </div>
    </aside>
  );
}
