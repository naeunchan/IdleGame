export type ProcessMode = 'waterfall' | 'spiral' | 'agile';

export interface ProcessModeDefinition {
  id: ProcessMode;
  name: string;
  summary: string;
  bonusLabel: string;
}

