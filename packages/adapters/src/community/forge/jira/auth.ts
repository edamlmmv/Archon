/**
 * Jira Cloud adapter auth and configuration helpers.
 */
import { timingSafeEqual } from 'crypto';

export function parseAllowedAccountIds(envValue: string | undefined): string[] {
  if (!envValue || envValue.trim() === '') return [];
  return envValue
    .split(',')
    .map(accountId => accountId.trim())
    .filter(accountId => accountId !== '');
}

export function isJiraAccountAuthorized(
  accountId: string | undefined,
  allowedAccountIds: readonly string[]
): boolean {
  if (allowedAccountIds.length === 0) return true;
  if (!accountId || accountId.trim() === '') return false;
  return allowedAccountIds.includes(accountId);
}

export function verifyWebhookToken(
  receivedToken: string | undefined,
  expectedSecret: string
): boolean {
  if (!receivedToken || !expectedSecret) return false;
  const received = Buffer.from(receivedToken);
  const expected = Buffer.from(expectedSecret);
  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}

export function parseProjectCodebaseMap(envValue: string | undefined): Record<string, string> {
  if (!envValue || envValue.trim() === '') return {};

  const trimmed = envValue.trim();
  if (trimmed.startsWith('{')) {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('JIRA_PROJECT_CODEBASE_MAP must be a JSON object');
    }

    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`JIRA_PROJECT_CODEBASE_MAP value for ${key} must be a non-empty string`);
      }
      out[key.trim().toUpperCase()] = value.trim();
    }
    return out;
  }

  const out: Record<string, string> = {};
  for (const entry of trimmed.split(',')) {
    const separator = entry.includes('=') ? '=' : ':';
    const [rawKey, ...rawValueParts] = entry.split(separator);
    const key = rawKey?.trim().toUpperCase();
    const value = rawValueParts.join(separator).trim();
    if (!key || !value) {
      throw new Error('JIRA_PROJECT_CODEBASE_MAP entries must be KEY=value or a JSON object');
    }
    out[key] = value;
  }
  return out;
}
