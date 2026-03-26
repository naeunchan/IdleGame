export type MilestoneId =
  | 'steady-shipments'
  | 'first-team-huddle'
  | 'local-buzz'
  | 'toolchain-stack'
  | 'neighborhood-studio';

export type MilestoneRequirementType = 'projects' | 'team' | 'reputation' | 'upgrade-levels';

export interface MilestoneDefinition {
  id: MilestoneId;
  name: string;
  summary: string;
  requirementType: MilestoneRequirementType;
  targetValue: number;
  rewardLabel: string;
  unlocks: string[];
}
