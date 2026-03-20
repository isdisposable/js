import domains from './domains.json';
import wildcards from './wildcards.json';

const domainSet = new Set<string>(domains as string[]);
const wildcardList = wildcards as string[];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function extractDomain(email: string): string | null {
  if (!email || typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmed)) return null;
  const parts = trimmed.split('@');
  return parts[1] || null;
}

export function isDomainDisposable(domain: string): boolean {
  if (!domain) return false;
  const normalized = domain.toLowerCase().trim();

  // Direct match
  if (domainSet.has(normalized)) return true;

  // Wildcard match: check if domain or any parent matches a wildcard
  for (const pattern of wildcardList) {
    // Wildcards are like "*.example.com" — match the base domain and any subdomain
    const baseDomain = pattern.replace(/^\*\./, '');
    if (normalized === baseDomain || normalized.endsWith('.' + baseDomain)) {
      return true;
    }
  }

  return false;
}

export function checkEmail(email: string): boolean {
  const domain = extractDomain(email);
  if (!domain) return false;
  return isDomainDisposable(domain);
}

export function checkEmailBulk(emails: string[]): boolean[] {
  return emails.map(checkEmail);
}
