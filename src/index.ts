import { checkEmail, checkEmailBulk, isDomainDisposable, extractDomain } from './checker';
import type { IsDisposableConfig, IsDisposableResult } from './types';

/**
 * Check if an email address is disposable (synchronous, offline).
 * Uses the bundled blocklist of 100k+ domains.
 */
export function isDisposable(email: string): boolean {
  return checkEmail(email);
}

/**
 * Check multiple emails at once (synchronous, offline).
 */
export function isDisposableBulk(emails: string[]): boolean[] {
  return checkEmailBulk(emails);
}

/**
 * Check if a domain is disposable (synchronous, offline).
 */
export { isDomainDisposable, extractDomain };

/**
 * Create an API client for enhanced disposable email detection.
 * Requires an API key from https://isdisposable.com
 */
export function createIsDisposable(config: IsDisposableConfig) {
  const {
    apiKey,
    apiUrl = 'https://api.isdisposable.com',
    timeout = 5000,
    cache = true,
    cacheTTL = 3600,
  } = config;

  const resultCache = new Map<string, { result: IsDisposableResult; expires: number }>();

  async function check(email: string): Promise<IsDisposableResult> {
    if (!email || typeof email !== 'string') {
      return {
        disposable: false,
        email,
        domain: '',
        score: 0,
        reason: 'invalid_email',
        cached: false,
      };
    }

    const normalized = email.trim().toLowerCase();

    // Check cache
    if (cache) {
      const cached = resultCache.get(normalized);
      if (cached && cached.expires > Date.now()) {
        return { ...cached.result, cached: true };
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(`${apiUrl}/api/v1/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || '',
        },
        body: JSON.stringify({ email: normalized }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        // Fallback to offline check
        return offlineFallback(normalized);
      }

      const result: IsDisposableResult = await res.json();

      // Cache result
      if (cache) {
        resultCache.set(normalized, {
          result,
          expires: Date.now() + cacheTTL * 1000,
        });
      }

      return { ...result, cached: false };
    } catch {
      // Network error — fallback to offline
      return offlineFallback(normalized);
    }
  }

  async function checkBulk(emails: string[]): Promise<IsDisposableResult[]> {
    if (!Array.isArray(emails) || emails.length === 0) return [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(`${apiUrl}/api/v1/check/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || '',
        },
        body: JSON.stringify({ emails }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return emails.map((email) => offlineFallback(email.trim().toLowerCase()));
      }

      return res.json();
    } catch {
      return emails.map((email) => offlineFallback(email.trim().toLowerCase()));
    }
  }

  function clearCache() {
    resultCache.clear();
  }

  return { check, checkBulk, clearCache };
}

function offlineFallback(email: string): IsDisposableResult {
  const domain = extractDomain(email);
  const disposable = domain ? isDomainDisposable(domain) : false;

  return {
    disposable,
    email,
    domain: domain || '',
    score: disposable ? 95 : 5,
    reason: disposable ? 'blocklist_match' : 'offline_fallback',
    cached: false,
  };
}

// Re-export types
export type { IsDisposableConfig, IsDisposableResult, SimpleResult, DetailedResult } from './types';
