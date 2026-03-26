export type RoleId = 'founder' | 'designer' | 'pm' | 'architect' | 'qa';

export interface RoleDefinition {
  id: RoleId;
  name: string;
  lane: string;
  summary: string;
  productionBase: number;
  qualityBase: number;
  focusUse: number;
  teamBuffBase: number;
}
