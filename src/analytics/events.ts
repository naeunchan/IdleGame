import type { ProcessMode } from '@/entities/process';

export type GameEventName =
  | 'change_process_mode'
  | 'hire_role'
  | 'upgrade_company_scale'
  | 'dismiss_onboarding';

export interface GameEventPayloadMap {
  change_process_mode: { mode: ProcessMode };
  hire_role: { roleId: 'designer' | 'pm' | 'architect' | 'qa' };
  upgrade_company_scale: { scaleId: string };
  dismiss_onboarding: { releases: number; employeeCount: number };
}

