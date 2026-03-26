export type ContractDefinitionId =
  | 'delivery-sprint'
  | 'cashflow-cleanup'
  | 'reputation-pulse'
  | 'focus-routine'
  | 'code-bundle'
  | 'snack-route';

export interface CompanyStats {
  totalCodeProduced: number;
  totalCashEarned: number;
  totalReputationEarned: number;
  totalFocusSessions: number;
  totalSnacksPurchased: number;
  totalHires: number;
  totalUpgradesPurchased: number;
  totalContractsCompleted: number;
}

export interface ContractState {
  id: string;
  definitionId: ContractDefinitionId;
  serial: number;
  tier: number;
  baselineValue: number;
  targetValue: number;
  rewardCash: number;
  rewardReputation: number;
  rewardFocus: number;
}

export function createInitialCompanyStats(): CompanyStats {
  return {
    totalCodeProduced: 0,
    totalCashEarned: 0,
    totalReputationEarned: 0,
    totalFocusSessions: 0,
    totalSnacksPurchased: 0,
    totalHires: 0,
    totalUpgradesPurchased: 0,
    totalContractsCompleted: 0,
  };
}
