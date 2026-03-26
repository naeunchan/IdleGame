import { hiringCandidateDefinitions } from '@/content/hiring/candidates';
import { roleDefinitions } from '@/content/jobs/definitions';
import { processModeDefinitions } from '@/content/processModes/definitions';
import type { GameState } from '@/entities/company';
import { getAvailableHiringCandidates } from '@/game-core/engine/simulation';
import { formatCompactNumber } from '@/shared/utils/format';

export type OnboardingStepStatus = 'done' | 'current' | 'locked';

export interface OnboardingStep {
  id: string;
  label: string;
  note: string;
  status: OnboardingStepStatus;
}

export interface OnboardingGoal {
  id: string;
  title: string;
  description: string;
  helper: string;
  reward: string;
  progressText: string;
  progressPercent: number;
}

export interface OnboardingGuide {
  completedSteps: number;
  totalSteps: number;
  currentGoal: OnboardingGoal;
  steps: OnboardingStep[];
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

function createFirstProjectGoal(state: GameState): OnboardingGoal {
  const focusNeeded = Math.max(0, 14 - state.resources.focus);
  const snackReady = state.resources.cash >= 14;

  return {
    id: 'first-project',
    title: '첫 납품을 마무리하세요',
    description: `${state.currentProject.name} 진행도를 끝까지 채우면 자금과 평판이 열립니다.`,
    helper:
      state.resources.focus >= 14
        ? '집중 세션으로 진행도 16을 즉시 올릴 수 있습니다.'
        : snackReady
          ? '집중력이 부족하면 간식 휴식으로 바로 회복하세요.'
          : `집중력이 ${formatCompactNumber(focusNeeded)} 더 필요합니다. 자동 회복을 잠깐 기다리세요.`,
    reward: `보상 ${formatCompactNumber(state.currentProject.rewardCash)}원 · 평판 ${formatCompactNumber(
      state.currentProject.rewardReputation,
    )}`,
    progressText: `${formatCompactNumber(state.currentProject.progress)} / ${formatCompactNumber(
      state.currentProject.requiredCode,
    )} code`,
    progressPercent: clampPercent(
      (state.currentProject.progress / state.currentProject.requiredCode) * 100,
    ),
  };
}

function createFirstHireGoal(state: GameState): OnboardingGoal {
  const availableCandidate = getAvailableHiringCandidates(state)[0];

  if (availableCandidate) {
    const role = roleDefinitions.find((item) => item.id === availableCandidate.role);
    const remainingCash = Math.max(0, availableCandidate.cost - state.resources.cash);

    return {
      id: 'first-hire',
      title: `${availableCandidate.name}를 첫 팀원으로 맞이하세요`,
      description: `${availableCandidate.summary} 첫 팀원을 들이면 생산과 품질 흐름이 같이 커집니다.`,
      helper:
        remainingCash === 0
          ? '팀 꾸리기 패널에서 바로 고용할 수 있습니다.'
          : `${formatCompactNumber(remainingCash)}원만 더 모으면 ${role?.name ?? '새 팀원'}을 맞이할 수 있습니다.`,
      reward: `${role?.name ?? '새 팀원'} 합류 · 팀 시너지 확장`,
      progressText: `${formatCompactNumber(state.resources.cash)} / ${formatCompactNumber(availableCandidate.cost)}원`,
      progressPercent: clampPercent((state.resources.cash / availableCandidate.cost) * 100),
    };
  }

  const nextLockedCandidate = hiringCandidateDefinitions.find(
    (candidate) =>
      !state.team.some((member) => member.id === candidate.id) &&
      candidate.unlockAtProjects > state.completedProjects + 1,
  );

  if (!nextLockedCandidate) {
    return {
      id: 'first-hire',
      title: '새 팀원을 기다리는 중입니다',
      description: '현재 공개된 첫 채용 후보를 모두 확인했습니다.',
      helper: '다음 납품을 마치면 새로운 후보가 이어서 열립니다.',
      reward: '새 채용 풀 준비 중',
      progressText: '후보 정리 중',
      progressPercent: 100,
    };
  }

  return {
    id: 'first-hire',
    title: `${nextLockedCandidate.name} 후보를 공개하세요`,
    description: `${formatCompactNumber(nextLockedCandidate.unlockAtProjects)}번째 납품까지 가면 첫 채용 풀이 열립니다.`,
    helper: '납품 보상을 먼저 모아 두면 후보가 열리자마자 바로 고용할 수 있습니다.',
    reward: '첫 채용 후보 공개',
    progressText: `${formatCompactNumber(state.completedProjects)} / ${formatCompactNumber(
      nextLockedCandidate.unlockAtProjects,
    )} 납품`,
    progressPercent: clampPercent((state.completedProjects / nextLockedCandidate.unlockAtProjects) * 100),
  };
}

function createProcessGoal(state: GameState): OnboardingGoal {
  const compareModes = processModeDefinitions.filter((mode) => mode.id !== state.currentProcess);
  const compareNames = compareModes.map((mode) => mode.name).join(' / ');

  return {
    id: 'first-process-shift',
    title: '개발 방식을 한 번 바꿔보세요',
    description: `${compareNames}으로 전환하면 생산 속도와 품질 흐름 차이를 바로 체감할 수 있습니다.`,
    helper: '개발 방식 패널에서 전환 버튼을 눌러 지금 팀에 맞는 운영법을 비교하세요.',
    reward: '속도·품질 차이 체감',
    progressText: '비교 전',
    progressPercent: 0,
  };
}

function createOfficeGoal(state: GameState): OnboardingGoal {
  return {
    id: 'office-growth',
    title: '작업실을 한 단계 키우세요',
    description: '납품 3건을 채우면 차고 오두막이 골목 스튜디오로 넓어집니다.',
    helper: '첫 팀원을 맞이한 뒤 납품 루프를 돌리면 확장 속도가 확실히 빨라집니다.',
    reward: '작업실 2단계 확장',
    progressText: `${formatCompactNumber(state.completedProjects)} / 3 납품`,
    progressPercent: clampPercent((state.completedProjects / 3) * 100),
  };
}

export function getOnboardingGuide(state: GameState): OnboardingGuide {
  const availableCandidate = getAvailableHiringCandidates(state)[0];
  const nextLockedCandidate = hiringCandidateDefinitions.find(
    (candidate) =>
      !state.team.some((member) => member.id === candidate.id) &&
      candidate.unlockAtProjects > state.completedProjects + 1,
  );
  const currentProcess = processModeDefinitions.find((mode) => mode.id === state.currentProcess);
  const firstIncompleteIndex = [
    state.completedProjects >= 1,
    state.team.length >= 1,
    state.currentProcess !== 'agile',
    state.completedProjects >= 3,
  ].findIndex((item) => !item);
  const activeIndex = firstIncompleteIndex === -1 ? 3 : firstIncompleteIndex;

  const steps: OnboardingStep[] = [
    {
      id: 'first-project',
      label: '첫 납품 완료',
      note:
        state.completedProjects >= 1
          ? `완료 · 납품 ${formatCompactNumber(state.completedProjects)}건`
          : `${formatCompactNumber(state.currentProject.progress)} / ${formatCompactNumber(
              state.currentProject.requiredCode,
            )} code`,
      status: state.completedProjects >= 1 ? 'done' : activeIndex === 0 ? 'current' : 'locked',
    },
    {
      id: 'first-hire',
      label: '첫 팀원 고용',
      note:
        state.team.length >= 1
          ? `완료 · 현 팀 ${formatCompactNumber(state.employeeCount)}마리`
          : availableCandidate
            ? `${availableCandidate.name} · ${formatCompactNumber(availableCandidate.cost)}원`
            : nextLockedCandidate
              ? `${formatCompactNumber(nextLockedCandidate.unlockAtProjects)}건 납품 후 공개`
              : '새 후보를 찾는 중',
      status: state.team.length >= 1 ? 'done' : activeIndex === 1 ? 'current' : 'locked',
    },
    {
      id: 'first-process-shift',
      label: '프로세스 전환',
      note:
        state.currentProcess !== 'agile'
          ? `완료 · ${currentProcess?.name ?? '새 방식'} 운영 중`
          : '폭포형 또는 나선형으로 한 번 비교',
      status: state.currentProcess !== 'agile' ? 'done' : activeIndex === 2 ? 'current' : 'locked',
    },
    {
      id: 'office-growth',
      label: '작업실 2단계',
      note:
        state.completedProjects >= 3
          ? '완료 · 골목 스튜디오 입성'
          : `${formatCompactNumber(state.completedProjects)} / 3 납품`,
      status: state.completedProjects >= 3 ? 'done' : activeIndex === 3 ? 'current' : 'locked',
    },
  ];

  const currentGoal =
    state.completedProjects < 1
      ? createFirstProjectGoal(state)
      : state.team.length < 1
        ? createFirstHireGoal(state)
        : state.currentProcess === 'agile'
          ? createProcessGoal(state)
          : state.completedProjects < 3
            ? createOfficeGoal(state)
            : {
                id: 'steady-loop',
                title: '첫 루프가 안정적으로 굴러가고 있습니다',
                description: '이제 납품과 고용을 반복하면서 더 큰 작업실 확장을 준비하면 됩니다.',
                helper: '다음 단계에서는 업그레이드와 장기 목표를 붙이면 게임 흐름이 더 단단해집니다.',
                reward: '기본 루프 안정화 완료',
                progressText: `${formatCompactNumber(state.completedProjects)}건 납품`,
                progressPercent: 100,
              };

  return {
    completedSteps: steps.filter((step) => step.status === 'done').length,
    totalSteps: steps.length,
    currentGoal,
    steps,
  };
}
