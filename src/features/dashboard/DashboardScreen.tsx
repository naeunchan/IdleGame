import { breedDefinitions } from '@/content/breeds/definitions';
import { processModeDefinitions } from '@/content/processModes/definitions';
import { PixiStage } from '@/game-renderer/pixi/PixiStage';
import { useAppStore } from '@/app/providers/useAppStore';
import { getBuildMeta } from '@/app/bootstrap/getBuildMeta';
import { getDashboardMetrics, getHireCards, getProcessCards, getScaleProgress } from '@/game-core/selectors/dashboard';
import { formatInsets } from '@/shared/utils/format';

const prStack = [
  {
    branch: 'codex/foundation-webview-shell',
    title: 'Game shell and platform seam',
    status: 'completed',
  },
  {
    branch: 'codex/core-loop-simulation',
    title: 'Deterministic idle simulation',
    status: 'completed',
  },
  {
    branch: 'codex/team-growth-and-sdlc',
    title: 'Hiring, traits, and process modes',
    status: 'active',
  },
];

export function DashboardScreen() {
  const platform = useAppStore((state) => state.platform);
  const gameState = useAppStore((state) => state.gameState);
  const hydrationSource = useAppStore((state) => state.hydrationSource);
  const lastSavedAt = useAppStore((state) => state.lastSavedAt);
  const adoptProcessMode = useAppStore((state) => state.adoptProcessMode);
  const hireTeamRole = useAppStore((state) => state.hireTeamRole);
  const upgradeScale = useAppStore((state) => state.upgradeScale);
  const buildMeta = getBuildMeta();
  const metrics = getDashboardMetrics(gameState);
  const hireCards = getHireCards(gameState);
  const processCards = getProcessCards(gameState);
  const scaleProgress = getScaleProgress(gameState);
  const progressPercent = Math.min(100, metrics.projectRatio * 100);
  const founderBreed = breedDefinitions.find((breed) => breed.id === gameState.founder.breedId);

  const formatSigned = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}`;
  const formatNumber = (value: number) =>
    new Intl.NumberFormat('ko-KR', { maximumFractionDigits: value > 100 ? 0 : 1 }).format(value);

  return (
    <main className="app-shell">
      <section className="hero-card hero-card--command">
        <div className="eyebrow-row">
          <span className="eyebrow">개발견 키우기</span>
          <span className="status-pill">{platform.isPortrait ? 'Portrait First' : 'Landscape'}</span>
        </div>

        <div className="hero-copy">
          <div>
            <h1>개발견 키우기</h1>
            <p>
              새끼 개발견 한 마리에서 시작해 코드, 팀, 프로세스를 차례로 넓혀 가는 방치형 회사
              시뮬레이션입니다.
            </p>
          </div>

          <div className="command-strip">
            <div className="command-pill">
              <span>Founder</span>
              <strong>{gameState.founder.name}</strong>
              <small>{founderBreed?.name}</small>
            </div>
            <div className="command-pill">
              <span>Scale</span>
              <strong>{scaleProgress.currentScale.name}</strong>
              <small>{gameState.employeeCount} staff</small>
            </div>
            <div className="command-pill command-pill--accent">
              <span>Save</span>
              <strong>{hydrationSource === 'save-recovered' ? 'Recovered' : 'Fresh'}</strong>
              <small>{lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString('ko-KR') : 'Auto'}</small>
            </div>
          </div>

          <div className="hero-stats">
            <div>
              <span className="label">창업자</span>
              <strong>{gameState.founder.name}</strong>
              <small>{founderBreed?.name} / 새끼 견</small>
            </div>
            <div>
              <span className="label">프로세스</span>
              <strong>{processModeDefinitions.find((mode) => mode.id === gameState.currentProcess)?.name}</strong>
              <small>
                {hydrationSource === 'save-recovered'
                  ? '저장 복구 완료'
                  : `${scaleProgress.currentScale.name} / ${gameState.employeeCount}명 운영 중`}
              </small>
            </div>
          </div>
        </div>
      </section>

      <section className="stage-shell">
        <PixiStage />
        <div className="stage-overlay">
          <div className="stage-overlay__header">
            <div>
              <span className="label">활성 프로젝트</span>
              <strong>{gameState.activeProject.name}</strong>
            </div>
            <span className="stage-badge">{gameState.currentProcess}</span>
          </div>
          <div className="progress-rail">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="stage-overlay__footer">
            <small>
              {formatNumber(gameState.activeProject.progress)} / {formatNumber(gameState.activeProject.target)} code
            </small>
            <small>{formatSigned(metrics.codePerSecond)} code / sec</small>
          </div>
        </div>
      </section>

      <section className="grid-panels">
        <article className="panel">
          <div className="panel-header">
            <h2>플랫폼</h2>
            <span>{platform.isTossWebView ? 'Toss WebView' : 'Browser Preview'}</span>
          </div>
          <ul className="metric-list">
            <li>
              <span>Viewport</span>
              <strong>
                {platform.width} x {platform.height}
              </strong>
            </li>
            <li>
              <span>Safe area</span>
              <strong>{formatInsets(platform.insets)}</strong>
            </li>
            <li>
              <span>Motion</span>
              <strong>{platform.isReducedMotion ? 'Reduced' : 'Standard'}</strong>
            </li>
            <li>
              <span>Lifecycle</span>
              <strong>{platform.isVisible ? 'Foreground' : 'Background'}</strong>
            </li>
          </ul>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>시뮬레이션 루프</h2>
            <span>idle online</span>
          </div>
          <ul className="metric-list">
            <li>
              <span>Code</span>
              <strong>{formatNumber(gameState.resources.code)}</strong>
            </li>
            <li>
              <span>Cash</span>
              <strong>{formatNumber(gameState.resources.cash)}원</strong>
            </li>
            <li>
              <span>Reputation</span>
              <strong>{formatNumber(gameState.resources.reputation)}</strong>
            </li>
            <li>
              <span>Focus</span>
              <strong>{formatNumber(gameState.resources.focus)}</strong>
            </li>
            <li>
              <span>Code / sec</span>
              <strong>{formatSigned(metrics.codePerSecond)}</strong>
            </li>
            <li>
              <span>Focus / min</span>
              <strong>{formatSigned(metrics.focusTrendPerMinute)}</strong>
            </li>
          </ul>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>콘텐츠 베이스</h2>
            <span>{breedDefinitions.length} breeds / {gameState.employeeCount} staff</span>
          </div>
          <div className="tag-cloud">
            {breedDefinitions.map((breed) => (
              <div className="tag-card" key={breed.id}>
                <span>{breed.name}</span>
                <strong>{breed.specialty}</strong>
                <small>{breed.specialtyRoleId}</small>
              </div>
            ))}
          </div>
          <div className="roster-list">
            <div className="roster-card">
              <span>Founder</span>
              <strong>{gameState.founder.name}</strong>
              <small>{breedDefinitions.find((breed) => breed.id === gameState.founder.breedId)?.name}</small>
            </div>
            {gameState.teamMembers.map((member) => (
              <div className="roster-card" key={member.id}>
                <span>{member.roleId}</span>
                <strong>{member.name}</strong>
                <small>{breedDefinitions.find((breed) => breed.id === member.breedId)?.name}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>조직 확장</h2>
            <span>team growth</span>
          </div>
          <div className="scale-card">
            <span>{scaleProgress.currentScale.name}</span>
            <strong>{scaleProgress.currentScale.summary}</strong>
            <small>
              headcount {scaleProgress.currentScale.headcountCap} / slots {scaleProgress.currentScale.hireSlots}
            </small>
            {scaleProgress.nextScale ? (
              <button
                className={`action-card ${scaleProgress.canUpgrade ? 'action-card--active' : ''}`}
                disabled={!scaleProgress.canUpgrade}
                onClick={() => upgradeScale(Date.now())}
                type="button"
              >
                <span>다음 단계</span>
                <strong>{scaleProgress.nextScale.name}</strong>
                <small>
                  비용 {scaleProgress.nextScale.upgradeCost.cash}원 / {scaleProgress.nextScale.upgradeCost.code} code
                </small>
              </button>
            ) : null}
          </div>
          <div className="management-section">
            <div className="management-section__header">
              <span className="label">프로세스 전환</span>
              <small>한 번에 하나만 활성화됩니다</small>
            </div>
            <div className="button-grid">
              {processCards.map((processMode) => (
                <button
                  className={`action-card ${processMode.isActive ? 'action-card--active' : ''}`}
                  disabled={!processMode.canChange}
                  key={processMode.id}
                  onClick={() => adoptProcessMode(processMode.id, Date.now())}
                  type="button"
                >
                  <span>{processMode.name}</span>
                  <strong>{processMode.bonusLabel}</strong>
                  <small>{processMode.summary}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="management-section">
            <div className="management-section__header">
              <span className="label">첫 팀 채용</span>
              <small>견종 성향에 맞는 역할을 추천합니다</small>
            </div>
            <div className="button-grid">
              {hireCards.map((role) => (
                <button
                  className={`action-card ${role.isHired ? 'action-card--owned' : ''}`}
                  disabled={!role.canHire}
                  key={role.id}
                  onClick={() => hireTeamRole(role.id, Date.now())}
                  type="button"
                >
                  <span>{role.name}</span>
                  <strong>
                    {role.hireCost.cash}원 / {role.hireCost.code} code
                  </strong>
                  <small>
                    {role.isHired
                      ? '고용 완료'
                      : `${role.recommendedBreedId} 추천 / ${role.unlockNotes}`}
                  </small>
                </button>
              ))}
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>진행 메타</h2>
            <span>{prStack.length} branches</span>
          </div>
          <ul className="metric-list">
            <li>
              <span>Releases</span>
              <strong>{gameState.stats.releases}</strong>
            </li>
            <li>
              <span>Offline recovered</span>
              <strong>{formatNumber(gameState.stats.totalOfflineMs / 60000)}분</strong>
            </li>
            <li>
              <span>Last save</span>
              <strong>{lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString('ko-KR') : 'autosave pending'}</strong>
            </li>
            <li>
              <span>Build stack</span>
              <strong>{prStack[2]?.title}</strong>
            </li>
          </ul>
          <div className="timeline">
            {prStack.map((item) => (
              <div className={`timeline-item timeline-item--${item.status}`} key={item.branch}>
                <strong>{item.title}</strong>
                <span>{item.branch}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="footer-strip">
        <div>
          <span className="label">Launch state</span>
          <strong>Team growth live</strong>
        </div>
        <div>
          <span className="label">Build mode</span>
          <strong>{buildMeta.isDev ? 'development' : buildMeta.mode}</strong>
        </div>
      </section>
    </main>
  );
}
