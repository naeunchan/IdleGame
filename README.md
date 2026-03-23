# 개발견 키우기

`개발견 키우기`는 `Apps in Toss`의 세로형 `WebView`에서 동작하는 2D 도트 아트 방치형 회사 시뮬레이션입니다. 플레이어는 1인 개발견으로 시작해 코드, 팀, 프로세스, 회사 규모를 순서대로 키우며 SDLC 기반의 조직 운영을 진행합니다.

## 빠르게 보기

- 런타임: `@apps-in-toss/web-framework` 기반 `WebView` 게임 셸
- 렌더링: `React 19` + `PixiJS`
- 상태 관리: `Zustand`
- 언어: `TypeScript`
- 저장: `localStorage` 버전드 스냅샷
- 목표 화면: 모바일 세로형 우선, safe-area 대응

## 시작하기

```bash
corepack enable
yarn install
yarn dev
```

자주 쓰는 명령은 아래와 같습니다.

```bash
yarn lint
yarn typecheck
yarn test
yarn build
```

`yarn dev`는 Toss WebView용 로컬 개발 셸을 띄우고, `yarn build`는 배포용 번들을 만듭니다.

## 현재 게임 루프

현재 구현된 핵심 루프는 아래 순서입니다.

1. 새끼 개발견 1마리로 시작합니다.
1. 기본 자원 `code`, `focus`, `cash`, `reputation`을 쌓습니다.
1. 팀을 고용합니다. 역할은 `designer`, `pm`, `architect`, `qa` 순으로 확장됩니다.
1. 회사 프로세스를 `폭포형`, `나선형`, `애자일` 중 하나로 선택합니다.
1. 회사 규모를 `개발차고` -> `소규모 스튜디오` -> `프로덕트 팀` -> `스케일업 조직`으로 키웁니다.
1. 오프라인 시간을 복구해 진행도를 이어서 진행합니다.

견종 특성은 직무와 연결됩니다.

- `보더콜리`: 생산성 중심
- `시바`: 집중력 중심
- `골든리트리버`: 팀 버프 중심
- `코기`: QA/품질 중심

## 아키텍처

이 프로젝트는 `UI shell + pure simulation core + thin renderer` 구조를 사용합니다.

- `src/app`: 앱 부트스트랩, 전역 provider, store 연결
- `src/platform`: Apps in Toss 브리지와 viewport/safe-area 읽기
- `src/game-core`: deterministic tick, offline progress, reducer, management rules
- `src/game-renderer`: `PixiJS` stage와 씬 렌더링
- `src/features`: 대시보드, 온보딩 같은 화면 단위 UI
- `src/entities`: 회사, 개, 직무, 프로세스, 진행 구조체
- `src/content`: 견종/직무/프로세스/회사 규모 정의와 밸런스 데이터
- `src/persistence`: save schema, 로컬 저장, 복구
- `src/analytics`: 이벤트 트래킹 래퍼
- `src/shared`: 공통 타입, 상수, 유틸
- `src/test`: 핵심 로직과 저장 복구 테스트

규칙도 명확합니다.

- `src/game-core`는 React, Pixi, 브라우저 API, Toss 브리지를 import하지 않습니다.
- UI와 렌더러는 규칙을 소유하지 않고 `state`와 selector만 읽습니다.
- 저장 스키마는 `v1`이며, 손상된 저장은 안전하게 초기 상태로 복구됩니다.

## 스택된 PR 구조

이 브랜치는 stacked PR 방식으로 진행 중입니다.

1. `codex/foundation-webview-shell` `PR #1`
1. `codex/core-loop-simulation` `PR #2`
1. `codex/team-growth-and-sdlc` `PR #3`
1. `codex/mobile-ui-onboarding` `PR #4`
1. `codex/mvp-polish-and-release-readiness` 현재 브랜치의 최종 문서/릴리즈 정리 단계

이 구조는 각 단계가 앞 단계의 안정성을 전제로 쌓이도록 설계했습니다. 새 작업을 추가할 때도 먼저 `game-core`에서 규칙을 고정하고, 그 다음 UI와 렌더러를 얹는 순서를 유지하는 것이 좋습니다.

## 새로 기여할 때

- 게임 규칙을 바꿀 때는 먼저 `src/game-core/engine`과 `src/content`를 수정합니다.
- 화면을 바꿀 때는 `src/features`와 `src/game-renderer`를 먼저 봅니다.
- 저장 구조가 바뀌면 `src/persistence`와 관련 테스트를 같이 업데이트합니다.
- 새 데이터가 들어오면 `src/test/contentIntegrity.test.ts` 같은 무결성 테스트 패턴을 따릅니다.

## 현재 검증 기준

릴리즈 전에는 최소한 아래를 확인합니다.

- `yarn lint`
- `yarn typecheck`
- `yarn test`
- `yarn build`
- Toss WebView 세로형 화면에서 첫 진입, 온보딩, 저장 복구, 첫 고용, 프로세스 전환이 모두 되는지 확인

자세한 실무 체크는 [docs/release-checklist.md](docs/release-checklist.md)를 봅니다.
