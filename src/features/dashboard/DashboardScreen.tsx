import { breedDefinitions } from '@/content/breeds/definitions';
import { roleDefinitions } from '@/content/jobs/definitions';
import { processModeDefinitions } from '@/content/processModes/definitions';
import { PixiStage } from '@/game-renderer/pixi/PixiStage';
import { useAppStore } from '@/app/providers/useAppStore';
import { getBuildMeta } from '@/app/bootstrap/getBuildMeta';
import { formatInsets } from '@/shared/utils/format';

const prStack = [
  {
    branch: 'codex/foundation-webview-shell',
    title: 'Game shell and platform seam',
    status: 'active',
  },
  {
    branch: 'codex/core-loop-simulation',
    title: 'Deterministic idle simulation',
    status: 'queued',
  },
  {
    branch: 'codex/team-growth-and-sdlc',
    title: 'Hiring, traits, and process modes',
    status: 'queued',
  },
];

export function DashboardScreen() {
  const platform = useAppStore((state) => state.platform);
  const gameState = useAppStore((state) => state.gameState);
  const buildMeta = getBuildMeta();

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="eyebrow-row">
          <span className="eyebrow">Apps in Toss Game Shell</span>
          <span className="status-pill">{platform.isPortrait ? 'Portrait First' : 'Landscape'}</span>
        </div>

        <div className="hero-copy">
          <div>
            <h1>개발견 키우기</h1>
            <p>
              새끼 개발견 한 마리로 시작해서 팀을 꾸리고, SDLC를 선택하고, 회사를 키우는 방치형
              시뮬레이션의 기반 PR입니다.
            </p>
          </div>

          <div className="hero-stats">
            <div>
              <span className="label">창업자</span>
              <strong>{gameState.founder.name}</strong>
              <small>{breedDefinitions.find((breed) => breed.id === gameState.founder.breedId)?.name}</small>
            </div>
            <div>
              <span className="label">프로세스</span>
              <strong>{processModeDefinitions.find((mode) => mode.id === gameState.currentProcess)?.name}</strong>
              <small>기본값 설정 완료</small>
            </div>
          </div>
        </div>
      </section>

      <section className="stage-shell">
        <PixiStage />
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
            <h2>콘텐츠 베이스</h2>
            <span>{breedDefinitions.length} breeds</span>
          </div>
          <div className="tag-cloud">
            {breedDefinitions.map((breed) => (
              <div className="tag-card" key={breed.id}>
                <span>{breed.name}</span>
                <strong>{breed.specialty}</strong>
              </div>
            ))}
          </div>
          <div className="tag-cloud compact">
            {roleDefinitions.map((role) => (
              <div className="tag-card compact" key={role.id}>
                <span>{role.name}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>PR 스택</h2>
            <span>{prStack.length} branches</span>
          </div>
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
          <strong>Foundational shell complete</strong>
        </div>
        <div>
          <span className="label">Build mode</span>
          <strong>{buildMeta.isDev ? 'development' : buildMeta.mode}</strong>
        </div>
      </section>
    </main>
  );
}

