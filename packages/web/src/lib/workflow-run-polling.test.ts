import { describe, expect, it } from 'bun:test';
import {
  getWorkflowRunRefetchInterval,
  WORKFLOW_RUN_REFETCH_INTERVAL_MS,
} from './workflow-run-polling';

describe('getWorkflowRunRefetchInterval', () => {
  it('keeps polling while query data is absent or incomplete', () => {
    expect(getWorkflowRunRefetchInterval(undefined)).toBe(WORKFLOW_RUN_REFETCH_INTERVAL_MS);
    expect(getWorkflowRunRefetchInterval(null)).toBe(WORKFLOW_RUN_REFETCH_INTERVAL_MS);
    expect(getWorkflowRunRefetchInterval({})).toBe(WORKFLOW_RUN_REFETCH_INTERVAL_MS);
    expect(getWorkflowRunRefetchInterval({ workflowState: null })).toBe(
      WORKFLOW_RUN_REFETCH_INTERVAL_MS
    );
    expect(getWorkflowRunRefetchInterval({ workflowState: {} })).toBe(
      WORKFLOW_RUN_REFETCH_INTERVAL_MS
    );
  });

  it('keeps polling non-terminal workflow runs', () => {
    expect(getWorkflowRunRefetchInterval({ workflowState: { status: 'pending' } })).toBe(
      WORKFLOW_RUN_REFETCH_INTERVAL_MS
    );
    expect(getWorkflowRunRefetchInterval({ workflowState: { status: 'running' } })).toBe(
      WORKFLOW_RUN_REFETCH_INTERVAL_MS
    );
    expect(getWorkflowRunRefetchInterval({ workflowState: { status: 'paused' } })).toBe(
      WORKFLOW_RUN_REFETCH_INTERVAL_MS
    );
  });

  it('stops polling terminal workflow runs', () => {
    expect(getWorkflowRunRefetchInterval({ workflowState: { status: 'completed' } })).toBe(false);
    expect(getWorkflowRunRefetchInterval({ workflowState: { status: 'failed' } })).toBe(false);
    expect(getWorkflowRunRefetchInterval({ workflowState: { status: 'cancelled' } })).toBe(false);
  });
});
