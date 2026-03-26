import { useAppStore } from '@/app/providers/useAppStore';
import { getBuildMeta } from '@/app/bootstrap/getBuildMeta';
import { breedDefinitions } from '@/content/breeds/definitions';
import { hiringCandidateDefinitions } from '@/content/hiring/candidates';
import {
  getMilestoneTimeline,
  getNextMilestone,
  isMilestoneReached,
} from '@/content/milestones/definitions';
import { roleDefinitions } from '@/content/jobs/definitions';
import { processModeDefinitions } from '@/content/processModes/definitions';
import {
  getWorkshopUpgradeCost,
  getWorkshopUpgradeEffects,
  getWorkshopUpgradeLevel,
  workshopUpgradeDefinitions,
} from '@/content/upgrades/definitions';
import { OnboardingHint } from '@/features/onboarding/OnboardingHint';
import { getOnboardingGuide } from '@/features/onboarding/getOnboardingGuide';
import type { MilestoneProgress } from '@/content/milestones/definitions';
import type { WorkshopUpgradeDefinition } from '@/entities/upgrade';
import {
  getAvailableHiringCandidates,
  getSimulationSnapshot,
} from '@/game-core/engine/simulation';
import { createPhaserStageSnapshot } from '@/game-renderer/phaser/createStageSnapshot';
import { PhaserStage } from '@/game-renderer/phaser/PhaserStage';
import {
  formatCompactNumber,
  formatDurationMs,
  formatInsets,
  formatSignedCompactNumber,
} from '@/shared/utils/format';

const officeLabels = {
  1: '차고 오두막',
  2: '골목 스튜디오',
  3: '동네 개발사',
} as const;

function formatWorkshopUpgradeEffect(definition: WorkshopUpgradeDefinition, level: number) {
  const totalEffect = definition.effectPerLevel * level;

  if (definition.bonusType === 'focus') {
    return `집중 회복 +${formatCompactNumber(totalEffect)}/s`;
  }

  return `${definition.bonusLabel} +${formatCompactNumber(totalEffect * 100)}%`;
}

function createMilestoneGoal(progress: MilestoneProgress) {
  return {
    title: progress.definition.name,
    description: progress.definition.summary,
    helper: progress.definition.unlocks.join(' · '),
    reward: progress.definition.rewardLabel,
    progressText: progress.progressText,
    progressPercent: progress.progressPercent,
  };
}

export function DashboardScreen() {
  const platform = useAppStore((state) => state.platform);
  const gameState = useAppStore((state) => state.gameState);
  const lastProgressReport = useAppStore((state) => state.lastProgressReport);
  const dismissProgressReport = useAppStore((state) => state.dismissProgressReport);
  const changeProcessMode = useAppStore((state) => state.changeProcessMode);
  const hireTeamMember = useAppStore((state) => state.hireTeamMember);
  const buyWorkshopUpgrade = useAppStore((state) => state.buyWorkshopUpgrade);
  const buySnackBreak = useAppStore((state) => state.buySnackBreak);
  const startFocusSession = useAppStore((state) => state.startFocusSession);
  const buildMeta = getBuildMeta();

  const founderBreed = breedDefinitions.find((breed) => breed.id === gameState.founder.breedId);
  const currentProcess = processModeDefinitions.find((mode) => mode.id === gameState.currentProcess);
  const simulation = getSimulationSnapshot(gameState);
  const stageSnapshot = createPhaserStageSnapshot(gameState, simulation);
  const onboardingGuide = getOnboardingGuide(gameState);
  const milestoneTimeline = getMilestoneTimeline(gameState);
  const nextMilestone = getNextMilestone(gameState);
  const availableCandidates = getAvailableHiringCandidates(gameState);
  const nextLockedCandidate = hiringCandidateDefinitions.find(
    (candidate) =>
      !gameState.team.some((member) => member.id === candidate.id) &&
      candidate.unlockAtProjects > gameState.completedProjects + 1,
  );
  const officeLabel = officeLabels[gameState.officeLevel as keyof typeof officeLabels] ?? '성장 중인 작업실';
  const currentProjectProgress = Math.min(
    100,
    (gameState.currentProject.progress / gameState.currentProject.requiredCode) * 100,
  );
  const remainingCode = Math.max(0, gameState.currentProject.requiredCode - gameState.currentProject.progress);
  const etaMs =
    simulation.codePerSecond > 0 ? (remainingCode / simulation.codePerSecond) * 1000 : null;
  const canStartFocusSession = gameState.resources.focus >= 14;
  const canBuySnackBreak = gameState.resources.cash >= 14;
  const focusGap = Math.max(0, 14 - gameState.resources.focus);
  const snackGap = Math.max(0, 14 - gameState.resources.cash);
  const workshopUpgradeEffects = getWorkshopUpgradeEffects(gameState.workshopUpgrades);
  const totalUpgradeLevels = workshopUpgradeDefinitions.reduce(
    (total, definition) => total + getWorkshopUpgradeLevel(gameState.workshopUpgrades, definition.id),
    0,
  );
  const focusButtonNote = canStartFocusSession
    ? '집중력 14 소모 · 진행도 16 즉시 추가'
    : `집중력이 ${formatCompactNumber(focusGap)} 더 필요 · 자동 회복 또는 간식 휴식`;
  const snackButtonNote = canBuySnackBreak
    ? '14원 사용 · 집중력 22 회복'
    : `운영 자금 ${formatCompactNumber(snackGap)}원 더 필요`;
  const activeGoal =
    onboardingGuide.completedSteps < onboardingGuide.totalSteps || !nextMilestone
      ? onboardingGuide.currentGoal
      : createMilestoneGoal(nextMilestone);
  const workshopCards = workshopUpgradeDefinitions.map((definition) => {
    const currentLevel = getWorkshopUpgradeLevel(gameState.workshopUpgrades, definition.id);
    const nextCost = getWorkshopUpgradeCost(definition, currentLevel);
    const unlockMilestone = definition.unlockMilestoneId
      ? milestoneTimeline.find((item) => item.definition.id === definition.unlockMilestoneId) ?? null
      : null;
    const isUnlocked = definition.unlockMilestoneId ? isMilestoneReached(gameState, definition.unlockMilestoneId) : true;
    const canBuy = isUnlocked && nextCost !== null && gameState.resources.cash >= nextCost;

    return {
      definition,
      currentLevel,
      nextCost,
      canBuy,
      isUnlocked,
      unlockMilestone,
      currentBonus: currentLevel
        ? formatWorkshopUpgradeEffect(definition, currentLevel)
        : `${definition.bonusLabel} 보너스 없음`,
      nextBonus:
        currentLevel < definition.maxLevel
          ? formatWorkshopUpgradeEffect(definition, currentLevel + 1)
          : '최대 단계 완료',
    };
  });

  const roster = [
    {
      id: 'founder',
      name: gameState.founder.name,
      breedId: gameState.founder.breedId,
      role: gameState.founder.role,
      subtitle: '창업견',
    },
    ...gameState.team.map((member) => ({
      id: member.id,
      name: member.name,
      breedId: member.breedId,
      role: member.role,
      subtitle: `${member.hiredAtProject + 1}번째 납품 합류`,
    })),
  ];

  const dailyJournal = [
    {
      label: '현재 프로젝트',
      value: gameState.currentProject.name,
      note: gameState.currentProject.summary,
    },
    {
      label: '다음 고용',
      value: availableCandidates[0]?.name ?? nextLockedCandidate?.name ?? '모집 대기',
      note: availableCandidates[0]
        ? `${formatCompactNumber(availableCandidates[0].cost)}원 모이면 바로 합류`
        : nextLockedCandidate
          ? `${nextLockedCandidate.unlockAtProjects}개 납품 후 공개`
          : '현재 후보를 모두 맞이했습니다',
    },
    {
      label: '작업실 단계',
      value: officeLabel,
      note: `${gameState.employeeCount}마리 팀 · 납품 ${gameState.completedProjects}건`,
    },
  ];

  const resourceCards = [
    {
      label: '코드 꾸러미',
      value: formatCompactNumber(gameState.resources.code),
      note: `초당 ${formatCompactNumber(simulation.codePerSecond)} 생산`,
    },
    {
      label: '집중력',
      value: formatCompactNumber(gameState.resources.focus),
      note: `초당 ${formatSignedCompactNumber(simulation.focusDeltaPerSecond)} 변화`,
    },
    {
      label: '운영 자금',
      value: `${formatCompactNumber(gameState.resources.cash)}원`,
      note: '고용, 간식, 작업실 정비에 사용',
    },
    {
      label: '동네 평판',
      value: formatCompactNumber(gameState.resources.reputation),
      note: `보상 배수 x${simulation.rewardMultiplier}`,
    },
  ];

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="eyebrow-row">
          <span className="eyebrow">Cozy Dev Lodge</span>
          <span className="status-pill">{platform.isPortrait ? '도트 세로 모드' : '도트 가로 모드'}</span>
        </div>

        <div className="hero-copy">
          <div className="hero-copy__lead">
            <div className="season-banner">
              <span>봄 1일차</span>
              <span>{gameState.employeeCount}마리 근무 중</span>
              <span>{currentProcess?.name ?? '프로세스 미정'}</span>
            </div>
            <h1>개발견 키우기</h1>
            <p>
              새끼 개발견 한 마리로 시작해, 작은 납품을 반복하고 팀을 늘리며 작업실을 포근한 회사로 키워
              나가는 방치형 경영 시뮬레이션입니다.
            </p>
          </div>

          <div className="journal-strip">
            {dailyJournal.map((entry) => (
              <div className="journal-card" key={entry.label}>
                <span>{entry.label}</span>
                <strong>{entry.value}</strong>
                <small>{entry.note}</small>
              </div>
            ))}
          </div>

          <div className="hero-badge-grid">
            <div className="hero-badge">
              <span className="label">창업견</span>
              <strong>{gameState.founder.name}</strong>
              <small>
                {founderBreed?.name} · {founderBreed?.title}
              </small>
            </div>
            <div className="hero-badge">
              <span className="label">진행 중</span>
              <strong>{gameState.currentProject.name}</strong>
              <small>{etaMs ? `${formatDurationMs(etaMs)} 후 납품 예상` : '팀을 정비 중입니다'}</small>
            </div>
            <div className="hero-badge">
              <span className="label">작업실 단계</span>
              <strong>{officeLabel}</strong>
              <small>{gameState.completedProjects}건의 작은 배포가 공간을 키웁니다</small>
            </div>
          </div>

          <div className="harvest-strip">
            {resourceCards.map((card) => (
              <div className="harvest-card" key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.note}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stage-shell">
        <div className="stage-shell__copy">
          <span className="label">농장 겸 작업실</span>
          <strong>{officeLabel} 앞 개발 밭</strong>
          <small>
            납품 횟수가 쌓일수록 더 큰 작업실로 확장됩니다. 현재 팀 하모니는 x
            {formatCompactNumber(simulation.teamHarmony)}입니다.
          </small>
          <div className="stage-shell__tags">
            <span>납품 {gameState.completedProjects}건</span>
            <span>팀원 {gameState.employeeCount}마리</span>
            <span>품질 {formatCompactNumber(simulation.qualityScore)}</span>
          </div>
        </div>
        <PhaserStage snapshot={stageSnapshot} />
      </section>

      <OnboardingHint guide={onboardingGuide} />

      <section className="grid-panels">
        <article className="panel panel--wide">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Sprint Loop</span>
              <h2>오늘의 납품</h2>
            </div>
            <span>{etaMs ? `남은 시간 ${formatDurationMs(etaMs)}` : '생산 속도 확인 필요'}</span>
          </div>

          {lastProgressReport ? (
            <div className="offline-banner">
              <div>
                <strong>쉬는 동안도 작업실이 돌아갔어요</strong>
                <p>
                  {formatDurationMs(lastProgressReport.elapsedMs)} 동안 코드 {formatCompactNumber(lastProgressReport.codeGained)}
                  , 자금 {formatCompactNumber(lastProgressReport.cashGained)}원, 평판{' '}
                  {formatCompactNumber(lastProgressReport.reputationGained)}을 모았습니다.
                </p>
              </div>
              <button className="action-button action-button--ghost" onClick={dismissProgressReport} type="button">
                확인
              </button>
            </div>
          ) : null}

          <div className="goal-card">
            <div className="goal-card__header">
              <div>
                <span className="label">다음 목표</span>
                <strong>{activeGoal.title}</strong>
              </div>
              <small>{activeGoal.progressText}</small>
            </div>
            <p>{activeGoal.description}</p>
            <div className="progress-track" aria-label="next goal progress">
              <div
                className="progress-track__fill"
                style={{ width: `${activeGoal.progressPercent}%` }}
              />
            </div>
            <div className="goal-card__footer">
              <span>{activeGoal.helper}</span>
              <small>{activeGoal.reward}</small>
            </div>
          </div>

          <div className="project-card">
            <div className="project-card__header">
              <div>
                <span className="label">현재 작업</span>
                <strong>{gameState.currentProject.name}</strong>
              </div>
              <small>
                {formatCompactNumber(gameState.currentProject.progress)} /{' '}
                {formatCompactNumber(gameState.currentProject.requiredCode)} code
              </small>
            </div>
            <p>{gameState.currentProject.summary}</p>
            <div className="progress-track" aria-label="project progress">
              <div className="progress-track__fill" style={{ width: `${currentProjectProgress}%` }} />
            </div>
            <div className="project-card__footer">
              <span>현금 보상 {formatCompactNumber(gameState.currentProject.rewardCash)}원</span>
              <span>평판 보상 {formatCompactNumber(gameState.currentProject.rewardReputation)}</span>
            </div>
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <span>생산 속도</span>
              <strong>{formatCompactNumber(simulation.codePerSecond)}/s</strong>
            </div>
            <div className="stat-card">
              <span>집중 흐름</span>
              <strong>{formatSignedCompactNumber(simulation.focusDeltaPerSecond)}/s</strong>
            </div>
            <div className="stat-card">
              <span>품질 지수</span>
              <strong>{formatCompactNumber(simulation.qualityScore)}</strong>
            </div>
            <div className="stat-card">
              <span>보상 배수</span>
              <strong>x{formatCompactNumber(simulation.rewardMultiplier)}</strong>
            </div>
          </div>

          <div className="action-row">
            <button
              className="action-button"
              disabled={!canStartFocusSession}
              onClick={startFocusSession}
              type="button"
            >
              집중 세션
              <small>{focusButtonNote}</small>
            </button>
            <button
              className="action-button action-button--secondary"
              disabled={!canBuySnackBreak}
              onClick={buySnackBreak}
              type="button"
            >
              간식 휴식
              <small>{snackButtonNote}</small>
            </button>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Hiring Desk</span>
              <h2>팀 꾸리기</h2>
            </div>
            <span>현 팀 {gameState.employeeCount}마리</span>
          </div>

          <div className="roster-list">
            {roster.map((member) => {
              const breed = breedDefinitions.find((breedItem) => breedItem.id === member.breedId);
              const role = roleDefinitions.find((roleItem) => roleItem.id === member.role);

              return (
                <div className="roster-card" key={member.id}>
                  <div>
                    <span>{member.name}</span>
                    <strong>
                      {breed?.name} · {role?.name}
                    </strong>
                    <small>{member.subtitle}</small>
                  </div>
                  <span className="roster-chip">{breed?.specialty}</span>
                </div>
              );
            })}
          </div>

          <div className="candidate-list">
            {availableCandidates.map((candidate) => {
              const breed = breedDefinitions.find((breedItem) => breedItem.id === candidate.breedId);
              const role = roleDefinitions.find((roleItem) => roleItem.id === candidate.role);
              const canHire = gameState.resources.cash >= candidate.cost;

              return (
                <div className="candidate-card" key={candidate.id}>
                  <div className="candidate-card__copy">
                    <span>{candidate.name}</span>
                    <strong>
                      {breed?.name} · {role?.name}
                    </strong>
                    <p>{candidate.summary}</p>
                  </div>
                  <div className="candidate-card__footer">
                    <small>
                      {canHire
                        ? `${formatCompactNumber(candidate.cost)}원 · 지금 합류 가능`
                        : `${formatCompactNumber(candidate.cost)}원 · ${formatCompactNumber(
                            candidate.cost - gameState.resources.cash,
                          )}원 더 필요`}
                    </small>
                    <button
                      className="action-button action-button--small"
                      disabled={!canHire}
                      onClick={() => {
                        hireTeamMember(candidate.id);
                      }}
                      type="button"
                    >
                      {canHire ? '고용' : '자금 부족'}
                    </button>
                  </div>
                </div>
              );
            })}

            {!availableCandidates.length ? (
              <div className="empty-card">
                <strong>새 후보를 찾는 중</strong>
                <p>
                  {nextLockedCandidate
                    ? `다음 후보 ${nextLockedCandidate.name}는 납품 ${nextLockedCandidate.unlockAtProjects}건째에 공개됩니다.`
                    : '현재 공개된 후보를 모두 맞이했습니다.'}
                </p>
              </div>
            ) : null}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Workshop Upgrades</span>
              <h2>작업실 정비</h2>
            </div>
            <span>영구 보너스 {totalUpgradeLevels}단계</span>
          </div>

          <div className="upgrade-list">
            {workshopCards.map(
              ({ definition, currentLevel, nextCost, canBuy, isUnlocked, unlockMilestone, currentBonus, nextBonus }) => (
                <div className="upgrade-card" key={definition.id}>
                  <div className="upgrade-card__copy">
                    <span>{definition.name}</span>
                    <strong>
                      Lv.{currentLevel} / {definition.maxLevel}
                    </strong>
                    <p>{definition.summary}</p>
                  </div>

                  <div className="upgrade-card__meta">
                    <small>현재 {currentBonus}</small>
                    <small>
                      {isUnlocked || !unlockMilestone
                        ? `다음 ${nextBonus}`
                        : `해금 ${unlockMilestone.definition.name} · ${unlockMilestone.progressText}`}
                    </small>
                  </div>

                  <div className="upgrade-card__footer">
                    <small>
                      {!isUnlocked && unlockMilestone
                        ? `${unlockMilestone.definition.name} 달성 필요`
                        : nextCost === null
                          ? '정비 완료'
                          : canBuy
                            ? `${formatCompactNumber(nextCost)}원 투자 가능`
                            : `${formatCompactNumber(nextCost)}원 · ${formatCompactNumber(
                                nextCost - gameState.resources.cash,
                              )}원 부족`}
                    </small>
                    <button
                      className="action-button action-button--small"
                      disabled={!canBuy}
                      onClick={() => {
                        buyWorkshopUpgrade(definition.id);
                      }}
                      type="button"
                    >
                      {!isUnlocked && unlockMilestone
                        ? '이정표 필요'
                        : nextCost === null
                          ? '완료'
                          : canBuy
                            ? '정비'
                            : '자금 부족'}
                    </button>
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="panel-note">
            <strong>현재 작업실 보정</strong>
            <p>
              생산 +{formatCompactNumber(workshopUpgradeEffects.productionMultiplierBonus * 100)}% · 집중 회복 +
              {formatCompactNumber(workshopUpgradeEffects.focusRecoveryBonus)}/s · 보상 +
              {formatCompactNumber(workshopUpgradeEffects.rewardMultiplierBonus * 100)}%
            </p>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Roadmap</span>
              <h2>이정표</h2>
            </div>
            <span>{milestoneTimeline.filter((item) => item.isComplete).length}개 달성</span>
          </div>

          <div className="timeline">
            {milestoneTimeline.map((item) => (
              <div
                className={`timeline-item ${
                  item.status === 'done'
                    ? 'timeline-item--done'
                    : item.status === 'current'
                      ? 'timeline-item--active'
                      : 'timeline-item--queued'
                }`}
                key={item.definition.id}
              >
                <span>{item.definition.rewardLabel}</span>
                <strong>{item.definition.name}</strong>
                <p>{item.definition.summary}</p>
                <small>{item.progressText}</small>
              </div>
            ))}
          </div>

          {nextMilestone ? (
            <div className="panel-note">
              <strong>다음 해금</strong>
              <p>{nextMilestone.definition.unlocks.join(' · ')}</p>
            </div>
          ) : (
            <div className="panel-note">
              <strong>이정표 완료</strong>
              <p>현재 준비된 중기 이정표를 모두 달성했습니다. 다음 확장 단계로 넘어갈 수 있습니다.</p>
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Process Board</span>
              <h2>개발 방식</h2>
            </div>
            <span>{currentProcess?.bonusLabel}</span>
          </div>

          <div className="process-list">
            {processModeDefinitions.map((mode) => {
              const isActive = gameState.currentProcess === mode.id;

              return (
                <div className={`process-card ${isActive ? 'process-card--active' : ''}`} key={mode.id}>
                  <div>
                    <span>{mode.name}</span>
                    <strong>{mode.bonusLabel}</strong>
                    <p>{mode.summary}</p>
                  </div>
                  <div className="process-stats">
                    <small>생산 x{formatCompactNumber(mode.productionMultiplier)}</small>
                    <small>품질 x{formatCompactNumber(mode.qualityMultiplier)}</small>
                    <small>집중 소모 x{formatCompactNumber(mode.focusDrainMultiplier)}</small>
                  </div>
                  <button
                    className="action-button action-button--small"
                    disabled={isActive}
                    onClick={() => {
                      changeProcessMode(mode.id);
                    }}
                    type="button"
                  >
                    {isActive ? '운영 중' : '전환'}
                  </button>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Workshop Status</span>
              <h2>작업실 상태</h2>
            </div>
            <span>{platform.isTossWebView ? 'Toss WebView' : 'Browser'}</span>
          </div>
          <ul className="metric-list">
            <li>
              <span>창문 크기</span>
              <strong>
                {platform.width} x {platform.height}
              </strong>
            </li>
            <li>
              <span>안전 여백</span>
              <strong>{formatInsets(platform.insets)}</strong>
            </li>
            <li>
              <span>움직임</span>
              <strong>{platform.isReducedMotion ? '잔잔 모드' : '기본 모드'}</strong>
            </li>
            <li>
              <span>빌드 모드</span>
              <strong>{buildMeta.isDev ? '개발 중' : buildMeta.mode}</strong>
            </li>
          </ul>
          <div className="panel-note">
            <strong>다음 성장 목표</strong>
            <p>
              납품 {Math.max(0, 3 - gameState.completedProjects)}건을 더 하면 작업실이 한 단계 커지고, 팀 조합에 따라
              생산 속도와 보상 안정성이 더 크게 갈립니다.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}
