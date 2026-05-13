import type { NodeOutput } from './schemas';

export function stringifyNodeOutputValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null || Array.isArray(value) || typeof value === 'object') {
    return JSON.stringify(value);
  }
  return '';
}

export type NodeOutputFieldResolution =
  | { source: 'structuredOutput'; value: string; rawValue: unknown }
  | { source: 'json'; value: string; rawValue: unknown }
  | { source: 'empty'; value: string; rawValue: undefined }
  | { source: 'parse-error'; value: string; error: unknown };

export function resolveNodeOutputField(
  nodeOutput: NodeOutput,
  field: string
): NodeOutputFieldResolution {
  if ('structuredOutput' in nodeOutput && nodeOutput.structuredOutput !== undefined) {
    if (
      typeof nodeOutput.structuredOutput !== 'object' ||
      nodeOutput.structuredOutput === null ||
      Array.isArray(nodeOutput.structuredOutput)
    ) {
      return { source: 'structuredOutput', value: '', rawValue: undefined };
    }

    const value = (nodeOutput.structuredOutput as Record<string, unknown>)[field];
    return { source: 'structuredOutput', value: stringifyNodeOutputValue(value), rawValue: value };
  }

  if (!nodeOutput.output) return { source: 'empty', value: '', rawValue: undefined };

  try {
    const parsed = JSON.parse(nodeOutput.output) as Record<string, unknown>;
    const value = parsed[field];
    return { source: 'json', value: stringifyNodeOutputValue(value), rawValue: value };
  } catch (error) {
    return { source: 'parse-error', value: '', error };
  }
}
