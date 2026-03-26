export interface ProjectTemplate {
  id: string;
  name: string;
  summary: string;
}

export const projectTemplates: ProjectTemplate[] = [
  {
    id: 'landing-page',
    name: '온보딩 랜딩 정리',
    summary: '첫 화면 카피와 흐름을 다듬는 작은 작업입니다.',
  },
  {
    id: 'reward-loop',
    name: '출석 보상 루프',
    summary: '매일 돌아오는 리워드 루프를 안정적으로 심습니다.',
  },
  {
    id: 'bug-board',
    name: '버그 게시판 정리',
    summary: '쌓여 있던 이슈를 분류하고 대응 루틴을 고칩니다.',
  },
  {
    id: 'event-kit',
    name: '봄 이벤트 키트',
    summary: '작은 시즌 이벤트와 장식 보상을 준비합니다.',
  },
  {
    id: 'deploy-ritual',
    name: '배포 의식 자동화',
    summary: '반복되던 수작업 배포 절차를 조금 더 편하게 만듭니다.',
  },
  {
    id: 'team-space',
    name: '공용 작업실 확장',
    summary: '사무실 동선을 정리하고 협업 공간을 넓힙니다.',
  },
];
