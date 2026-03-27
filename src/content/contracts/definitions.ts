import type { GameState } from '@/entities/company';
import type { CompanyStats, ContractDefinitionId, ContractState } from '@/entities/contract';
import { createInitialCompanyStats } from '@/entities/contract';

export const CONTRACT_BOARD_SIZE = 3;

interface ContractDefinition {
  id: ContractDefinitionId;
  name: string;
  summary: string;
  unitLabel: string;
  getMetricValue: (state: Pick<GameState, 'completedProjects' | 'stats'>) => number;
  getTargetValue: (tier: number) => number;
  getRewardCash: (tier: number) => number;
  getRewardReputation: (tier: number) => number;
  getRewardFocus: (tier: number) => number;
}

export interface ContractProgress {
  contract: ContractState;
  definition: ContractDefinition;
  currentValue: number;
  progressValue: number;
  progressPercent: number;
  isComplete: boolean;
}

export const contractDefinitions: ContractDefinition[] = [
  {
    id: 'delivery-sprint',
    name: '배포 처리량',
    summary: '작은 작업을 연속으로 마감해 팀 처리량을 증명합니다.',
    unitLabel: '건',
    getMetricValue: (state) => state.completedProjects,
    getTargetValue: (tier) => 1 + Math.floor((tier - 1) / 2),
    getRewardCash: (tier) => 18 + (tier - 1) * 8,
    getRewardReputation: (tier) => 2 + Math.floor((tier - 1) / 2),
    getRewardFocus: () => 5,
  },
  {
    id: 'cashflow-cleanup',
    name: '현금 흐름 확보',
    summary: '새 현금을 벌어 스튜디오 운영 예산을 안정화합니다.',
    unitLabel: '원',
    getMetricValue: (state) => state.stats.totalCashEarned,
    getTargetValue: (tier) => 70 + (tier - 1) * 32,
    getRewardCash: (tier) => 14 + (tier - 1) * 7,
    getRewardReputation: (tier) => 1 + Math.floor((tier - 1) / 3),
    getRewardFocus: (tier) => 2 + Math.floor((tier - 1) / 2),
  },
  {
    id: 'reputation-pulse',
    name: '사용자 반응',
    summary: '제품 평판을 쌓아 다음 의뢰가 더 잘 이어지게 만듭니다.',
    unitLabel: '평판',
    getMetricValue: (state) => state.stats.totalReputationEarned,
    getTargetValue: (tier) => 4 + (tier - 1) * 2,
    getRewardCash: (tier) => 16 + (tier - 1) * 8,
    getRewardReputation: (tier) => 2 + Math.floor(tier / 2),
    getRewardFocus: () => 4,
  },
  {
    id: 'focus-routine',
    name: '집중 루틴',
    summary: '집중 세션을 소화해 당일 생산 흐름을 끌어올립니다.',
    unitLabel: '회',
    getMetricValue: (state) => state.stats.totalFocusSessions,
    getTargetValue: (tier) => 1 + Math.floor((tier - 1) / 2),
    getRewardCash: (tier) => 12 + (tier - 1) * 6,
    getRewardReputation: () => 1,
    getRewardFocus: (tier) => 8 + Math.floor((tier - 1) / 2) * 2,
  },
  {
    id: 'code-bundle',
    name: '코드 누적',
    summary: '코드를 꾸준히 쌓아 제품 산출물을 채웁니다.',
    unitLabel: 'code',
    getMetricValue: (state) => state.stats.totalCodeProduced,
    getTargetValue: (tier) => 100 + (tier - 1) * 38,
    getRewardCash: (tier) => 15 + (tier - 1) * 7,
    getRewardReputation: (tier) => 1 + Math.floor((tier - 1) / 2),
    getRewardFocus: () => 3,
  },
  {
    id: 'snack-route',
    name: '리프레시 루틴',
    summary: '짧은 휴식으로 집중 흐름을 관리해 작업 리듬을 맞춥니다.',
    unitLabel: '회',
    getMetricValue: (state) => state.stats.totalSnacksPurchased,
    getTargetValue: (tier) => 1 + Math.floor((tier - 1) / 2),
    getRewardCash: (tier) => 10 + (tier - 1) * 6,
    getRewardReputation: () => 1,
    getRewardFocus: (tier) => 10 + Math.floor((tier - 1) / 2) * 2,
  },
];

function getContractDefinition(definitionId: ContractDefinitionId) {
  const definition = contractDefinitions.find((item) => item.id === definitionId);

  if (!definition) {
    throw new Error(`Unknown contract definition: ${definitionId}`);
  }

  return definition;
}

function getContractTier(serial: number, completedProjects: number) {
  return Math.floor(serial / contractDefinitions.length) + 1 + Math.floor(completedProjects / 4);
}

export function createContractForSerial(
  serial: number,
  stats: CompanyStats = createInitialCompanyStats(),
  completedProjects = 0,
): ContractState {
  const definition = contractDefinitions[serial % contractDefinitions.length];
  const tier = getContractTier(serial, completedProjects);
  const metricValue = definition.getMetricValue({
    completedProjects,
    stats,
  });

  return {
    id: `${definition.id}-${serial}`,
    definitionId: definition.id,
    serial,
    tier,
    baselineValue: metricValue,
    targetValue: definition.getTargetValue(tier),
    rewardCash: definition.getRewardCash(tier),
    rewardReputation: definition.getRewardReputation(tier),
    rewardFocus: definition.getRewardFocus(tier),
  };
}

export function createInitialContractBoard(
  stats: CompanyStats = createInitialCompanyStats(),
  completedProjects = 0,
) {
  return Array.from({ length: CONTRACT_BOARD_SIZE }, (_, index) =>
    createContractForSerial(index, stats, completedProjects),
  );
}

export function getNextContractSerial(contractBoard: ContractState[] = []) {
  return contractBoard.reduce((maxSerial, contract) => Math.max(maxSerial, contract.serial + 1), 0);
}

export function getContractProgress(
  state: Pick<GameState, 'completedProjects' | 'stats'>,
  contract: ContractState,
): ContractProgress {
  const definition = getContractDefinition(contract.definitionId);
  const currentValue = definition.getMetricValue(state);
  const progressValue = Math.max(0, Math.min(contract.targetValue, currentValue - contract.baselineValue));
  const progressPercent = Math.min(100, (progressValue / contract.targetValue) * 100);

  return {
    contract,
    definition,
    currentValue,
    progressValue,
    progressPercent,
    isComplete: progressValue >= contract.targetValue,
  };
}
