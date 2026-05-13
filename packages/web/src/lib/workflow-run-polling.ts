import { isTerminalStatus } from './workflow-utils';
import type { WorkflowRunStatus } from './types';

export const WORKFLOW_RUN_REFETCH_INTERVAL_MS = 3000;

export interface WorkflowRunPollingData {
  workflowState?: {
    status?: WorkflowRunStatus;
  } | null;
}

export function getWorkflowRunRefetchInterval(
  data: WorkflowRunPollingData | null | undefined
): number | false {
  const status = data?.workflowState?.status;
  if (isTerminalStatus(status)) return false;
  return WORKFLOW_RUN_REFETCH_INTERVAL_MS;
}
