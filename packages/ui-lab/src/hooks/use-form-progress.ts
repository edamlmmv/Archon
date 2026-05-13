import { useMemo } from 'react';

export interface FormProgressResult<TKey extends string> {
  completed: number;
  total: number;
  percent: number;
  missingKeys: TKey[];
}

function hasValue(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
}

export function useFormProgress<TKey extends string>(
  values: Record<TKey, unknown>,
  requiredKeys: readonly TKey[]
): FormProgressResult<TKey> {
  return useMemo(() => {
    const missingKeys = requiredKeys.filter(key => !hasValue(values[key]));
    const total = requiredKeys.length;
    const completed = total - missingKeys.length;
    const percent = total === 0 ? 100 : Math.round((completed / total) * 100);

    return {
      completed,
      total,
      percent,
      missingKeys,
    };
  }, [requiredKeys, values]);
}
