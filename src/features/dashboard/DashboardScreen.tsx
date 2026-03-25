import { breedDefinitions } from '@/content/breeds/definitions';
import { roleDefinitions } from '@/content/jobs/definitions';
import { processModeDefinitions } from '@/content/processModes/definitions';
import { PixiStage } from '@/game-renderer/pixi/PixiStage';
import { useAppStore } from '@/app/providers/useAppStore';
import { getBuildMeta } from '@/app/bootstrap/getBuildMeta';
import { OnboardingHint } from '@/features/onboarding/OnboardingHint';
import { formatInsets } from '@/shared/utils/format';

const prStack = [
  {
    branch: 'codex/foundation-webview-shell',
    title: '포근한 기본 셸',
    status: 'active',
  },
  {
    branch: 'codex/core-loop-simulation',
    title: '방치형 생산 루프',
    status: 'queued',
  },
  {
    branch: 'codex/team-growth-and-sdlc',
    title: '견종 팀 성장과 SDLC',
    status: 'queued',
  },
];

export function DashboardScreen() {
  const platform = useAppStore((state) => state.platform);
  const gameState = useAppStore((state) => state.gameState);
  const buildMeta = getBuildMeta();
  const founderBreed = breedDefinitions.find((breed) => breed.id === gameState.founder.breedId);
  const currentProcess = processModeDefinitions.find((mode) => mode.id === gameState.currentProcess);
  const dailyJournal = [
    {
      label: '오늘의 작물',
      value: '프로토타입 씨앗',
      note: '작은 기능을 심고 천천히 키우는 날',
    },
    {
      label: '다음 목표',
      value: '첫 팀원 맞이',
      note: '작업실이 외롭지 않도록 첫 동료를 준비합니다',
    },
    {
      label: '마을 기분',
      value: '잔잔함',
      note: '무리 없이 손에 익는 리듬을 먼저 만듭니다',
    },
  ];

  const resourceCards = [
    {
      label: '코드 꾸러미',
      value: `${formatNumber(gameState.resources.code)}`,
      note: '오늘 다듬은 기능 조각',
    },
    {
      label: '집중력',
      value: `${formatNumber(gameState.resources.focus)}`,
      note: '아직 산책 갈 힘이 남아 있어요',
    },
    {
      label: '운영 자금',
      value: `${formatNumber(gameState.resources.cash)}원`,
      note: '따끈한 간식과 장비 예산',
    },
    {
      label: '동네 평판',
      value: `${formatNumber(gameState.resources.reputation)}`,
      note: '천천히 쌓이는 입소문',
    },
  ];

  function formatNumber(value: number) {
    return new Intl.NumberFormat('ko-KR', {
      maximumFractionDigits: value >= 100 ? 0 : 1,
    }).format(value);
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="eyebrow-row">
          <span className="eyebrow">Pixel Farm Ledger</span>
          <span className="status-pill">{platform.isPortrait ? '도트 세로 모드' : '도트 가로 모드'}</span>
        </div>

        <div className="hero-copy">
          <div className="hero-copy__lead">
            <div className="season-banner">
              <span>봄 1일차</span>
              <span>맑음</span>
              <span>작업실에 볕이 잘 듭니다</span>
            </div>
            <h1>개발견 키우기</h1>
            <p>
              농장처럼 천천히 가꿔 가는 개발 작업실을 목표로, 새끼 개발견 한 마리와 작은 기능 씨앗부터
              키워 나가는 도트 감성 방치형 시뮬레이션입니다.
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
              <span className="label">오늘의 흐름</span>
              <strong>{currentProcess?.name}</strong>
              <small>{currentProcess?.summary}</small>
            </div>
            <div className="hero-badge">
              <span className="label">작업실 이름</span>
              <strong>{gameState.companyName}</strong>
              <small>{gameState.employeeCount}마리로 시작하는 작은 스튜디오</small>
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
          <strong>오두막 앞 개발 밭</strong>
          <small>작업대, 밭고랑, 작은 집, 산책로가 함께 보이는 Stardew Valley 풍의 도트 장면입니다.</small>
          <div className="stage-shell__tags">
            <span>나무 울타리</span>
            <span>개발 씨앗</span>
            <span>멍발자 오두막</span>
          </div>
        </div>
        <PixiStage />
      </section>

      <OnboardingHint />

      <section className="grid-panels">
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Farm Status</span>
              <h2>오늘의 작업실</h2>
            </div>
            <span>{platform.isTossWebView ? 'Toss WebView 안' : '브라우저 미리보기'}</span>
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
              <span>현재 상태</span>
              <strong>{platform.isVisible ? '활성 작업 중' : '잠시 쉬는 중'}</strong>
            </li>
          </ul>
          <div className="panel-note">
            <strong>따뜻한 톤 기준</strong>
            <p>밝은 하늘색 배경, 크림 종이 패널, 나무 프레임을 기준으로 전체 UI를 통일합니다.</p>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Dog Almanac</span>
              <h2>견종 도감</h2>
            </div>
            <span>{breedDefinitions.length} breeds / {roleDefinitions.length} roles</span>
          </div>
          <div className="breed-grid">
            {breedDefinitions.map((breed) => (
              <div className="breed-card" key={breed.id}>
                <span>{breed.name}</span>
                <strong>{breed.title}</strong>
                <p>{breed.passive}</p>
                <div className="breed-stat-row">
                  <small>집중 +{breed.focusBonus}</small>
                  <small>생산 +{breed.productivityBonus}</small>
                  <small>품질 +{breed.qualityBonus}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="role-grid">
            {roleDefinitions.map((role) => (
              <div className="role-pill" key={role.id}>
                <span>{role.name}</span>
                <small>{role.summary}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Season Roadmap</span>
              <h2>성장 달력</h2>
            </div>
            <span>{prStack.length} seasons</span>
          </div>
          <ul className="metric-list metric-list--compact">
            <li>
              <span>현재 시드</span>
              <strong>Foundation shell</strong>
            </li>
            <li>
              <span>기본 프로세스</span>
              <strong>{currentProcess?.bonusLabel}</strong>
            </li>
            <li>
              <span>다음 수확</span>
              <strong>생산 루프와 고용 시스템</strong>
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
          <div className="panel-note">
            <strong>다음 계절 준비</strong>
            <p>현재 셸의 포근한 시각 언어를 유지한 채, 이후 고용과 저장 UI도 같은 재질감으로 확장합니다.</p>
          </div>
        </article>
      </section>

      <section className="footer-strip">
        <div>
          <span className="label">작업실 상태</span>
          <strong>포근한 기본 셸 완성</strong>
        </div>
        <div>
          <span className="label">빌드 모드</span>
          <strong>{buildMeta.isDev ? 'development' : buildMeta.mode}</strong>
        </div>
      </section>
    </main>
  );
}
